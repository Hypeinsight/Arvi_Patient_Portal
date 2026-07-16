from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.chat_messages import ChatMessage
from app.models.session import IntakeSession
from app.services.chat_cache import (
    append_cached_message,
    delete_cached_messages,
    get_cached_messages,
    refresh_cached_messages,
)

chat_messages_bp = Blueprint("chat_messages", __name__)

VALID_ROLES = {"user", "assistant"}


# def _chat_message_to_dict(message):
#     return {
#         "id": str(message.id) if getattr(message, "id", None) else None,
#         "session_id": str(message.session_id) if getattr(message, "session_id", None) else None,
#         "role": message.role if isinstance(message, ChatMessage) else message["role"],
#         "content": message.content if isinstance(message, ChatMessage) else message["content"],
#         "created_at": (
#             message.created_at.isoformat()
#             if isinstance(message, ChatMessage)
#             else message["created_at"]
#         ),
#     }


# @chat_messages_bp.post("/sessions/<uuid:session_id>/chat-messages") # New endpoint to create a chat message and append it to the cache
# def create_chat_message(session_id):
#     session = db.session.get(IntakeSession, session_id)
#     if not session:
#         return jsonify({"success": False, "message": "Session not found"}), 404

#     body = request.get_json(silent=True) or {}
#     role = body.get("role")
#     content = body.get("content")

#     if role not in VALID_ROLES:
#         return jsonify({"success": False, "message": "Invalid chat role"}), 400
#     if not content:
#         return jsonify({"success": False, "message": "Message content is required"}), 400

#     message = append_cached_message(session_id, role, content) # Append the new message to the Redis cache

#     return jsonify({
#         "success": True,
#         "chat_message": message,
#     }), 201


# @chat_messages_bp.get("/sessions/<uuid:session_id>/chat-messages") # New endpoint to read chat messages, first checking Redis cache, then falling back to the database
# def read_chat_messages(session_id):
#     session = db.session.get(IntakeSession, session_id)
#     if not session:
#         return jsonify({"success": False, "message": "Session not found"}), 404

#     # Check Redis for messages first
#     cached_messages = get_cached_messages(session_id) # Retrieve cached messages from Redis
#     if cached_messages:
#         return jsonify({
#             "success": True,
#             "source": "redis",
#             "chat_messages": cached_messages,
#         }), 200

#     # If no messages are found in Redis, query the database
#     db_messages = (
#         ChatMessage.query
#         .filter_by(session_id=session.id)
#         .order_by(ChatMessage.created_at.asc())
#         .all()
#     )

#     return jsonify({
#         "success": True,
#         "source": "database",
#         "chat_messages": [_chat_message_to_dict(message) for message in db_messages],
#     }), 200


# @chat_messages_bp.post("/sessions/<uuid:session_id>/chat-messages/flush") # New endpoint to flush chat messages from Redis to the database
# def flush_chat_messages(session_id):
#     session = db.session.get(IntakeSession, session_id)
#     if not session:
#         return jsonify({"success": False, "message": "Session not found"}), 404

#     existing_messages = (
#         ChatMessage.query
#         .filter_by(session_id=session.id)
#         .order_by(ChatMessage.created_at.asc())
#         .all()
#     )

#     # Delete cached messages if the messages are persisted
#     if existing_messages:
#         delete_cached_messages(session_id)
#         return jsonify({
#             "success": True,
#             "source": "database",
#             "persisted_count": len(existing_messages),
#             "chat_messages": [_chat_message_to_dict(message) for message in existing_messages],
#         }), 200

#     cached_messages = get_cached_messages(session_id)
#     if not cached_messages:
#         return jsonify({
#             "success": True,
#             "source": "redis",
#             "persisted_count": 0,
#             "chat_messages": [],
#         }), 200

#     chat_messages = [
#         ChatMessage(
#             session_id=session.id,
#             role=message["role"],
#             content=message["content"],
#             created_at=_parse_datetime(message.get("created_at")),
#         )
#         for message in cached_messages
#         if message.get("role") in VALID_ROLES and message.get("content")
#     ]

#     # Bulk saveif there are messages in chat
#     try:
#         db.session.bulk_save_objects(chat_messages)
#         db.session.commit()
#         delete_cached_messages(session_id)
#     except SQLAlchemyError as exc:
#         db.session.rollback()
#         refresh_cached_messages(session_id, cached_messages)
#         return jsonify({"success": False, "message": str(exc)}), 400

#     return jsonify({
#         "success": True,
#         "source": "database",
#         "persisted_count": len(chat_messages),
#         "chat_messages": cached_messages,
#     }), 201
