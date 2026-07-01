"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/patients/LoginForm";

export default function HomePage() {
  const router = useRouter();

  return (
    <LoginForm
      onRegisterClick={() => router.push("/patients")}
      onLoginSuccess={() => router.push("/dashboard")}
    />
  );
}