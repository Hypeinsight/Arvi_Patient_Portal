const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createMedicalDetails(
  sessionId,
  medicalData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/medical-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(medicalData),
  });
  return res.json();
}

export async function updateMedicalDetails(
  sessionId,
  medicalData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/medical-details`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(medicalData),
  });
  return res.json();
}

