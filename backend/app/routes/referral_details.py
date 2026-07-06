from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.referral_details import ReferralDetails
from app.models.session import IntakeSession

referral_details_bp = Blueprint("referral_details", __name__)


def _parse_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "y"}
    return bool(value)


def _referral_details_to_dict(referral):
    return {
        "id": str(referral.id),
        "session_id": str(referral.session_id),
        "has_referral": referral.has_referral,
        "created_at": referral.created_at.isoformat(),
        "updated_at": referral.updated_at.isoformat(),
    }


def _referral_details_data_from_body(body, existing=None):
    return {
        "has_referral": _parse_bool(
            body.get("has_referral"),
            existing.has_referral if existing else False,
        ),
    }


@referral_details_bp.post("/sessions/<uuid:session_id>/referral-details")
def create_referral_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if session.referral_details:
        return jsonify({"success": False, "message": "Referral details already exist"}), 409

    body = request.get_json(silent=True) or {}
    referral = ReferralDetails(
        session_id=session.id,
        **_referral_details_data_from_body(body),
    )

    try:
        db.session.add(referral)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "referral_details": _referral_details_to_dict(referral),
    }), 201


@referral_details_bp.get("/sessions/<uuid:session_id>/referral-details")
def read_referral_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.referral_details:
        return jsonify({"success": False, "message": "Referral details not found"}), 404

    return jsonify({
        "success": True,
        "referral_details": _referral_details_to_dict(session.referral_details),
    }), 200


@referral_details_bp.patch("/sessions/<uuid:session_id>/referral-details")
def update_referral_details(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    if not session.referral_details:
        return jsonify({"success": False, "message": "Referral details not found"}), 404

    body = request.get_json(silent=True) or {}
    for field, value in _referral_details_data_from_body(body, session.referral_details).items():
        setattr(session.referral_details, field, value)

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({
        "success": True,
        "referral_details": _referral_details_to_dict(session.referral_details),
    }), 200
