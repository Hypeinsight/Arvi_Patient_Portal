from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.consent import ConsentRecord
from app.models.session import IntakeSession
from app.utils.session_helpers import _parse_datetime, _parse_bool, _consent_to_dict

consent_records_bp = Blueprint("consent_records", __name__)

def _consent_data_from_body(body, existing=None):
    return {
        "accepted_terms": _parse_bool(
            body.get("accepted_terms"),
            existing.accepted_terms if existing else False,
        ),
        "accepted_privacy": _parse_bool(
            body.get("accepted_privacy"),
            existing.accepted_privacy if existing else False,
        ),
        "consent_marketing": _parse_bool(
            body.get("consent_marketing"),
            existing.consent_marketing if existing else False,
        ),
        "consented_at": _parse_datetime(
            body.get("consented_at") or body.get("timestamp"),
        )
        if body.get("consented_at") or body.get("timestamp") or not existing
        else existing.consented_at,
    }

@consent_records_bp.post("/sessions/<uuid:session_id>/consent-record")
def create_consent_record(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if session.consent_record:
        return jsonify({"success": False, "message": "Consent record already exists"}), 409

    body = request.get_json(silent=True) or {}
    consent = ConsentRecord(
        session_id=session.id,
        **_consent_data_from_body(body),
    )

    try:
        db.session.add(consent)
        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "consent_record": _consent_to_dict(consent),
    }), 201


@consent_records_bp.get("/sessions/<uuid:session_id>/consent-record")
def read_consent_record(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.consent_record:
        return jsonify({"success": False, "message": "Consent record not found"}), 404

    return jsonify({
        "success": True,
        "consent_record": _consent_to_dict(session.consent_record),
    }), 200


@consent_records_bp.patch("/sessions/<uuid:session_id>/consent-record")
def update_consent_record(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.consent_record:
        return jsonify({"success": False, "message": "Consent record not found"}), 404

    body = request.get_json(silent=True) or {}
    for field, value in _consent_data_from_body(body, session.consent_record).items():
        setattr(session.consent_record, field, value)

    try:
        db.session.commit()
    except (SQLAlchemyError, ValueError) as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "consent_record": _consent_to_dict(session.consent_record),
    }), 200
