const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createSummary(
  sessionId
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // body: JSON.stringify(appointmentData),
  });
  return res.json();
}
