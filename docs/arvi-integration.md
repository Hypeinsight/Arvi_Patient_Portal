# ARVI Integration: Sending Intake Summaries to the Doctor

This guide covers connecting the Patient Intake Portal to ARVI. When it's finished, a patient picks their clinic and doctor, completes the intake and AI chat, and the final summary is delivered to that doctor's organisation in ARVI. There it's linked to the patient's record and shown on their appointment card.

It's based on section 5 of the *Core Platform Documentation* ("Integration with ARVI – Implementation Points") and on the current code on `feat/patient-intake-form`.

**Status key:** ✅ done (uncommitted on `feat/patient-intake-form`) · ⬜ to do · 🔷 ARVI team

---

## 1. End-to-end flow

```
 PATIENT PORTAL (this repo)                                  ARVI (doctor's organisation)
 ──────────────────────────                                  ────────────────────────────
 1 Access method ──► intake_sessions row created
 2 Clinic & doctor ──── GET clinics / GET doctors ─────────► clinic + doctor lookup APIs
                   ──► saved on intake_sessions
 3 Appointment type (pending / follow-ups only)
 4 Personal details + consent
 5 Medical details
 6 Review & Submit ──► draft summary (form data only)
 7 AI chat (Azure OpenAI, history in Redis)
 8 Submit chat ──► final summary saved
             ──── POST /intake/receive ──────────────────────► 9 patient created in the doctor's
             ◄─── 2xx {reference} ────────────────────────────    organisation, summary stored with it
   delivery_status = sent                                     10 Doctor sees the patient and summary in ARVI
```

**Decision (22 Oct 2026):** ARVI **creates the patient automatically** when it receives an intake. This differs from the original design doc, where submissions waited in a staging table until clinic staff created the patient. A retry with the same `intake_session_id` does not create a second patient.

Because every submission now creates a real patient record, the receive endpoint's API key, rate limiting and duplicate check are what stop bad or repeated submissions from reaching a clinic's patient list.

---

## 2. API contract (agree this first)

The Portal backend is the only thing that calls ARVI. The browser never talks to ARVI directly, so the API key stays on the server.

Every call sends `Authorization: Bearer <DOCTOR_API_KEY>`.

| Method | Path (relative to `DOCTOR_API_URL`) | Response |
|---|---|---|
| GET | `/intake/clinics` | `{"clinics": [{"id": "...", "name": "..."}]}` |
| GET | `/intake/clinics/<org_id>/doctors` | `{"doctors": [{"id": "...", "name": "..."}]}` |
| POST | `/intake/receive` | `{"reference": "<ARVI note id>"}`, status 201 |

> ⚠️ The design doc uses different paths: `GET /api/public/clinics/search?q=`, `GET /api/public/clinics/{org_id}/doctors` and `POST /api/public/intake/receive`. It also describes them as unauthenticated and rate-limited. **Confirm the final paths and auth with the ARVI team.** The receive endpoint accepts patient data, so it must require the API key, not just rate limiting.

### `POST /intake/receive` payload

Built by `build_intake_payload()` in `backend/app/services/delivery.py`:

```json
{
  "intake_session_id": "6f1c2e9a-…",
  "organization_id": "clinic_42",
  "doctor_id": "doc_17",
  "patient_type": "new",
  "appointment_type": "Initial consultation",
  "patient": {
    "first_name": "Jane",
    "last_name": "Doe",
    "date_of_birth": "1985-03-14",
    "gender": "Female",
    "phone": "0412 345 678",
    "email": "jane@example.com"
  },
  "medical": { "conditions": [], "medications": [], "allergies": [], "previous_surgeries": "", "family_history": "" },
  "referral": { "has_referral": true },
  "summary": "PATIENT INTAKE SUMMARY …",
  "submitted_at": "2026-10-21T09:30:00+00:00",
  "documents": []
}
```

**Agree these points with ARVI:**

