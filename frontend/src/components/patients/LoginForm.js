import React from 'react'
import { useRouter } from "next/navigation";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import AuthForm from "@/components/patients/AuthForm";

export default function LoginForm() {
   const router = useRouter();
  const { initSession, goNext } = useIntakeStore();

  const handleLoginSuccess = async (userId) => {
    const data = await createSession("followup_lt12", userId, "doc-123", "apt-456"); // TODO: Check the users creation date and then determine if they are a new or returning patient. If we put new everytime, backend will throw an error.  
    if (data.success) {
      initSession(data.session_id, data.patient_type, data.screens);
      goNext();
      router.push("/patients");
    }
  };

  return <AuthForm onSuccess={handleLoginSuccess}/>;
}
