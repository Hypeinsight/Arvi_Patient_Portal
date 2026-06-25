from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.session import IntakeSession
from app.services.extractor import extract_personal_details, extract_medical_details

extract_bp = Blueprint("extract", __name__)

ALLOWED_MIME         = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
ALLOWED_EXTRACT_TYPES = {"personal", "medical"}


@extract_bp.post("/sessions/<uuid:session_id>/extract/<extract_type>")
def extract(session_id, extract_type):
    """
    Accepts a file, extracts fields from it, and returns them as JSON.
    Does not store the file permanently — that is handled by the upload endpoint.
    Frontend uses the returned fields to pre-fill the following form screen.
    """
    if extract_type not in ALLOWED_EXTRACT_TYPES:
        return jsonify({"success": False, "message": "extract_type must be personal or medical"}), 400

    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    if not session.is_active():
        return jsonify({"success": False, "message": "Session is no longer active"}), 409

    file = request.files.get("file")
    if not file:
        return jsonify({"success": False, "message": "No file provided"}), 400
    if file.mimetype not in ALLOWED_MIME:
        return jsonify({"success": False, "message": f"File type {file.mimetype} not allowed"}), 415

    try:
        if extract_type == "personal":
            fields = extract_personal_details(file, file.mimetype)
        elif extract_type == "medical":
            fields = extract_medical_details(file, file.mimetype)

        return jsonify({"success": True, "extracted": fields}), 200

    except NotImplementedError:
        return jsonify({"success": False, "message": "Extraction not yet implemented"}), 501
    except Exception as e:
        return jsonify({"success": False, "message": "Extraction failed"}), 500