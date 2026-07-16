import json
from datetime import datetime, timezone

from app import extensions
from app.services.azure_openai import call_chat_model

TTL_SECONDS = 60 * 60 * 2


def _key(session_id):
    return f"chat:{session_id}"


def _now_iso():
    return datetime.now(timezone.utc).isoformat()

def init_chat_cache(session_id: str, system_prompt: str):
    result = call_chat_model([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Begin the conversation now."},
    ])

    payload = {
        "system_prompt": system_prompt,
        "messages": [
            {"role": "assistant", "content": result.question, "created_at": _now_iso()}
        ],
        "turn_count": 1,
    }
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(payload))

def get_chat_context(session_id: str) -> dict | None:
    """Returns full context (system_prompt + messages) to build AI payload."""
    raw = extensions.redis_client.get(_key(session_id))
    if not raw:
        return None
    return json.loads(raw)


def get_cached_messages(session_id: str) -> list:
    """Returns only the messages list — used for frontend display on refresh."""
    context = get_chat_context(session_id)
    if not context:
        return []
    return context.get("messages", [])


def append_cached_message(session_id: str, role: str, content: str) -> dict:
    """Appends a single message to the messages list and writes back to Redis."""
    context = get_chat_context(session_id) or {"system_prompt": "", "messages": []}
    message = {
        "role": role,
        "content": content,
        "created_at": _now_iso(),
    }
    context["messages"].append(message)
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(context))
    return message


def refresh_cached_messages(session_id: str, messages: list):
    """Replaces the messages list while preserving the system prompt."""
    context = get_chat_context(session_id) or {"system_prompt": "", "messages": []}
    context["messages"] = messages
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(context))


def delete_cached_messages(session_id):
    extensions.redis_client.delete(_key(session_id))


def set_turn_count(session_id: str, turn_count: int):
    context = get_chat_context(session_id) or {"system_prompt": "", "messages": []}
    context["turn_count"] = turn_count
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(context))
