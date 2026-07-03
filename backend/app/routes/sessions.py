import uuid
from flask import Blueprint, request, jsonify
from app.services.intake_cache import create_session_cache, get_intake_data, save_intake_data
from app.services.flow import get_screen_order

sessions_bp = Blueprint("sessions", __name__)

@sessions_bp.post("/sessions")
def create_session():
    body = request.get_json(silent=True) or {}
    patient_type = body.get("patient_type")
    session_id = str(uuid.uuid4())
    screens = get_screen_order(patient_type)
    create_session_cache(session_id)
    return jsonify({
        "success": True,
        "session_id": session_id,
        "patient_type": patient_type,
        "screens": screens,
    }), 201

@sessions_bp.post("/sessions/<session_id>/prepare-chat")
def prepare_chat(session_id):
    if get_intake_data(session_id) is None:
        return jsonify({"success": False, "message": "Session not found"}), 404
    form_data = request.get_json(silent=True) or {}
    cleaned = {k: v for k, v in form_data.items() if v is not None}
    save_intake_data(session_id, cleaned)
    return jsonify({"success": True}), 200