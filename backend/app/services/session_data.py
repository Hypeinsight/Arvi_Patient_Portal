from datetime import date, datetime, timezone

from app.extensions import db
from app.models.appointment import AppointmentDetails
from app.models.chat_messages import ChatMessage
from app.models.consent import ConsentRecord
from app.models.medical_details import MedicalDetails
from app.models.patient_details import PatientProfile
from app.models.referral_details import ReferralDetails
from app.models.summaries import Summary


def _parse_date(value):
    if not value or isinstance(value, date):
        return value
    return date.fromisoformat(value[:10])


def _parse_datetime(value):
    if not value or isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _as_list(value):
    if value is None:
        return None
    if isinstance(value, list):
        return value
    return [item.strip() for item in str(value).split(",") if item.strip()]


def _upsert_one(session, relationship_name, model_class, data):
    record = getattr(session, relationship_name)
    if record is None:
        record = model_class(session_id=session.id)
        db.session.add(record)
        setattr(session, relationship_name, record)
    for field, value in data.items():
        setattr(record, field, value)
    return record


def update_session_sections(session, payload):
    if not payload:
        return

    if appointment := payload.get("appointment"):
        _upsert_one(
            session,
            "appointment_details",
            AppointmentDetails,
            {"appointment_type": appointment.get("appointment_type") or appointment.get("type")},
        )

    if consent := payload.get("consent"):
        _upsert_one(
            session,
            "consent_record",
            ConsentRecord,
            {
                "accepted_terms": bool(consent.get("accepted_terms")),
                "accepted_privacy": bool(consent.get("accepted_privacy")),
                "consent_marketing": bool(consent.get("consent_marketing")),
                "consented_at": _parse_datetime(consent.get("consented_at") or consent.get("timestamp"))
                or datetime.now(timezone.utc),
            },
        )

    if personal := payload.get("personal"):
        _upsert_one(
            session,
            "patient_profile",
            PatientProfile,
            {
                "first_name": personal.get("first_name"),
                "last_name": personal.get("last_name"),
                "date_of_birth": _parse_date(personal.get("date_of_birth")),
                "gender": personal.get("gender"),
                "phone": personal.get("phone"),
                "email": personal.get("email"),
                "address": personal.get("address"),
                "emergency_contact_name": personal.get("emergency_contact_name"),
                "emergency_contact_number": personal.get("emergency_contact_number"),
            },
        )

    if medical := payload.get("medical"):
        _upsert_one(
            session,
            "medical_details",
            MedicalDetails,
            {
                "conditions": _as_list(medical.get("conditions")),
                "medications": _as_list(medical.get("medications")),
                "allergies": _as_list(medical.get("allergies")),
                "previous_surgeries": medical.get("previous_surgeries"),
                "family_history": medical.get("family_history"),
            },
        )

    if referral := payload.get("referral"):
        _upsert_one(
            session,
            "referral_details",
            ReferralDetails,
            {
                "has_referral": bool(referral.get("has_referral")),
            },
        )

    for message in payload.get("chat_messages", []) or []:
        if message.get("role") and message.get("content"):
            db.session.add(
                ChatMessage(
                    session_id=session.id,
                    role=message["role"],
                    content=message["content"],
                )
            )

    if summary_text := payload.get("summary_text"):
        _upsert_one(
            session,
            "summary",
            Summary,
            {
                "summary_text": summary_text,
                "sent_at": _parse_datetime(payload.get("sent_at")),
            },
        )

    session.last_activity_at = datetime.now(timezone.utc)


def session_form_data(session):
    return {
        "appointment": _appointment_to_dict(session.appointment_details),
        "consent": _consent_to_dict(session.consent_record),
        "personal": _patient_to_dict(session.patient_profile),
        "medical": _medical_to_dict(session.medical_details),
        "referral": _referral_to_dict(session.referral_details),
    }


def session_to_dict(session, screens=None):
    data = session.to_dict()
    data["screens"] = screens
    data["form_data"] = session_form_data(session)
    data["chat_messages"] = [_chat_message_to_dict(message) for message in session.chat_messages]
    data["summary"] = _summary_to_dict(session.summary)
    return data


def _iso(value):
    return value.isoformat() if value else None


def _appointment_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "type": record.appointment_type,
        "appointment_type": record.appointment_type,
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }


def _consent_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "accepted_terms": record.accepted_terms,
        "accepted_privacy": record.accepted_privacy,
        "consent_marketing": record.consent_marketing,
        "consented_at": _iso(record.consented_at),
    }


def _patient_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "first_name": record.first_name,
        "last_name": record.last_name,
        "date_of_birth": _iso(record.date_of_birth),
        "gender": record.gender,
        "phone": record.phone,
        "email": record.email,
        "address": record.address,
        "emergency_contact_name": record.emergency_contact_name,
        "emergency_contact_number": record.emergency_contact_number,
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }


def _medical_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "conditions": record.conditions,
        "medications": record.medications,
        "allergies": record.allergies,
        "previous_surgeries": record.previous_surgeries,
        "family_history": record.family_history,
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }


def _referral_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "has_referral": record.has_referral,
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }


def _chat_message_to_dict(record):
    return {
        "id": str(record.id),
        "role": record.role,
        "content": record.content,
        "created_at": _iso(record.created_at),
    }


def _summary_to_dict(record):
    if not record:
        return None
    return {
        "id": str(record.id),
        "summary_text": record.summary_text,
        "sent_at": _iso(record.sent_at),
        "created_at": _iso(record.created_at),
    }
