const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5050/api";

export async function searchClinics(query) {
  const res = await fetch(
    `${BASE_URL}/clinics/search?q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  return data.success ? data.data : [];
}

export async function searchClinicDoctors(orgId, query) {
  const res = await fetch(
    `${BASE_URL}/clinics/${orgId}/doctors?q=${encodeURIComponent(query)}`,
  );
  const data = await res.json();
  return data.success ? data.data : [];
}
