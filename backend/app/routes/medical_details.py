from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.medical_details import MedicalDetails
from app.models.session import IntakeSession

medical_details_bp = Blueprint("medical_details", __name__)

MEDICAL_DETAILS_FIELDS = {
    "conditions",
    "medications",
    "allergies",
    "previous_surgeries",
    "family_history",
}

ARRAY_FIELDS = {"conditions", "medications", "allergies"}


def _as_list(value):
    if value is None:
        return None
    if isinstance(value, list):
        return value
    return [item.strip() for item in str(value).split(",") if item.strip()]


def _medical_details_to_dict(medical):
    return {
        "id": str(medical.id),
        "session_id": str(medical.session_id),
        "conditions": medical.conditions,
        "medications": medical.medications,
        "allergies": medical.allergies,
        "previous_surgeries": medical.previous_surgeries,
        "family_history": medical.family_history,
        "created_at": medical.created_at.isoformat(),
        "updated_at": medical.updated_at.isoformat(),
    }


def _medical_details_data_from_body(body):
    data = {
        field: body[field]
        for field in MEDICAL_DETAILS_FIELDS
        if field in body
    }
    for field in ARRAY_FIELDS:
        if field in data:
            data[field] = _as_list(data[field])
    return data


@medical_details_bp.post("/sessions/<uuid:session_id>/medical-details")
def create_medical_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    data = _medical_details_data_from_body(body)

    try:
        if session.medical_details:
            medical_details = session.medical_details
            for field, value in data.items():
                setattr(medical_details, field, value)
            status_code = 200
        else:
            medical_details = MedicalDetails(
                session_id=session.id,
                **data,
            )
            db.session.add(medical_details)
            status_code = 201

        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400
    
    return jsonify({
        "success": True,
        "medical_details": _medical_details_to_dict(medical_details),
    }), status_code


@medical_details_bp.get("/sessions/<uuid:session_id>/medical-details")
def read_medical_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.medical_details:
        return jsonify({"success": False, "message": "Medical details not found"}), 404

    return jsonify({
        "success": True,
        "medical_details": _medical_details_to_dict(session.medical_details),
    }), 200


@medical_details_bp.patch("/sessions/<uuid:session_id>/medical-details")
def update_medical_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.medical_details:
        return jsonify({"success": False, "message": "Medical details not found"}), 404

    body = request.get_json(silent=True) or {}
    for field, value in _medical_details_data_from_body(body).items():
        setattr(session.medical_details, field, value)

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "medical_details": _medical_details_to_dict(session.medical_details),
    }), 200
