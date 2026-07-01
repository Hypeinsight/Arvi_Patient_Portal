const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createSession(patientType, doctorId, appointmentId) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_type: patientType,
      doctor_id: doctorId,
      appointment_id: appointmentId,
    }),
  });
  return res.json();
}

export async function submitSession(sessionId, formData) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return res.json();
}

export async function extractFromFile(sessionId, file, extractType) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${BASE_URL}/sessions/${sessionId}/extract/${extractType}`,
    { method: "POST", body: form }
  );
  return res.json();
}

export async function ocrPersonalId(sessionId, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/ocr`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export const goToChat = async (sessionId, formData) => {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/prepare-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
  return res.json();
}