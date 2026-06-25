import requests
from flask import current_app


def send_to_doctor(doctor_id: str, appointment_id: str, summary: str, upload_keys: list) -> dict:
    url     = current_app.config["DOCTOR_API_URL"]
    api_key = current_app.config["DOCTOR_API_KEY"]

    payload = {
        "doctor_id":      doctor_id,
        "appointment_id": appointment_id,
        "summary":        summary,
        "documents":      upload_keys,
    }

    response = requests.post(
        f"{url}/intake/receive",
        json=payload,
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()