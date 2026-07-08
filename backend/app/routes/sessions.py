from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.session import IntakeSession
from app.models.summaries import Summary
from app.models.user import User
from app.services.flow import get_screen_order
from app.services.session_data import session_form_data, session_to_dict, update_session_sections

sessions_bp = Blueprint("sessions", __name__)

VALID_PATIENT_TYPES = {"new", "guest", "followup_lt12", "followup_gt12"}


def _get_session_user(patient_type):
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()

    if user_id:
        if patient_type == "guest":
            return None, "Guest sessions must not include a user id"

        user = db.session.get(User, user_id)
        if not user:
            return None, "User not found"
        return user, None

    if patient_type != "guest":
        return None, "User id is required for this patient type"

    user = User(user_type="guest")
    db.session.add(user)
    db.session.flush()
    return user, None


@sessions_bp.post("/sessions")
def create_session():
    body = request.get_json(silent=True) or {}
    patient_type = body.get("patient_type")
    user_id = body.get("user_id")

    if patient_type not in VALID_PATIENT_TYPES:
        return jsonify({"success": False, "message": "Invalid patient type"}), 400

    try:
        if patient_type == "guest":
            user, error = _get_session_user(patient_type)
            if error:
                return jsonify({"success": False, "message": error}), 400
        else:
            if not user_id:
                return jsonify({"success": False, "message": "User id is required"}), 400
            user = db.session.get(User, user_id)
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404

        session = IntakeSession(
            user_id=user.id,
            patient_type=patient_type,
        )
        db.session.add(session)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 500

    screens = get_screen_order(patient_type)
    return jsonify({
        "success": True,
        "session_id": str(session.id),
        "user_id": str(user.id),
        "patient_type": patient_type,
        "screens": screens,
    }), 201


@sessions_bp.get("/sessions/<uuid:session_id>")
def read_session(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    return jsonify({
        "success": True,
        "session": session_to_dict(session, get_screen_order(session.patient_type)),
    }), 200


@sessions_bp.patch("/sessions/<uuid:session_id>")
def update_session(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    payload = body.get("form_data", body)

    try:
        update_session_sections(session, payload)
        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "session": session_to_dict(session, get_screen_order(session.patient_type)),
    }), 200