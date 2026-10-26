from datetime import datetime, timezone

import requests

from app.extensions import db
from app.services.doctor_api import DoctorApiNotConfigured, send_to_doctor
from app.services.session_data import session_form_data


# Only the details ARVI needs to identify the patient. Address and emergency
# contact stay in the portal
PATIENT_FIELDS = ("first_name", "last_name", "date_of_birth", "gender", "phone", "email")


def build_intake_payload(session) -> dict:
    form_data = session_form_data(session)
    personal = form_data["personal"] or {}
    return {
        # ARVI should treat this as an idempotency key so a retry never
        # creates a second patient or intake
        "intake_session_id": str(session.id),
        "organization_id": session.organization_id,
        "doctor_id": session.doctor_id,
        "patient_type": session.patient_type,
        "appointment_type": (form_data["appointment"] or {}).get("appointment_type"),
        "patient": {field: personal.get(field) for field in PATIENT_FIELDS},
        "medical": form_data["medical"],
        "referral": form_data["referral"],
        "summary": session.summary.summary_text if session.summary else None,
        "submitted_at": session.submitted_at.isoformat() if session.submitted_at else None,
        "documents": [],
    }


def deliver_to_arvi(session) -> bool:
    """Sends a submitted intake to the chosen doctor and records the outcome.

    Never raises for ARVI failures: the patient's submission is already saved,
    so a failed delivery is stored on the session and can be retried.
    """
    if session.delivery_status == "sent":
        return True

    if not session.organization_id or not session.doctor_id:
        session.delivery_status = "failed"
        session.delivery_error = "No clinic or doctor selected"
        db.session.commit()
        return False

    try:
        result = send_to_doctor(build_intake_payload(session))
    except (DoctorApiNotConfigured, requests.RequestException, ValueError) as exc:
        session.delivery_status = "failed"
        session.delivery_error = str(exc)[:2000]
        db.session.commit()
        return False

    now = datetime.now(timezone.utc)
    session.delivery_status = "sent"
    session.delivery_error = None
    session.delivered_at = now
    session.arvi_reference = str(result.get("reference")) if result.get("reference") else None
    if session.summary:
        session.summary.sent_at = now
    db.session.commit()
    return True
