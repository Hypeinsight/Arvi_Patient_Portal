import uuid
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.session import IntakeSession
from app.models.upload import IntakeUpload
from app.utils.storage import upload_to_storage, delete_from_storage
import io
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
import fitz 

uploads_bp = Blueprint("uploads", __name__)

ALLOWED_MIME        = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
ALLOWED_UPLOAD_TYPES = {"personal_id", "medical_record"}


@uploads_bp.post("/sessions/<uuid:session_id>/uploads")
def upload_file(session_id): # to upload a file for a specific session
    session = db.session.get(IntakeSession, session_id)
    if not session:
        return jsonify({"success": False, "message": "Session not found"}), 404
    if not session.is_active():
        return jsonify({"success": False, "message": "Session is no longer active"}), 409

    upload_type = request.form.get("upload_type")
    if upload_type not in ALLOWED_UPLOAD_TYPES:
        return jsonify({"success": False, "message": "upload_type must be personal_id or medical_record"}), 400

    file = request.files.get("file")
    if not file:
        return jsonify({"success": False, "message": "No file provided"}), 400
    if file.mimetype not in ALLOWED_MIME:
        return jsonify({"success": False, "message": f"File type {file.mimetype} not allowed"}), 415

    storage_key = f"intake/{session_id}/{upload_type}/{uuid.uuid4()}_{file.filename}"
    size_bytes  = upload_to_storage(
        bucket=current_app.config["STORAGE_BUCKET"],
        key=storage_key,
        file_obj=file,
        content_type=file.mimetype,
    )

    record = IntakeUpload(
        session_id=session_id,
        upload_type=upload_type,
        original_name=file.filename,
        storage_key=storage_key,
        mime_type=file.mimetype,
        size_bytes=size_bytes,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "success":       True,
        "upload_id":     str(record.id),
        "upload_type":   upload_type,
        "original_name": file.filename,
    }), 201


@uploads_bp.delete("/sessions/<uuid:session_id>/uploads/<uuid:upload_id>")
def delete_upload(session_id, upload_id): # to delete a specific upload for a session
    record = IntakeUpload.query.filter_by(
        id=upload_id, session_id=session_id
    ).first()

    if not record:
        return jsonify({"success": False, "message": "Upload not found"}), 404

    delete_from_storage(current_app.config["STORAGE_BUCKET"], record.storage_key)
    db.session.delete(record)
    db.session.commit()

    return jsonify({"success": True, "deleted": str(upload_id)}), 200

@uploads_bp.post("/sessions/<uuid:session_id>/ocr") # to perform OCR on a personal ID upload
def ocr_personal_id(session_id):
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

    file_bytes = file.read()  # memory only — never hits disk or S3 due to privacy concerns.

    try:
        text = _extract_text(file_bytes, file.mimetype)
    except Exception as e:
        return jsonify({"success": False, "message": f"OCR failed: {str(e)}"}), 500

    return jsonify({"success": True, "text": text}), 200


def _extract_text(file_bytes: bytes, mime_type: str) -> str: # to extract text from the file bytes based on its MIME type
    if mime_type == "application/pdf":
        return _ocr_pdf(file_bytes)
    return _ocr_image(file_bytes)


def _ocr_image(file_bytes: bytes) -> str: # to perform OCR on image files (JPEG, PNG, WEBP)
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)


def _ocr_pdf(file_bytes: bytes) -> str: # to perform OCR on PDF files
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        full_text += pytesseract.image_to_string(img) + "\n"
    return full_text.strip()