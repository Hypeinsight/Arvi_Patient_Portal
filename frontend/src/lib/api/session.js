const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createSession(patientType, doctorId, appointmentId) {
  const headers = { "Content-Type": "application/json" };

  // attach JWT for non-guest users
  if (patientType !== "guest") {
    const token = localStorage.getItem("user_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      patient_type: patientType,
      doctor_id: doctorId,
      appointment_id: appointmentId,
    }),
  });
  return res.json();
}