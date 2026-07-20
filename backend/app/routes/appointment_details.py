from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.appointment import AppointmentDetails
from app.models.session import IntakeSession

appointment_details_bp = Blueprint("appointment_details", __name__)

VALID_APPOINTMENT_TYPES = {
    "new",
    "followup_lt12",
    "followup_gt12",
}

def _appointment_to_dict(appointment):
    return {
        "id": str(appointment.id),
        "session_id": str(appointment.session_id),
        "appointment_type": appointment.appointment_type,
        "created_at": appointment.created_at.isoformat(),
        "updated_at": appointment.updated_at.isoformat(),
    }


def _appointment_type_from_body(body):
    return body.get("appointment_type") or body.get("type")


def _appointment_type_error(session, appointment_type):
    if appointment_type not in VALID_APPOINTMENT_TYPES:
        return "Invalid appointment type"
    if session.patient_type == "new" and appointment_type != "new":
        return "You don't have an account"
    return None


@appointment_details_bp.post("/sessions/<uuid:session_id>/appointment-details")
def create_appointment_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if session.appointment_details:
        return jsonify({"success": False, "message": "Appointment details already exist"}), 409
    

    body = request.get_json(silent=True) or {}
    appointment_type = body.get("appointment_type")

    print(f"Received appointment_type: {appointment_type} for session_id: {session_id}")

    if error := _appointment_type_error(session, appointment_type):
        return jsonify({"success": False, "message": error}), 400

    appointment = AppointmentDetails(
        session_id=session.id,
        appointment_type=_appointment_type_from_body(body),
    )

    try:
        db.session.add(appointment)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "appointment_details": _appointment_to_dict(appointment),
    }), 201


@appointment_details_bp.get("/sessions/<uuid:session_id>/appointment-details")
def read_appointment_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.appointment_details:
        return jsonify({"success": False, "message": "Appointment details not found"}), 404

    return jsonify({
        "success": True,
        "appointment_details": _appointment_to_dict(session.appointment_details),
    }), 200


@appointment_details_bp.patch("/sessions/<uuid:session_id>/appointment-details")
def update_appointment_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.appointment_details:
        return jsonify({"success": False, "message": "Appointment details not found"}), 404

    body = request.get_json(silent=True) or {}
    appointment_type = _appointment_type_from_body(body)
    if appointment_type is not None:
        if error := _appointment_type_error(session, appointment_type):
            return jsonify({"success": False, "message": error}), 400
        session.appointment_details.appointment_type = appointment_type

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "appointment_details": _appointment_to_dict(session.appointment_details),
    }), 200
