import logging

logger = logging.getLogger(__name__)


def extract_personal_details(file_obj, mime_type: str) -> dict:
    """
    Accepts a file object and mime type.
    Returns extracted personal details as a dict with keys:
    first_name, last_name, date_of_birth, phone, email, address.
    Returns empty dict if extraction fails.
    """
    raise NotImplementedError("Extraction service not yet implemented")


def extract_medical_details(file_obj, mime_type: str) -> dict:
    """
    Accepts a file object and mime type.
    Returns extracted medical details as a dict with keys:
    conditions, medications, allergies.
    Returns empty dict if extraction fails.
    """
    raise NotImplementedError("Extraction service not yet implemented")


def _load_file(file_obj, mime_type: str):
    """
    Internal helper. Reads the file and returns a format suitable
    for whichever extraction backend is plugged in.
    Handles both PDF and image types.
    """
    raise NotImplementedError