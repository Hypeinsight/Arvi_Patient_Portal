import requests
from flask import current_app

# Contract with ARVI (all calls send "Authorization: Bearer <DOCTOR_API_KEY>"):
#   GET  {DOCTOR_API_URL}/intake/clinics                    -> {"clinics": [{"id", "name"}]}
#   GET  {DOCTOR_API_URL}/intake/clinics/<org_id>/doctors   -> {"doctors": [{"id", "name"}]}
#   POST {DOCTOR_API_URL}/intake/receive                    -> {"reference": "<ARVI id>"}

TIMEOUT_SECONDS = 10


class DoctorApiNotConfigured(RuntimeError):
    pass


def _request(method: str, path: str, **kwargs) -> dict:
    url     = current_app.config.get("DOCTOR_API_URL")
    api_key = current_app.config.get("DOCTOR_API_KEY")
    if not url or not api_key:
        raise DoctorApiNotConfigured("DOCTOR_API_URL and DOCTOR_API_KEY must be set")

    response = requests.request(
        method,
        f"{url.rstrip('/')}{path}",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=TIMEOUT_SECONDS,
        **kwargs,
    )
    response.raise_for_status()
    return response.json()


def list_clinics() -> list:
    return _request("GET", "/intake/clinics").get("clinics", [])


def list_doctors(organization_id: str) -> list:
    return _request("GET", f"/intake/clinics/{organization_id}/doctors").get("doctors", [])


def send_to_doctor(payload: dict) -> dict:
    return _request("POST", "/intake/receive", json=payload)
