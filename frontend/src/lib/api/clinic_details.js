const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5050/api";

export async function createClinicDetails(sessionId, clinicData) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/clinic-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clinicData),
  });
  return res.json();
}

export async function updateClinicDetails(sessionId, clinicData) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/clinic-details`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clinicData),
  });
  return res.json();
}
