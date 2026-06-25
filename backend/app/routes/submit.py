from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.session   import IntakeSession
from app.models.form_data import IntakeFormData
from app.models.summary   import IntakeSummary
from app.services.summariser  import build_summary
from app.services.doctor_api  import send_to_doctor

submit_bp = Blueprint("submit", __name__)


@submit_bp.post("/sessions/<uuid:session_id>/submit")
def submit(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    if session.status == "submitted":
        return jsonify({"success": False, "message": "Session already submitted"}), 409
    if session.status == "expired":
        return jsonify({"success": False, "message": "Session has expired"}), 410

    body = request.get_json(silent=True) or {}

    # 1. Save all form data in one write
    form_data = IntakeFormData(
        session_id  = session_id,
        personal    = body.get("personal"),
        medical     = body.get("medical"),
        referral    = body.get("referral"),
        consent     = body.get("consent"),
        appointment = body.get("appointment"),
        account     = body.get("account"),
    )
    db.session.add(form_data)

    # 2. Build doctor summary
    uploads      = session.uploads
    summary_text = build_summary(
        patient_type=session.patient_type,
        form_data=body,
        uploads=uploads,
    )

    summary = IntakeSummary(
        session_id=session_id,
        summary_text=summary_text,
    )
    db.session.add(summary)

    # 3. Mark session submitted
    session.status       = "submitted"
    session.submitted_at = datetime.utcnow()
    db.session.commit()

    # 4. Call doctor API — after commit so data is safe even if this fails
    try:
        api_response = send_to_doctor(
            doctor_id      = session.doctor_id,
            appointment_id = session.appointment_id,
            summary        = summary_text,
            upload_keys    = [u.storage_key for u in uploads],
        )
        summary.sent_to_api_at = datetime.utcnow()
        summary.api_response   = api_response
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Doctor API call failed for session {session_id}: {e}")

    return jsonify({
        "success":    True,
        "summary_id": str(summary.id),
    }), 200