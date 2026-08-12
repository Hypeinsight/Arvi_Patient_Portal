import requests
from flask import Blueprint, jsonify, request

from app.services.clinic_api import search_clinic_doctors, search_clinics

clinics_bp = Blueprint("clinics", __name__)


@clinics_bp.get("/clinics/search")
def search_clinics_route():
    query = request.args.get("q", "")
    limit = min(int(request.args.get("limit", 10)), 25)

    try:
        data, status_code = search_clinics(query, limit)
    except requests.RequestException:
        return jsonify({"success": False, "message": "Clinic directory unavailable"}), 502

    return jsonify(data), status_code


@clinics_bp.get("/clinics/<int:org_id>/doctors")
def search_clinic_doctors_route(org_id):
    query = request.args.get("q", "")
    limit = min(int(request.args.get("limit", 10)), 25)

    try:
        data, status_code = search_clinic_doctors(org_id, query, limit)
    except requests.RequestException:
        return jsonify({"success": False, "message": "Clinic directory unavailable"}), 502

    return jsonify(data), status_code
