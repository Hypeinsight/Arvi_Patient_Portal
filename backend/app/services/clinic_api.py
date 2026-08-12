import requests
from flask import current_app


def search_clinics(query: str, limit: int) -> tuple:
    url = current_app.config["ARVI_API_URL"]
    response = requests.get(
        f"{url}/api/public/clinics/search",
        params={"q": query, "limit": limit},
        timeout=10,
    )
    return response.json(), response.status_code


def search_clinic_doctors(org_id: int, query: str, limit: int) -> tuple:
    url = current_app.config["ARVI_API_URL"]
    response = requests.get(
        f"{url}/api/public/clinics/{org_id}/doctors",
        params={"q": query, "limit": limit},
        timeout=10,
    )
    return response.json(), response.status_code
