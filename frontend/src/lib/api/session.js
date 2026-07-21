const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export async function createSession(
  patientType,
  userId,
  doctorId,
  appointmentId,
) {
  console.log("patient type: ", patientType);
  const token = typeof window !== "undefined"
    ? localStorage.getItem("user_token")
    : null;
  
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(userId && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      patient_type: patientType,
      user_id: userId,
      doctor_id: doctorId,
      appointment_id: appointmentId,
    }),
  });
  return res.json();
}
