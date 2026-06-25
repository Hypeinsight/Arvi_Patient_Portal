def build_summary(patient_type: str, form_data: dict, uploads: list) -> str:
    lines = []

    lines.append("PATIENT INTAKE SUMMARY")
    lines.append(f"Patient type: {patient_type.replace('_', ' ').title()}")
    lines.append("")

    if apt := form_data.get("appointment"):
        lines.append(f"Appointment type: {apt.get('type', 'Not specified')}")
        lines.append("")

    if p := form_data.get("personal"):
        lines.append("PERSONAL DETAILS")
        lines.append(f"  Name:    {p.get('first_name', '')} {p.get('last_name', '')}")
        lines.append(f"  DOB:     {p.get('date_of_birth', '')}")
        lines.append(f"  Phone:   {p.get('phone', '')}")
        lines.append(f"  Email:   {p.get('email', '')}")
        lines.append(f"  Address: {p.get('address', '')}")
        lines.append("")

    if m := form_data.get("medical"):
        lines.append("MEDICAL DETAILS")
        lines.append(f"  Conditions:  {', '.join(m.get('conditions', [])) or 'None reported'}")
        lines.append(f"  Medications: {', '.join(m.get('medications', [])) or 'None reported'}")
        lines.append(f"  Allergies:   {', '.join(m.get('allergies', [])) or 'None reported'}")
        lines.append("")

    if r := form_data.get("referral"):
        lines.append("REFERRAL")
        lines.append(f"  Referred by: {r.get('referrer_name', 'N/A')}")
        lines.append(f"  Reason:      {r.get('reason', 'N/A')}")
        lines.append("")

    if uploads:
        lines.append("DOCUMENTS UPLOADED")
        for u in uploads:
            lines.append(f"  [{u.upload_type}] {u.original_name}")
        lines.append("")

    return "\n".join(lines)