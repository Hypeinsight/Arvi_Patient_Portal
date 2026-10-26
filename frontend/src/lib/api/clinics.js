const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function getClinics() {
  const res = await fetch(`${BASE_URL}/clinics`);
  return res.json();
}

export async function getDoctors(organizationId) {
  const res = await fetch(
    `${BASE_URL}/clinics/${encodeURIComponent(organizationId)}/doctors`,
  );
  return res.json();
}

export async function selectDoctor(sessionId, doctorData) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/doctor`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doctorData),
  });
  return res.json();
}

export async function retryDelivery(sessionId) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/deliver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
