const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createReferralDetails(
  sessionId,
  referralData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/referral-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(referralData),
  });
  return res.json();
}

export async function updateReferralDetails(
  sessionId,
  referralData
) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/referral-details`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(referralData),
  });
  return res.json();
}

