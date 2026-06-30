"use client";

import LoginForm from "@/components/patients/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginFormPage() {
    const router = useRouter();
    const onClick = () => {
        console.log("Login clicked");
        // Add your login logic here
        router.push("/patients");
    }


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <LoginForm onRegisterClick={onClick} />
      </div>
    );

}
