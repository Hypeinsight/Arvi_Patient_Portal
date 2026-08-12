import requests
from flask import current_app


def send_to_doctor(
    org_id: int,
    doctor_id: int,
    first_name: str,
    last_name: str,
    date_of_birth: str | None,
    gender: str | None,
    phone: str | None,
    email: str | None,
    summary: str,
) -> dict:
    """Submits a finished intake to the ARVI platform for matching against a
    patient/appointment record. org_id/doctor_id are the public identifiers
    already returned by the clinic/doctor search endpoints — ARVI resolves
    them to an internal clinic database itself; we never see or send one.
    """
    url     = current_app.config["ARVI_API_URL"]
    api_key = current_app.config["ARVI_API_KEY"]

    payload = {
        "org_id":        org_id,
        "doctor_id":     doctor_id,
        "first_name":    first_name,
        "last_name":     last_name,
        "date_of_birth": date_of_birth,
        "gender":        gender,
        "phone":         phone,
        "email":         email,
        "summary":       summary,
    }

    print(f"Sending intake to ARVI at {url}/api/public/patient-intake with payload: {payload}")

    # TODO: ARVI's /api/public/patient-intake endpoint isn't implemented yet
    # (404s as of now). Call is stubbed out so the submit flow can be tested
    # end-to-end locally — uncomment once that endpoint exists.
    # response = requests.post(
    #     f"{url}/api/public/patient-intake",
    #     json=payload,
    #     headers={"Authorization": f"Bearer {api_key}"},
    #     timeout=10,
    # )
    # response.raise_for_status()
    # return response.json()
    return {"success": True, "stubbed": True}