- [ ] `intake_session_id` is an **idempotency key**. Resending the same one must not create a second note.
- [ ] Date format is `YYYY-MM-DD`. Agree on a fixed list of `gender` values, because ARVI matches on these exactly.
- [ ] Error responses use 4xx for bad data (don't retry) and 5xx for server errors (retry is OK).
- [ ] Whether ARVI wants `medical` and `referral` as structured fields, or only `summary`.
- [ ] Referral details (Medicare number, referring doctor, referral date) and documents: in scope or not?

---

## 3. Patient Portal: step by step

### Step 1: Configuration ⬜

`backend/.env`:

```
DOCTOR_API_URL=https://<arvi-host>
DOCTOR_API_KEY=<shared secret from ARVI team>
```

For local development, point `DOCTOR_API_URL` at the mock server from step 9.

### Step 2: Database columns ✅

Migration `d5a1c8e3f27b_add_clinic_doctor_delivery.py` adds these columns to `intake_sessions`:

| Column | Purpose |
|---|---|
| `organization_id`, `organization_name` | Clinic chosen by the patient. The name is kept so the intake still reads correctly if ARVI is down |
| `doctor_id`, `doctor_name` | Doctor chosen by the patient |
| `delivery_status` | `pending` / `sent` / `failed` |
| `delivery_error` | Last error message, for debugging and retries |
| `delivered_at` | When ARVI accepted the intake |
| `arvi_reference` | ID returned by ARVI |

Apply it:

```bash
cd backend
flask db upgrade
```

**Clean-up before committing:**
- [ ] Fix the typo `user =db.relationship` → `user = db.relationship` in `models/session.py`.
- [ ] Either set `delivery_status = "pending"` when the patient submits, or remove `'pending'` from the check constraint, since nothing sets it at the moment.

### Step 3: ARVI client ✅

`backend/app/services/doctor_api.py`:

- `_request()` is a shared helper. It adds the Bearer header and a 10-second timeout, and raises `DoctorApiNotConfigured` if the URL or key is missing.
- `list_clinics()`, `list_doctors(org_id)` and `send_to_doctor(payload)`.

- [ ] Update the paths once the contract (section 2) is final.

### Step 4: Delivery service ✅

`backend/app/services/delivery.py`:

- `build_intake_payload(session)` builds the JSON above from the saved session.
- `deliver_to_arvi(session)`:
  - Does nothing if the intake is already `sent`, so a retry never sends it twice.
  - Fails with "No clinic or doctor selected" if the selection is missing.
  - Sends the intake and records either `sent` + `delivered_at` + `arvi_reference` + `summaries.sent_at`, or `failed` + `delivery_error`.
  - **Never raises** on ARVI errors. The patient's submission is already saved, so a failed delivery is stored on the session and can be retried.

**Clean-up before committing:**
- [ ] Limit `patient` in the payload to the fields ARVI stores: first name, last name, DOB, gender, phone and email. At the moment it sends the whole personal section, including the address and emergency contact.

### Step 5: Backend routes ✅

Added to `backend/app/routes/sessions.py`:

| Route | Purpose |
|---|---|
| `GET /api/clinics` | Passes the clinic list through from ARVI (502 if ARVI is unreachable) |
| `GET /api/clinics/<org_id>/doctors` | Passes the doctor list through from ARVI |
| `PUT /api/sessions/<id>/doctor` | Saves `organization_id`, `organization_name`, `doctor_id` and `doctor_name`. Returns 409 if the intake has already been sent |
| `POST /api/sessions/<id>/deliver` | Retries delivery for a submitted intake. Returns 200 if sent, 502 if it failed |

And in `backend/app/routes/chat.py`, `POST /api/sessions/<id>/chat/submit` now calls `deliver_to_arvi()` after saving the chat and summary, and returns `delivered` and `delivery_status`.

### Step 6: Clinic & Doctor step in the flow ✅

Add the screen **after the access method and before the appointment type**. That's the first point where a session exists, and it comes before consent, which is about sharing data with *that* clinic.

`backend/app/services/flow.py`:

```python
SCREENS = [
    "choose_access_method",
    "choose_clinic_doctor",        # new
    "choose_appointment_type",
    "personal_details",
    "medical_details",
    "review_submit",
    "chat",
]

SCREEN_ACCESS = {
    ...
    "choose_clinic_doctor": ["pending", "guest", "new", "followup_lt12", "followup_gt12"],
    ...
}
```

### Step 7: Frontend ✅

1. **API helpers:** `frontend/src/lib/api/clinics.js`
   - `getClinics()` → `GET /clinics`
   - `getDoctors(orgId)` → `GET /clinics/<orgId>/doctors`
   - `selectDoctor(sessionId, {organization_id, organization_name, doctor_id, doctor_name})` → `PUT /sessions/<id>/doctor`
   - `retryDelivery(sessionId)` → `POST /sessions/<id>/deliver`

2. **New component:** `frontend/src/components/patients/ClinicDoctor.js`
   - One page: a searchable clinic select, then a doctor select that loads once a clinic is chosen.
   - Next is disabled until both are chosen. On Next, call `selectDoctor()`.
   - Use the same layout as the other steps: `Title`, `InfoCard`, `NavigationButtons`.
   - If the lists fail to load, show an error with a retry instead of an empty dropdown.

3. **Prefill for returning patients:** return the previous session's `organization_*` and `doctor_*` from `GET /sessions/<id>/prefill`, so follow-ups only need to confirm.

4. **Review & Submit:** show "Clinic: … · Doctor: …" with an **Edit** link back to the step.

5. **Chat submit result** (`Chat.js`):
   - `delivery_status === "sent"`: "Your details have been sent to Dr X at Clinic Y."
   - `delivery_status === "failed"`: "We saved your details but couldn't reach the clinic." Add a **Try again** button that calls `retryDelivery()`.

6. **Remove placeholders:** delete the hard-coded `"doc-123"` and `"apt-456"` arguments to `createSession` in `MainPage.js`, `LoginForm.js` and `RegisterForm.js`.

### Step 8: Summary and privacy clean-up ✅

- [ ] Remove the **PATIENT DETAILS** block from `build_doctor_summary()` in `backend/app/services/summariser.py`. ARVI already gets these as structured fields. This also stops follow-up patients' name, DOB, phone, email and address reaching Azure OpenAI through `previous_summary`, which the design doc (section 6.1) says must not happen.
- [ ] Re-check that consent is collected before any data is saved (design doc section 2.2).

### Step 9: Mock ARVI server for local testing ⬜

Add `backend/tools/mock_arvi.py` so the whole flow can be tested before ARVI's endpoints exist:

```python
from flask import Flask, jsonify, request

app = Flask(__name__)
KEY = "dev-key"
received = {}


def authorised():
    return request.headers.get("Authorization") == f"Bearer {KEY}"


@app.get("/intake/clinics")
def clinics():
    if not authorised():
        return {"error": "unauthorised"}, 401
    return jsonify(clinics=[{"id": "clinic_1", "name": "Northside Clinic"},
                            {"id": "clinic_2", "name": "Harbour Specialists"}])


@app.get("/intake/clinics/<org_id>/doctors")
def doctors(org_id):
    if not authorised():
        return {"error": "unauthorised"}, 401
    return jsonify(doctors=[{"id": f"{org_id}_doc_1", "name": "Dr Alice Smith"},
                            {"id": f"{org_id}_doc_2", "name": "Dr Ben Jones"}])


@app.post("/intake/receive")
def receive():
    if not authorised():
        return {"error": "unauthorised"}, 401
    body = request.get_json()
    received[body["intake_session_id"]] = body   # idempotent by session id
    print("Received intake:", body["intake_session_id"], body["patient"])
    return jsonify(reference=f"note_{len(received)}"), 201


if __name__ == "__main__":
    app.run(port=5050)
```

Run it with `python backend/tools/mock_arvi.py`, then set `DOCTOR_API_URL=http://127.0.0.1:5050` and `DOCTOR_API_KEY=dev-key`.

### Step 10: Testing checklist ⬜

- [ ] `flask db upgrade` applies cleanly, and `flask db downgrade` reverses it.
- [ ] Clinic and doctor lists load. When the mock is stopped, the page shows an error, not an empty list.
- [ ] The selection is saved on the session and survives a page refresh.
- [ ] A full intake + chat submit leaves the mock with one note, and the session has `delivery_status = sent`, `delivered_at` and `arvi_reference` set, plus `summaries.sent_at` set.
- [ ] With the mock stopped, submitting gives `delivery_status = failed` with an error, the patient sees **Try again**, and after restarting the mock, retrying succeeds.
- [ ] Retrying after success doesn't send again.
- [ ] Changing the doctor after a successful send returns 409.
- [ ] Guest, new, `followup_lt12` and `followup_gt12` patients all reach and complete the new step.
- [ ] A follow-up patient sees their previous clinic and doctor prefilled.
- [ ] The payload contains only the agreed patient fields, and the summary text has no personal details block.

---

## 4. ARVI side ✅ (ARVI team)

Built on ARVI's `feature/patient-intake` branch (`backend/intake_module/`, registered in `backend/app.py`) and tested end to end against this portal: clinic list, doctor list, rejecting a bad API key, and submit → patient created → retry doesn't duplicate.

The receive endpoint:
1. Checks the API key.
2. Looks up the organisation's database from `organization_id` on the server.
3. Skips duplicates using `intake_session_id`.
4. Creates the patient in that organisation with the summary, and returns `reference`.

**Still to do on the ARVI side:**
- [ ] Migration 018 has only been applied to `org_maarai` locally. It must run for every organisation in staging and production (Platform Admin → Database → Org Migrations). Until then, intakes sent to other clinics will fail.

---

## 5. Edge cases to agree on

| Case | Suggested handling |
|---|---|
| Patient already in ARVI (follow-up) | Agree with ARVI whether they reuse the existing patient or create a new one |
| Typo in name or DOB | A patient is created with the wrong details. Clinic staff correct or merge it in ARVI |
| Test, fake or spam submission | A patient is still created. Relies on the API key and rate limiting |
| ARVI down during submit | Saved as `failed`; the patient retries. Later, add a background job that retries `failed` sessions |
| Patient changes doctor after sending | Blocked (409). Changes go through the clinic |

---

## 6. Suggested order of work

1. Agree the API contract with the ARVI team (section 2).
2. Do the clean-up items in steps 2 and 4, then commit the backend work that's already done.
3. Add the mock ARVI server (step 9) and test the backend with it.
4. Add the flow step and frontend (steps 6 and 7).
5. Do the summary and privacy clean-up (step 8).
6. Run the testing checklist (step 10) against the mock, then against ARVI's staging environment once it's ready.
7. Open a PR into `dev`.
