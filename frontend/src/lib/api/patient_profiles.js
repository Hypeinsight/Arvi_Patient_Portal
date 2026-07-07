const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createPatientProfile(
  sessionId,
  patientData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/patient-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });
  return res.json();
}

export async function updatePatientProfile(
  sessionId,
  patientData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/patient-profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });
  return res.json();
}

