from app.models.chat_messages import ChatMessage
from app.services.chat_cache import delete_cached_messages, refresh_cached_messages
from app.services.session_data import _chat_message_to_dict
from app.utils.session_helpers import _parse_datetime, session_form_data
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError

from app.models.summaries import Summary
from app.services.summariser import build_doctor_summary, summarise_chat_transcript


MIN_TURNS = 3
MAX_TURNS = 10
URGENT_BUFFER = 2


VALID_ROLES = {"user", "assistant"}

def determine_chat_ended(turn_count: int, result) -> bool:
    max_allowed = MAX_TURNS + (URGENT_BUFFER if result.flag_urgent else 0)
    return (
        turn_count >= max_allowed
        or (turn_count >= MIN_TURNS and result.sufficient_info)
    )

def ai_content(message: dict) -> str:
    """The PII-masked text of a cached message, for sending to Azure OpenAI.
    Assistant messages have no masked copy: the AI wrote them from masked text."""
    return message.get("ai_content", message["content"])

def without_ai_content(messages: list) -> list:
    """Cached messages for the frontend: the masked copies are only for Azure OpenAI."""
    return [{k: v for k, v in m.items() if k != "ai_content"} for m in messages]

def build_ai_messages(context: dict, user_message: str) -> list:
    """user_message must already be masked."""
    return [
        {"role": "system", "content": context["system_prompt"]},
        *[{"role": m["role"], "content": ai_content(m)} for m in context["messages"]],
        {"role": "user", "content": user_message},
    ]

def persist_chat_messages(session, existing_messages, cached_messages, include_chat_notes=True) -> tuple[str, list, str | None]:
    """Returns (source, chat_message_dicts, summary_text). Handles all the DB/Redis logic.
    include_chat_notes=False leaves the chat out of the doctor's summary (the
    patient skipped the chat partway through); the messages are still saved."""
    if existing_messages:
        delete_cached_messages(session.id)
        return ("database", [_chat_message_to_dict(m) for m in existing_messages], session.summary.summary_text if session.summary else None)

    if not cached_messages:
        return ("redis", [], session.summary.summary_text if session.summary else None)

    chat_messages = [
        ChatMessage(
            session_id=session.id,
            role=m["role"],
            content=m["content"],
            created_at=_parse_datetime(m.get("created_at")),
        )
        for m in cached_messages
        if m.get("role") in VALID_ROLES and m.get("content")
    ]

    chat_notes = summarise_chat_transcript(cached_messages) if include_chat_notes else None
    form_data = session_form_data(session)
    summary_text = build_doctor_summary(session, form_data, chat_notes)

    try:
        db.session.bulk_save_objects(chat_messages)

        if session.summary:
            session.summary.summary_text = summary_text
        else:
            db.session.add(Summary(session_id=session.id, summary_text=summary_text, user_id=session.user_id))
            
        db.session.commit()
        delete_cached_messages(session.id)
    except SQLAlchemyError:
        db.session.rollback()
        refresh_cached_messages(session.id, cached_messages)
        raise

    return "database", cached_messages, summary_text