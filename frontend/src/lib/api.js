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

export async function uploadFile(sessionId, file, uploadType) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_type", uploadType);
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/uploads`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function deleteFile(sessionId, uploadId) {
  const res = await fetch(
    `${BASE_URL}/sessions/${sessionId}/uploads/${uploadId}`,
    { method: "DELETE" }
  );
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