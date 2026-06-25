from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.session import IntakeSession
from app.services.flow import get_screen_order, get_progress

sessions_bp = Blueprint("sessions", __name__)

VALID_TYPES = {"guest", "new", "followup_lt12", "followup_gt12"}


@sessions_bp.post("/sessions")
def create_session(): # to create a new session for a patient which returns the screen list
    body           = request.get_json(silent=True) or {}
    patient_type   = body.get("patient_type")
    appointment_id = body.get("appointment_id")
    doctor_id      = body.get("doctor_id")

    if patient_type not in VALID_TYPES:
        return jsonify({"success": False, "message": "Invalid patient_type"}), 400

    session = IntakeSession(
        patient_type=patient_type,
        appointment_id=appointment_id,
        doctor_id=doctor_id,
    )
    db.session.add(session)
    db.session.commit()

    screens = get_screen_order(patient_type)

    return jsonify({
        "success":      True,
        "session_id":   str(session.id),
        "patient_type": patient_type,
        "screens":      screens,
        "expires_at":   session.expires_at.isoformat(),
    }), 201


@sessions_bp.get("/sessions/<uuid:session_id>")
def get_session(session_id): # to retrieve an existing session by its ID
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    screens  = get_screen_order(session.patient_type)
    progress = get_progress(session.patient_type, session.current_step or screens[0])

    return jsonify({
        "success":      True,
        "session":      session.to_dict(),
        "screens":      screens,
        "progress":     progress,
    }), 200


@sessions_bp.patch("/sessions/<uuid:session_id>/step")
def update_step(session_id): # to update the current step of an existing session
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    step = body.get("step")

    screens = get_screen_order(session.patient_type)
    if step not in screens:
        return jsonify({"success": False, "message": "Invalid step for this patient type"}), 400

    session.current_step = step
    db.session.commit()

    return jsonify({
        "success":  True,
        "step":     step,
        "progress": get_progress(session.patient_type, step),
    }), 200