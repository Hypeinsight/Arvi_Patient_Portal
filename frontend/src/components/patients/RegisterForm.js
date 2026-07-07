// /app/register/page.js
"use client";

import { createSession } from "@/lib/api";
import useIntakeStore from "@/lib/intakeStore";
import LoginForm from "@/components/patients/LoginForm";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const { initSession, goNext } = useIntakeStore();

  const handleRegisterSuccess = async (userId) => {
    // localStorage.setItem("user_token", token);
    const data = await createSession("new", userId, "doc-123", "apt-456");
    if (data.success) {
      initSession(data.session_id, data.patient_type, data.screens);
      goNext();
      router.push("/patients");
    }
  };

  return <LoginForm isRegister onLoginSuccess={handleRegisterSuccess} />;
}