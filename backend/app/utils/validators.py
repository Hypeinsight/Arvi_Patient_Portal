def validate_required_fields(data: dict, required: list) -> list:
    """Returns a list of missing field names."""
    return [field for field in required if not data.get(field)]