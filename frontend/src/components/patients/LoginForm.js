import React from 'react'
import { useRouter } from "next/navigation";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import AuthForm from "@/components/patients/AuthForm";

export default function LoginForm() {
   const router = useRouter();
  const { initSession, goNext } = useIntakeStore();

  const handleLoginSuccess = async (userId) => {
    const data = await createSession("new", userId, "doc-123", "apt-456");
    if (data.success) {
      initSession(data.session_id, data.patient_type, data.screens);
      goNext();
      router.push("/patients");
    }
  };

  return <AuthForm onSuccess={handleLoginSuccess} />;
}
