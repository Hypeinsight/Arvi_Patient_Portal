import json
from app.extensions import redis_client

TTL_SECONDS = 1800  # 30 min

def save_intake_data(session_id: str, form_data: dict):
    redis_client.setex(f"intake:{session_id}", TTL_SECONDS, json.dumps(form_data))

def get_intake_data(session_id: str) -> dict | None:
    raw = redis_client.get(f"intake:{session_id}")
    return json.loads(raw) if raw else None

def delete_intake_data(session_id: str):
    redis_client.delete(f"intake:{session_id}")