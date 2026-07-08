def session_form_data(session) -> dict:
    return {
        "appointment": _appointment_to_dict(session.appointment_details),
        "personal":    _patient_to_dict(session.patient_profile),
        "medical":     _medical_to_dict(session.medical_details),
        "referral":    _referral_to_dict(session.referral_details),
    }


def _iso(value) -> str | None:
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _appointment_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "appointment_type": record.appointment_type,
    }


def _patient_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "first_name":               record.first_name,
        "last_name":                record.last_name,
        "date_of_birth":            _iso(record.date_of_birth),
        "gender":                   record.gender,
        "phone":                    record.phone,
        "email":                    record.email,
        "address":                  record.address,
        "emergency_contact_name":   record.emergency_contact_name,
        "emergency_contact_number": record.emergency_contact_number,
    }


def _medical_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "conditions":         record.conditions,
        "medications":        record.medications,
        "allergies":          record.allergies,
        "previous_surgeries": record.previous_surgeries,
        "family_history":     record.family_history,
    }


def _referral_to_dict(record) -> dict | None:
    if not record:
        return None
    return {
        "has_referral": record.has_referral,
    }

