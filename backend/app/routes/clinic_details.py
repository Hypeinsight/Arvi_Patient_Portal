from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.clinic_details import ClinicDetails
from app.models.session import IntakeSession

clinic_details_bp = Blueprint("clinic_details", __name__)

CLINIC_DETAILS_FIELDS = {
    "clinic_org_id",
    "clinic_name",
    "doctor_id",
    "doctor_name",
}


def _clinic_details_to_dict(clinic):
    return {
        "id": str(clinic.id),
        "session_id": str(clinic.session_id),
        "clinic_org_id": clinic.clinic_org_id,
        "clinic_name": clinic.clinic_name,
        "doctor_id": clinic.doctor_id,
        "doctor_name": clinic.doctor_name,
        "created_at": clinic.created_at.isoformat(),
        "updated_at": clinic.updated_at.isoformat(),
    }


def _clinic_details_data_from_body(body):
    return {
        field: body[field]
        for field in CLINIC_DETAILS_FIELDS
        if field in body
    }


@clinic_details_bp.post("/sessions/<uuid:session_id>/clinic-details")
def create_clinic_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    body = request.get_json(silent=True) or {}
    data = _clinic_details_data_from_body(body)

    try:
        if session.clinic_details:
            clinic_details = session.clinic_details
            for field, value in data.items():
                setattr(clinic_details, field, value)
            status_code = 200
        else:
            clinic_details = ClinicDetails(
                session_id=session.id,
                **data,
            )
            db.session.add(clinic_details)
            status_code = 201

        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "clinic_details": _clinic_details_to_dict(clinic_details),
    }), status_code


@clinic_details_bp.get("/sessions/<uuid:session_id>/clinic-details")
def read_clinic_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.clinic_details:
        return jsonify({"success": False, "message": "Clinic details not found"}), 404

    return jsonify({
        "success": True,
        "clinic_details": _clinic_details_to_dict(session.clinic_details),
    }), 200


@clinic_details_bp.patch("/sessions/<uuid:session_id>/clinic-details")
def update_clinic_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.clinic_details:
        return jsonify({"success": False, "message": "Clinic details not found"}), 404

    body = request.get_json(silent=True) or {}
    for field, value in _clinic_details_data_from_body(body).items():
        setattr(session.clinic_details, field, value)

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "clinic_details": _clinic_details_to_dict(session.clinic_details),
    }), 200
