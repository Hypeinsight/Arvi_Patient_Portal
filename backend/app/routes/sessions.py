import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.appointment import AppointmentDetails
from app.models.patient_details import PatientProfile
from app.models.session import IntakeSession
from app.models.summaries import Summary
from app.models.user import User
from app.services.delivery import deliver_to_arvi
from app.services.doctor_api import DoctorApiNotConfigured, list_clinics, list_doctors
from app.services.flow import get_screen_order
from app.services.session_data import session_form_data, session_to_dict, update_session_sections

sessions_bp = Blueprint("sessions", __name__)

VALID_PATIENT_TYPES = {"pending", "new", "guest", "followup_lt12", "followup_gt12"}


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
            is_new_account = False
        else:
            verify_jwt_in_request()
            token_user_id = get_jwt_identity()
            if patient_type != "pending":
                return jsonify({"success": False, "message": "Registered sessions must use a pending patient type"}), 400
            if user_id and str(user_id) != str(token_user_id):
                return jsonify({"success": False, "message": "User id does not match token"}), 403
            user = db.session.get(User, token_user_id)
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            has_prior_intake = (
                IntakeSession.query
                .filter_by(user_id=user.id)
                .filter(IntakeSession.patient_type != "pending")
                .first()
                is not None
            )
            is_new_account = not has_prior_intake

            # A new account can only book as a new patient, so skip the
            # appointment type screen and assign it straight away
            if is_new_account:
                patient_type = "new"

        session = IntakeSession(
            user_id=user.id,
            patient_type=patient_type,
            is_new_account=is_new_account,
        )
        db.session.add(session)
        if patient_type == "new":
            session.appointment_details = AppointmentDetails(appointment_type="new")
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
        "is_new_account": session.is_new_account,
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


@sessions_bp.get("/clinics")
def read_clinics():
    try:
        clinics = list_clinics()
    except (DoctorApiNotConfigured, requests.RequestException) as exc:
        return jsonify({"success": False, "message": f"Could not load clinics: {exc}"}), 502
    return jsonify({"success": True, "clinics": clinics}), 200


@sessions_bp.get("/clinics/<organization_id>/doctors")
def read_doctors(organization_id):
    try:
        doctors = list_doctors(organization_id)
    except (DoctorApiNotConfigured, requests.RequestException) as exc:
        return jsonify({"success": False, "message": f"Could not load doctors: {exc}"}), 502
    return jsonify({"success": True, "doctors": doctors}), 200


@sessions_bp.put("/sessions/<uuid:session_id>/doctor")
def select_doctor(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    if session.delivery_status == "sent":
        return jsonify({"success": False, "message": "Intake already sent to the doctor"}), 409

    body = request.get_json(silent=True) or {}
    organization_id = str(body.get("organization_id") or "").strip()
    doctor_id = str(body.get("doctor_id") or "").strip()
    if not organization_id or not doctor_id:
        return jsonify({"success": False, "message": "organization_id and doctor_id are required"}), 400

    session.organization_id = organization_id
    session.organization_name = body.get("organization_name")
    session.doctor_id = doctor_id
    session.doctor_name = body.get("doctor_name")

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"success": False, "message": str(exc)}), 400

    return jsonify({"success": True, "session": session.to_dict()}), 200


@sessions_bp.post("/sessions/<uuid:session_id>/deliver")
def retry_delivery(session_id):
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    if session.status != "submitted":
        return jsonify({"success": False, "message": "Intake has not been submitted yet"}), 400

    delivered = deliver_to_arvi(session)
    return jsonify({
        "success": delivered,
        "delivery_status": session.delivery_status,
        "message": None if delivered else session.delivery_error,
    }), 200 if delivered else 502


@sessions_bp.get("/sessions/<uuid:session_id>/prefill")
def prefill_session(session_id):
    current_session = db.session.get(IntakeSession, session_id)
    if not current_session:
        return jsonify({"success": False, "message": "Session not found"}), 404

    # Latest earlier intake that got as far as personal details, preferring
    # completed ones, so details carry over even if the chat was never sent
    previous_session = (
        IntakeSession.query
        .join(PatientProfile)
        .filter(
            IntakeSession.user_id == current_session.user_id,
            IntakeSession.id != current_session.id,
        )
        .order_by(
            (IntakeSession.status == "submitted").desc(),
            IntakeSession.created_at.desc(),
        )
        .first()
    )

    personal = previous_session.patient_profile if previous_session else None
    medical = previous_session.medical_details if previous_session else None
    referral = previous_session.referral_details if previous_session else None

    # First intake for this account: at least fill in the sign-up email
    account_email = current_session.user.email if current_session.user else None

    return jsonify({
        "success": True,
        "prefill": {
            "personal": {
                "first_name": personal.first_name,
                "last_name": personal.last_name,
                "date_of_birth": (
                    personal.date_of_birth.isoformat()
                    if personal and personal.date_of_birth
                    else None
                ),
                "gender": personal.gender,
                "phone": personal.phone,
                "email": personal.email or account_email,
                "address": personal.address,
                "emergency_contact_name": personal.emergency_contact_name,
                "emergency_contact_number": personal.emergency_contact_number,
            } if personal else (
                {"email": account_email} if account_email else None
            ),
            "medical": {
                "allergies": medical.allergies,
                "conditions": medical.conditions,
                "medications": medical.medications,
                "previous_surgeries": medical.previous_surgeries,
                "family_history": medical.family_history,
            } if medical else None,
            "referral": {
                "has_referral": referral.has_referral,
            } if referral else None,
            # Follow-ups usually see the same doctor, so offer the last choice
            "doctor": {
                "organization_id": previous_session.organization_id,
                "organization_name": previous_session.organization_name,
                "doctor_id": previous_session.doctor_id,
                "doctor_name": previous_session.doctor_name,
            } if previous_session and previous_session.doctor_id else None,
        },
    })
