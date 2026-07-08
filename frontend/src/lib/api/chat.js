const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function sendChatMessage(sessionId, message) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

export async function fetchChatHistory(sessionId) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/chat-messages`);
  return res.json();
}