import re
from datetime import date, datetime
from functools import lru_cache

import google.cloud.dlp_v2 as dlp_v2
from flask import current_app
from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import GoogleAuthError

# Masks PII in free text (chat messages, free-text form fields) before it is
# sent to Azure OpenAI. One-way: PII is replaced with placeholders such as
# [PERSON_NAME], since the AI never needs the real values back.

LOCATION        = "australia-southeast1"
TIMEOUT_SECONDS = 10
FULL_MATCH      = dlp_v2.MatchingType.MATCHING_TYPE_FULL_MATCH

# Same detectors as ARVI's DLPService, so both systems agree on what counts as PII
INFO_TYPES = [
    {"name": "PERSON_NAME"},
    {"name": "DATE_OF_BIRTH"},
    {"name": "PHONE_NUMBER"},
    {"name": "EMAIL_ADDRESS"},
    {"name": "STREET_ADDRESS"},
    {"name": "AUSTRALIA_MEDICARE_NUMBER"},
    {"name": "AUSTRALIA_TAX_FILE_NUMBER"},
    {"name": "MEDICAL_RECORD_NUMBER"},
    {"name": "AGE"},
    {"name": "GENDER"},
]

CUSTOM_INFO_TYPES = [
    {
        "info_type": {"name": "ARVI_MRN"},
        "regex": {"pattern": r"MRN[\s:#]*\d{4,10}"},
        "likelihood": dlp_v2.Likelihood.LIKELY,
    },
    {
        "info_type": {"name": "ARVI_TITLED_NAME"},
        "regex": {"pattern": r"(?:Dr|Professor|Prof|Mr|Mrs|Ms)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+"},
        "likelihood": dlp_v2.Likelihood.LIKELY,
    },
    # Portal-only: Australian landlines such as (02) 9876 5432, which PHONE_NUMBER can miss
    {
        "info_type": {"name": "AU_LANDLINE"},
        "regex": {"pattern": r"(?:\+61[\s-]?[2378]|\(0[2378]\)|\b0[2378])[\s-]?\d{4}[\s-]?\d{4}\b"},
        "likelihood": dlp_v2.Likelihood.LIKELY,
    },
]

DETECTOR_INFO_TYPES = INFO_TYPES + [c["info_type"] for c in CUSTOM_INFO_TYPES]

# Overlapping findings each get their own placeholder ("Dr Kamal Silva" ->
# "[ARVI_TITLED_NAME][PERSON_NAME]"). Drop any finding that sits entirely
# inside a wider one. Mirrors ARVI's rule set, plus the landline type.
RULE_SET = [
    {
        "info_types": [{"name": "PERSON_NAME"}],
        "rules": [{
            "exclusion_rule": {
                "exclude_info_types": {"info_types": [
                    {"name": "ARVI_TITLED_NAME"},
                    {"name": "EMAIL_ADDRESS"},
                    {"name": "STREET_ADDRESS"},
                ]},
                "matching_type": FULL_MATCH,
            }
        }],
    },
    {
        "info_types": [{"name": "MEDICAL_RECORD_NUMBER"}],
        "rules": [{
            "exclusion_rule": {
                "exclude_info_types": {"info_types": [{"name": "ARVI_MRN"}]},
                "matching_type": FULL_MATCH,
            }
        }],
    },
    {
        "info_types": [{"name": "AU_LANDLINE"}],
        "rules": [{
            "exclusion_rule": {
                "exclude_info_types": {"info_types": [{"name": "PHONE_NUMBER"}]},
                "matching_type": FULL_MATCH,
            }
        }],
    },
]

_MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
]

_PHONE_SEPARATORS = r"[\s\-().]*"


class DLPUnavailable(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _client():
    # Created on first use so the app still boots without GCP credentials
    return dlp_v2.DlpServiceClient()


def _capitalised(word: str) -> str:
    # "Long" but not "long": the first letter must be a capital, the rest any case
    return re.escape(word[0].upper()) + (f"(?i:{re.escape(word[1:])})" if len(word) > 1 else "")


def _name_pattern(*names) -> str | None:
    """Matches the full name in any case ("sarah perera"), but a single name
    word only when capitalised, so a surname like Long or a first name like
    May leaves "a long time" and "I may be" alone."""
    words = [
        word
        for name in names
        for word in re.split(r"[\s,]+", name or "")
        if len(word) >= 2
    ]
    if not words:
        return None
    full_name = r"[\s,]+".join(re.escape(word) for word in words)
    parts     = "|".join(sorted({_capitalised(word) for word in words}))
    return rf"\b(?:(?i:{full_name})|{parts})\b"


def _date_pattern(value) -> str | None:
    """Matches a known date in the common ways people type it:
    12/03/1988, 12-3-88, 1988-03-12, 12th March 1988, Mar 12, 1988."""
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value[:10]).date()
        except ValueError:
            return None
    if not isinstance(value, date):
        return None

    day   = f"0?{value.day}" if value.day < 10 else str(value.day)
    month = f"0?{value.month}" if value.month < 10 else str(value.month)
    year  = f"(?:{value.year}|{value.year % 100:02d})"
    sep   = r"[\s/.\-]"
    name  = _MONTHS[value.month - 1]
    month_name = rf"(?:{name}|{name[:3]})\.?"
    day_word   = f"{day}(?:st|nd|rd|th)?"

    return "(?i)" + "|".join([
        rf"\b{day}{sep}{month}{sep}{year}\b",
        rf"\b{month}{sep}{day}{sep}{year}\b",
        rf"\b{value.year}{sep}{month}{sep}{day}\b",
        rf"\b{day_word}(?:\s+of)?\s+{month_name},?\s+{year}\b",
        rf"\b{month_name}\s+{day_word},?\s+{year}\b",
    ])


