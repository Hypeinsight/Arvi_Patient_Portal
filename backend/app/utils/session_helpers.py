from datetime import datetime, date

from app.models.chat_messages import ChatMessage

def session_form_data(session) -> dict:
    return {
        "appointment": _appointment_to_dict(session.appointment_details),
        "personal":    _patient_to_dict(session.patient_profile),
        "medical":     _medical_to_dict(session.medical_details),
        "referral":    _referral_to_dict(session.referral_details),
    }


def _iso(value) -> str | None:
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)

def _consent_to_dict(consent):
    return {
        "id": str(consent.id),
        "session_id": str(consent.session_id),
        "accepted_terms": consent.accepted_terms,
        "accepted_privacy": consent.accepted_privacy,
        "consent_marketing": consent.consent_marketing,
        "consented_at": consent.consented_at.isoformat(),
    }


def _appointment_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "appointment_type": record.appointment_type,
    }


def _patient_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "first_name":               record.first_name,
        "last_name":                record.last_name,
        "date_of_birth":            _iso(record.date_of_birth),
        "gender":                   record.gender,
        "phone":                    record.phone,
        "email":                    record.email,
        "address":                  record.address,
        "emergency_contact_name":   record.emergency_contact_name,
        "emergency_contact_number": record.emergency_contact_number,
    }


def _medical_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "conditions":         record.conditions,
        "medications":        record.medications,
        "allergies":          record.allergies,
        "previous_surgeries": record.previous_surgeries,
        "family_history":     record.family_history,
    }


def _referral_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "has_referral": record.has_referral,
    }


def _parse_datetime(value):
    if not value:
        return datetime.now(datetime.timezone.utc)
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value.replace("Z", "+00:00"))

def _parse_date(value):
    if not value or isinstance(value, date):
        return value
    return date.fromisoformat(value[:10])

def _chat_message_to_dict(message):
    return {
        "id": str(message.id) if getattr(message, "id", None) else None,
        "session_id": str(message.session_id) if getattr(message, "session_id", None) else None,
        "role": message.role if isinstance(message, ChatMessage) else message["role"],
        "content": message.content if isinstance(message, ChatMessage) else message["content"],
        "created_at": (
            message.created_at.isoformat()
            if isinstance(message, ChatMessage)
            else message["created_at"]
        ),
    }

def _parse_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "y"}
    return bool(value)

