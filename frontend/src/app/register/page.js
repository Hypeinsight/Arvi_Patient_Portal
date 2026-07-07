"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "@/components/patients/RegisterForm";

export default function HomePage() {
  const router = useRouter();

  return (
    <RegisterForm/>
  );
}