def _phone_pattern(*numbers) -> str | None:
    patterns = []
    for number in numbers:
        digits = re.sub(r"\D", "", number or "")
        if len(digits) >= 6:
            # Last 9 digits, so "0412…", "+61 412…" and "412…" all match
            patterns.append(_PHONE_SEPARATORS.join(digits[-9:]))
    return "|".join(patterns) or None


def _phrase_pattern(value) -> str | None:
    words = [re.escape(word) for word in re.split(r"[\s,]+", value or "") if word]
    return "(?i)" + r"[\s,]+".join(words) if words else None


def _patient_info_types(patient: dict | None) -> list:
    """Custom detectors for this patient's own details from the intake form,
    so a bare "Sarah" or a date with no "DOB" next to it is still masked.
    Each pattern sets its own case rules."""
    if not patient:
        return []

    patterns = {
        "PATIENT_NAME":    _name_pattern(patient.get("first_name"), patient.get("last_name")),
        "PATIENT_DOB":     _date_pattern(patient.get("date_of_birth")),
        "PATIENT_PHONE":   _phone_pattern(patient.get("phone")),
        "PATIENT_EMAIL":   _phrase_pattern(patient.get("email")),
        "PATIENT_ADDRESS": _phrase_pattern(patient.get("address")),
        "CONTACT_NAME":    _name_pattern(patient.get("emergency_contact_name")),
        "CONTACT_PHONE":   _phone_pattern(patient.get("emergency_contact_number")),
    }
    return [
        {
            "info_type": {"name": name},
            "regex": {"pattern": pattern},
            "likelihood": dlp_v2.Likelihood.VERY_LIKELY,
        }
        for name, pattern in patterns.items()
        if pattern
    ]


def _rule_set(patient_types: list) -> list:
    if not patient_types:
        return RULE_SET
    # A patient value inside a wider detector finding ("Sarah" inside
    # "Sarah Perera") is already covered by that finding's placeholder
    return RULE_SET + [{
        "info_types": [t["info_type"] for t in patient_types],
        "rules": [{
            "exclusion_rule": {
                "exclude_info_types": {"info_types": DETECTOR_INFO_TYPES},
                "matching_type": FULL_MATCH,
            }
        }],
    }]


def mask(text: str | None, patient: dict | None = None) -> str | None:
    """Replaces PII in free text with placeholders such as [PERSON_NAME].

    patient is the intake's personal details (session_form_data()["personal"]);
    when given, the patient's own name, DOB, phone, email and address are
    masked too. Raises DLPUnavailable if DLP can't be reached, so callers can
    refuse to send the text rather than send it unmasked.
    """
    if not text or not text.strip() or not current_app.config.get("DLP_ENABLED"):
        return text

    project = current_app.config.get("GCP_PROJECT")
    if not project:
        raise DLPUnavailable("GCP_PROJECT must be set when DLP_ENABLED is true")

    patient_types = _patient_info_types(patient)
    try:
        response = _client().deidentify_content(
            request={
                "parent": f"projects/{project}/locations/{LOCATION}",
                "deidentify_config": {
                    "info_type_transformations": {
                        "transformations": [
                            {"primitive_transformation": {"replace_with_info_type_config": {}}}
                        ]
                    }
                },
                "inspect_config": {
                    "info_types": INFO_TYPES,
                    "min_likelihood": dlp_v2.Likelihood.POSSIBLE,
                    "custom_info_types": CUSTOM_INFO_TYPES + patient_types,
                    "rule_set": _rule_set(patient_types),
                },
                "item": {"value": text},
            },
            timeout=TIMEOUT_SECONDS,
        )
    except (GoogleAPIError, GoogleAuthError) as exc:
        # Log the error type only, in case the API echoes request content back
        current_app.logger.error("DLP masking failed: %s", type(exc).__name__)
        raise DLPUnavailable("DLP masking failed") from exc

    return response.item.value
