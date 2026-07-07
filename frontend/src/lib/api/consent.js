const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createConsent(
  sessionId,
  consentData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/consent-record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...consentData
    }),
  });
  return res.json();
}

export async function updateConsent(
  sessionId,
  consentData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/consent-record`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...consentData
    }),
  });
  return res.json();
}
