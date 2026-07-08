from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models.session import IntakeSession
from app.services.chat_cache import get_chat_context, append_cached_message
from app.services.azure_openai import call_chat_model

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/sessions/<uuid:session_id>/chat")
def chat(session_id):
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
    ai_messages = [
        {"role": "system", "content": context["system_prompt"]},
        *[{"role": m["role"], "content": m["content"]} for m in context["messages"]],
        {"role": "user", "content": user_message},
    ]

    # Call Azure OpenAI
    try:
        assistant_response = call_chat_model(ai_messages)
    except Exception as e:
        return jsonify({"success": False, "message": f"AI model error: {str(e)}"}), 500

    # Append both turns to Redis
    append_cached_message(str(session_id), "user", user_message)
    append_cached_message(str(session_id), "assistant", assistant_response)

    return jsonify({
        "success": True,
        "message": assistant_response,
    }), 200