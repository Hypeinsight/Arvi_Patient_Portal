from datetime import date, datetime

def _fmt_date(value) -> str:
    if not value:
        return "Not provided"
    if isinstance(value, (date, datetime)):
        return value.strftime("%d %b %Y")
    try:
        return datetime.fromisoformat(str(value)[:10]).strftime("%d %b %Y")
    except Exception:
        return str(value)


def _fmt_list(values: list) -> str:
    if not values:
        return "None reported"
    return ", ".join(str(v) for v in values if v)


def _calc_age(dob) -> str:
    if not dob:
        return ""
    if isinstance(dob, str):
        try:
            dob = datetime.fromisoformat(dob[:10]).date()
        except Exception:
            return ""
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return f" (Age: {age})"


def _divider() -> str:
    return "━" * 42


def build_doctor_summary(
    session,
    form_data: dict,
    chat_notes: str | None = None,
) -> str:
    lines = []

    p = form_data.get("personal") or {}
    m = form_data.get("medical") or {}
    a = form_data.get("appointment") or {}
    r = form_data.get("referral") or {}

    # Header
    lines += [
        "PATIENT INTAKE SUMMARY",
        _divider(),
        "",
        f"Session Date:     {_fmt_date(session.created_at)}",
        f"Patient Type:     {session.patient_type.replace('_', ' ').title()}",
        f"Appointment Type: {a.get('appointment_type') or 'Not specified'}",
        "",
    ]

    # Patient details
    dob = p.get("date_of_birth")
    age_str = _calc_age(dob)

    emergency_name = p.get("emergency_contact_name") or ""
    emergency_number = p.get("emergency_contact_number") or ""
    emergency = (
        f"{emergency_name} — {emergency_number}"
        if emergency_name and emergency_number
        else emergency_name or emergency_number or "Not provided"
    )

    lines += [
        _divider(),
        "PATIENT DETAILS",
        _divider(),
        f"Name:             {p.get('first_name', '')} {p.get('last_name', '')}".strip() or "Not provided",
        f"Date of Birth:    {_fmt_date(dob)}{age_str}",
        f"Gender:           {p.get('gender') or 'Not provided'}",
        f"Phone:            {p.get('phone') or 'Not provided'}",
        f"Email:            {p.get('email') or 'Not provided'}",
        f"Address:          {p.get('address') or 'Not provided'}",
        "",
        f"Emergency Contact: {emergency}",
        "",
    ]

    # Medical history
    lines += [
        _divider(),
        "MEDICAL HISTORY",
        _divider(),
        f"Conditions:       {_fmt_list(m.get('conditions', []))}",
        f"Medications:      {_fmt_list(m.get('medications', []))}",
        f"Allergies:        {_fmt_list(m.get('allergies', []))}",
        f"Surgeries:        {m.get('previous_surgeries') or 'None reported'}",
        f"Family History:   {m.get('family_history') or 'None reported'}",
        "",
    ]

    # Referral
    has_referral = r.get("has_referral", False)
    lines += [
        _divider(),
        "REFERRAL",
        _divider(),
        f"Has Referral:     {'Yes' if has_referral else 'No'}",
        "",
    ]

    # Chat notes (appended after chat)
    if chat_notes:
        lines += [
            _divider(),
            "CHAT NOTES",
            _divider(),
            chat_notes,
            "",
        ]

    return "\n".join(lines)

# def build_summary(patient_type: str, form_data: dict, uploads: list) -> str:
#     lines = []

#     lines.append("PATIENT INTAKE SUMMARY")
#     lines.append(f"Patient type: {patient_type.replace('_', ' ').title()}")
#     lines.append("")

#     if apt := form_data.get("appointment"):
#         lines.append(f"Appointment type: {apt.get('type', 'Not specified')}")
#         lines.append("")

#     if p := form_data.get("personal"):
#         lines.append("PERSONAL DETAILS")
#         lines.append(f"  Name:    {p.get('first_name', '')} {p.get('last_name', '')}")
#         lines.append(f"  DOB:     {p.get('date_of_birth', '')}")
#         lines.append(f"  Phone:   {p.get('phone', '')}")
#         lines.append(f"  Email:   {p.get('email', '')}")
#         lines.append(f"  Address: {p.get('address', '')}")
#         lines.append("")

#     if m := form_data.get("medical"):
#         lines.append("MEDICAL DETAILS")
#         lines.append(f"  Conditions:  {', '.join(m.get('conditions', [])) or 'None reported'}")
#         lines.append(f"  Medications: {', '.join(m.get('medications', [])) or 'None reported'}")
#         lines.append(f"  Allergies:   {', '.join(m.get('allergies', [])) or 'None reported'}")
#         lines.append("")

#     if r := form_data.get("referral"):
#         lines.append("REFERRAL")
#         lines.append(f"  Referred by: {r.get('referrer_name', 'N/A')}")
#         lines.append(f"  Reason:      {r.get('reason', 'N/A')}")
#         lines.append("")

#     if uploads:
#         lines.append("DOCUMENTS UPLOADED")
#         for u in uploads:
#             lines.append(f"  [{u.upload_type}] {u.original_name}")
#         lines.append("")

#     return "\n".join(lines)