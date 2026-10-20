SCREENS = [
    "choose_access_method",
    "choose_appointment_type",
    # "account_setup",
    # "upload_personal_details",
    "personal_details",
    # "upload_medical_details",
    "medical_details",
    "review_submit",
    "chat",
]

SCREEN_ACCESS = {
    "choose_access_method":    ["pending", "guest", "new", "followup_lt12", "followup_gt12"],
    # New accounts get "new" assigned automatically, so only returning
    # accounts choose between the follow-up types
    "choose_appointment_type": ["pending", "followup_lt12", "followup_gt12"],
    # "account_setup":           ["new"],
    # "upload_personal_details": ["guest", "new", "followup_gt12"],
    "personal_details":        ["guest", "new", "followup_lt12", "followup_gt12"],
    # "upload_medical_details":  ["guest", "new", "followup_lt12", "followup_gt12"],
    "medical_details":         ["guest", "new", "followup_lt12", "followup_gt12"],
    "review_submit":           ["guest", "new", "followup_lt12", "followup_gt12"],
    "chat":                    ["guest", "new", "followup_lt12", "followup_gt12"],
}


def get_screen_order(patient_type: str) -> list:
    return [s for s in SCREENS if patient_type in SCREEN_ACCESS[s]]


def get_progress(patient_type: str, current_screen: str) -> dict:
    screens   = get_screen_order(patient_type)
    countable = [s for s in screens if s != "all_set"]

    if current_screen == "all_set":
        return {"current_index": len(countable), "total_screens": len(countable), "percent": 100}

    try:
        idx     = countable.index(current_screen)
        percent = round((idx / len(countable)) * 100)
    except ValueError:
        idx     = 0
        percent = 0

    return {
        "current_index": idx,
        "total_screens": len(countable),
        "percent":       percent,
    }
