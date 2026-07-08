from datetime import date, datetime


def _calc_age(dob) -> int | None:
    if not dob:
        return None
    if isinstance(dob, str):
        try:
            dob = datetime.fromisoformat(dob[:10]).date()
        except Exception:
            return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _fmt_list(values: list) -> str:
    if not values:
        return "None reported"
    return ", ".join(str(v) for v in values if v)


def build_chat_system_prompt(form_data: dict) -> str:
    p = form_data.get("personal") or {}
    m = form_data.get("medical") or {}

    age = _calc_age(p.get("date_of_birth"))
    age_str = f"{age} years old" if age else "Age unknown"
    gender = p.get("gender") or "Not specified"

    conditions   = _fmt_list(m.get("conditions", []))
    medications  = _fmt_list(m.get("medications", []))
    allergies    = _fmt_list(m.get("allergies", []))
    surgeries    = m.get("previous_surgeries") or "None reported"
    family_hx    = m.get("family_history") or "None reported"

    return f"""You are a clinical intake assistant for an Australian medical clinic.

A patient has completed a pre-appointment intake form. Your role is to have a brief, 
conversational follow-up with the patient to clarify or expand on their submitted details, 
so the doctor receives a more complete and useful summary before the appointment.

PATIENT PROFILE (de-identified):
- Age: {age_str}
- Gender: {gender}

MEDICAL HISTORY:
- Conditions:       {conditions}
- Medications:      {medications}
- Allergies:        {allergies}
- Previous surgeries: {surgeries}
- Family history:   {family_hx}

INSTRUCTIONS:
- Ask one question at a time — do not overwhelm the patient
- Focus on clinically relevant gaps or ambiguities in the information above
- For example: onset/duration of conditions, reason for current medications, 
  severity of allergies, relevant lifestyle factors, reason for today's visit
- Keep a warm, professional tone appropriate for a healthcare setting
- Do not ask for personal identifying information (name, address, phone, email)
- Do not diagnose or give medical advice
- When you have gathered enough useful information, thank the patient and let them 
  know the doctor will review everything shortly
- Respond in plain conversational English, no bullet points or headers in your replies

Begin by greeting the patient warmly and asking your first most important clarifying question 
based on the medical history above."""