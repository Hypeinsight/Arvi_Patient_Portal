import json
from datetime import datetime, timezone

from app import extensions

TTL_SECONDS = 60 * 60 * 2


def _key(session_id):
    return f"chat:{session_id}"


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_cached_messages(session_id):
    raw = extensions.redis_client.get(_key(session_id))
    return json.loads(raw) if raw else []


def append_cached_message(session_id, role, content):
    messages = get_cached_messages(session_id)
    message = {
        "role": role,
        "content": content,
        "created_at": _now_iso(),
    }
    messages.append(message)
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(messages))
    return message


def refresh_cached_messages(session_id, messages):
    extensions.redis_client.setex(_key(session_id), TTL_SECONDS, json.dumps(messages))


def delete_cached_messages(session_id):
    extensions.redis_client.delete(_key(session_id))
