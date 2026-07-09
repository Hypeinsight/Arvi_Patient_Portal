const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createSession(patientType, userId, doctorId, appointmentId) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_type: patientType,
      user_id: userId,
      doctor_id: doctorId,
      appointment_id: appointmentId,
    }),
  });
  return res.json();
}
