import json

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.session import IntakeSession
from app.services.chat_cache import TTL_SECONDS, _key, get_cached_messages, get_chat_context, append_cached_message, init_chat_cache, set_turn_count
from app.services.azure_openai import call_chat_model
from app.models.chat_messages import ChatMessage
from app.utils.session_helpers import _chat_message_to_dict
from app.models.summaries import Summary
from app.services.prompt_builder import build_chat_system_prompt
from app.services.session_data import session_form_data
from app.services.summariser import build_doctor_summary
from app.utils.session_helpers import _parse_datetime
from app.services.chat_cache import delete_cached_messages, get_cached_messages, refresh_cached_messages
from app.services.chat import build_ai_messages, determine_chat_ended, persist_chat_messages

chat_bp = Blueprint("chat", __name__)

MIN_TURNS = 3
MAX_TURNS = 8
URGENT_BUFFER = 2

@chat_bp.post("/sessions/<uuid:session_id>/chat")
def create_chat_message(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    user_message = (body.get("message") or "").strip()
    if not user_message:
        return jsonify({"success": False, "message": "Message is required"}), 400

    # Fetch full context from Redis
    context = get_chat_context(str(session_id))
    if not context:
        return jsonify({"success": False, "message": "Chat session not initialized. Please complete the form first."}), 404

    # Build AI payload — system prompt + all previous messages + new user message
    ai_messages = build_ai_messages(context, user_message)  # This line is redundant since ai_messages is already built above

    # Call Azure OpenAI
    try:
        result = call_chat_model(ai_messages)
        # assistant_response = call_chat_model(ai_messages)
    except Exception as e:
        return jsonify({"success": False, "message": f"AI model error: {str(e)}"}), 500

    # Determine whether the conversation should end
    turn_count = context.get("turn_count", 0) + 1
    chat_ended = determine_chat_ended(turn_count, result)

    # Append both turns to Redis (content is always the plain question string)
    append_cached_message(str(session_id), "user", user_message)
    append_cached_message(str(session_id), "assistant", result.question)

    # Persist turn_count alongside the rest of the context
    set_turn_count(str(session_id), turn_count)

    return jsonify({
        "success": True,
        "message": result.question,
        "chat_ended": chat_ended
    }), 200


@chat_bp.get("/sessions/<uuid:session_id>/chat") # New endpoint to read chat messages, first checking Redis cache, then falling back to the database
def read_chat_messages(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    # Check Redis for messages first
    cached_messages = get_cached_messages(session_id) # Retrieve cached messages from Redis
    if cached_messages:
        return jsonify({
            "success": True,
            "source": "redis",
            "chat_messages": cached_messages,
        }), 200

    # If no messages are found in Redis, query the database
    db_messages = (
        ChatMessage.query
        .filter_by(session_id=session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return jsonify({
        "success": True,
        "source": "database",
        "chat_messages": [_chat_message_to_dict(message) for message in db_messages],
    }), 200


@chat_bp.post("/sessions/<uuid:session_id>/chat/summary") # New endpoint to prepare a summary for the doctor, and initialize the chat session in Redis
def prepare_summary(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    form_data = session_form_data(session)

    previous_summary = (
        Summary.query
        .filter(Summary.user_id == session.user_id, Summary.session_id != session.id)
        .order_by(Summary.created_at.desc())
        .first()
    )

    summary_text = build_doctor_summary(
        session=session,
        form_data=form_data,
        previous_summary=previous_summary.summary_text if previous_summary else None,
    )

    try:
        if session.summary:
            session.summary.summary_text = summary_text
            session.summary.user_id = session.user_id
        else:
            db.session.add(Summary(
                session_id=session.id,
                summary_text=summary_text,
                user_id=session.user_id
            ))
        db.session.commit()

        system_prompt = build_chat_system_prompt(
            form_data, 
            previous_summary=previous_summary.summary_text if previous_summary else None, 
            patient_type=session.patient_type
        )
        init_chat_cache(str(session_id), system_prompt)
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 500

    return jsonify({
        "success": True,
        "summary": summary_text,
    }), 200


@chat_bp.post("/sessions/<uuid:session_id>/chat/submit") # New endpoint to flush chat messages from Redis to the database
def flush_chat_messages(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    existing_messages = (
        ChatMessage.query
        .filter_by(session_id=session.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    cached_messages = get_cached_messages(session_id)

    try:
        source, chat_messages, summary_text = persist_chat_messages(session, existing_messages, cached_messages)
    except SQLAlchemyError as exc:
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "source": source,
        "persisted_count": len(chat_messages),
        "chat_messages": chat_messages,
        "summary": summary_text,
    }), 201 if source == "database" and cached_messages else 200

    # Delete cached messages if the messages are persisted
    # if existing_messages:
    #     delete_cached_messages(session_id)
    #     return jsonify({
    #         "success": True,
    #         "source": "database",
    #         "persisted_count": len(existing_messages),
    #         "chat_messages": [_chat_message_to_dict(message) for message in existing_messages],
    #     }), 200

    # cached_messages = get_cached_messages(session_id)
    # if not cached_messages:
    #     return jsonify({
    #         "success": True,
    #         "source": "redis",
    #         "persisted_count": 0,
    #         "chat_messages": [],
    #     }), 200

    # chat_messages = [
    #     ChatMessage(
    #         session_id=session.id,
    #         role=message["role"],
    #         content=message["content"],
    #         created_at=_parse_datetime(message.get("created_at")),
    #     )
    #     for message in cached_messages
    #     if message.get("role") in VALID_ROLES and message.get("content")
    # ]

    # # Bulk save if there are messages in chat
    # try:
    #     db.session.bulk_save_objects(chat_messages)
    #     db.session.commit()
    #     delete_cached_messages(session_id)
    # except SQLAlchemyError as exc:
    #     db.session.rollback()
    #     refresh_cached_messages(session_id, cached_messages)
    #     return jsonify({"success": False, "message": str(exc)}), 400

    # return jsonify({
    #     "success": True,
    #     "source": "database",
    #     "persisted_count": len(chat_messages),
    #     "chat_messages": cached_messages,
    # }), 201