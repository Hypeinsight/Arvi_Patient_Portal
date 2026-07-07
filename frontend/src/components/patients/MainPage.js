"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import InfoCard from "@/components/InfoCard";

export default function MainPage({ onNext }) {
  const router = useRouter();
  const { initSession, patientType, clearFormData, sessionId } =
    useIntakeStore();

  const [selectedMethod, setSelectedMethod] = useState(
    patientType === "guest" ? "guest" : patientType === "new" ? "create" : null,
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateAccount = () => {
    console.log("Create Account selected");
    setSelectedMethod("create");
    // Add your create account logic here
  };

  const handleContinueAsGuest = () => {
    console.log("Continue as Guest selected");
    setSelectedMethod("guest");
    // Add your guest logic here
  };

  const handleSelect = async (method) => {
    setSelectedMethod(method);
    setLoading(true);

    if (method === "create") {
      router.push("/register");
      setLoading(false);
      return;
    }

    const newPatientType = method === "guest" ? "guest" : "new";
    // const newPatientType = "guest";

    // Clear form data only if the patient type has changed
    if (newPatientType !== patientType) {
      clearFormData();
    }

    // const data = await createSession(newPatientType, "doc-123", "apt-456");

    // if (data.success) {
    //   initSession(data.session_id, data.patient_type, data.screens);
    //   onNext(); // no data to save for this screen, just advance
    // }

    if (newPatientType !== patientType || !sessionId) {
      const data = await createSession(newPatientType, null, "doc-123", "apt-456");
      if (data.success) {
        initSession(data.session_id, data.patient_type, data.screens);
      } else {
        setLoading(false);
        return;
      }
    }

    onNext();
    setLoading(false);
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="max-w-8xl mx-auto">
        {/* Page Title */}
        {/* <div className="mb-4">
          <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900 font-poppins">
            Patient Intake Form
          </h1>
        </div> */}

        {/* Choose Your Access Method Section */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm">
          <Title title="Choose Your Access Method" />

          {/* Existing Patient Login Card */}
          <InfoCard
            title="Existing Patient Login"
            description="Already have an account? Log in now to continue with the next process."
            buttonText="Login"
            onClick={handleLogin}
          />

          {/* Access Method Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Account Card */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-60 2xl:h-80 ${
                selectedMethod === "create"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => !loading && handleSelect("create")}
            >
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="mb-6">
                  <div className="relative mx-auto w-16 h-16">
                    <Image
                      src="/user1.png"
                      alt="User Icon"
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Account
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Save your information, track appointments, and access your
                  medical records anytime.
                </p>
              </CardContent>
            </Card>

            {/* Continue as Guest Card */}
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-60 2xl:h-80 ${
                selectedMethod === "guest"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              }`}
              onClick={() => !loading && handleSelect("guest")}
            >
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="mb-6">
                  <div className="relative mx-auto w-16 h-16">
                    <Image
                      src="/user2.png"
                      alt="User Icon"
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Continue as Guest
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick entry for this appointment only. Session expires after
                  completion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Links */}
        {/* <Footer/> */}
      </div>
    </div>
  );
}
