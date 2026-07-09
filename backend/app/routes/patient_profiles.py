from datetime import date

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.patient_details import PatientProfile
from app.models.session import IntakeSession

patient_profiles_bp = Blueprint("patient_profiles", __name__)

PATIENT_PROFILE_FIELDS = {
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "phone",
    "email",
    "address",
    "emergency_contact_name",
    "emergency_contact_number",
}


def _parse_date(value):
    if not value or isinstance(value, date):
        return value
    return date.fromisoformat(value[:10])


def _patient_profile_to_dict(profile):
    return {
        "id": str(profile.id),
        "session_id": str(profile.session_id),
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "date_of_birth": profile.date_of_birth.isoformat()
        if profile.date_of_birth
        else None,
        "gender": profile.gender,
        "phone": profile.phone,
        "email": profile.email,
        "address": profile.address,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_number": profile.emergency_contact_number,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }


def _patient_profile_data_from_body(body):
    data = {
        field: body[field]
        for field in PATIENT_PROFILE_FIELDS
        if field in body
    }
    if "date_of_birth" in data:
        data["date_of_birth"] = _parse_date(data["date_of_birth"])
    return data


@patient_profiles_bp.post("/sessions/<uuid:session_id>/patient-profile")
def create_patient_profile(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    data = _patient_profile_data_from_body(body)
 
    try:
        if session.patient_profile:
            profile = session.patient_profile
            for field, value in data.items():
                setattr(profile, field, value)
            status_code = 200
        else:
            profile = PatientProfile(session_id=session.id, **data)
            db.session.add(profile)
            status_code = 201
 
        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400
 
    return jsonify({
        "success": True,
        "patient_profile": _patient_profile_to_dict(profile),
    }), status_code


@patient_profiles_bp.get("/sessions/<uuid:session_id>/patient-profile")
def read_patient_profile(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.patient_profile:
        return jsonify({"success": False, "message": "Patient profile not found"}), 404

    return jsonify({
        "success": True,
        "patient_profile": _patient_profile_to_dict(session.patient_profile),
    }), 200


@patient_profiles_bp.patch("/sessions/<uuid:session_id>/patient-profile")
def update_patient_profile(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.patient_profile:
        return jsonify({"success": False, "message": "Patient profile not found"}), 404

    body = request.get_json(silent=True) or {}
    for field, value in _patient_profile_data_from_body(body).items():
        setattr(session.patient_profile, field, value)

    try:
        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "patient_profile": _patient_profile_to_dict(session.patient_profile),
    }), 200
