"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import Title from "@/components/Title";
import InfoCard from "@/components/InfoCard";
import AuthForm from "@/components/patients/AuthForm";
import { prefillSession } from "@/lib/api/session";

export default function MainPage({ onNext }) {
  const { initSession, patientType, clearFormData, sessionId, setPrefillData } =
    useIntakeStore();

  const [selectedMethod, setSelectedMethod] = useState(
    patientType === "guest" ? "guest" : patientType === "new" ? "create" : null,
  );
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  const handleLogin = () => {
    setAuthMode("login");
  };

  const handleCreateAccount = () => {
    setSelectedMethod("create");
    setAuthMode("register");
  };

  const handleClose = () => {
    setAuthMode(null);
  };

  const handleAuthSuccess = async (userId) => {
    const data = await createSession("pending", userId, "doc-123", "apt-456");

    if (data.success) {
      initSession(data.session_id, data.patient_type, data.screens);
      setAuthMode(null);

      if (authMode == "login") {
        const prefillData = await prefillSession(data.session_id);
        console.log("before prefill success");
        if (prefillData.success && prefillData.prefill) {
          setPrefillData(prefillData.prefill);
        }
      }

      onNext();
    }
  };

  const handleSelect = async (method) => {
    setSelectedMethod(method);
    setLoading(true);

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
    <div className="px-4 md:px-8 lg:px-16 font-poppins">
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
              onClick={() => !loading && handleCreateAccount()}
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
                <h3 className="text-xl font-semibold text-slate mb-3">
                  Create Account
                </h3>
                <p className="text-slate leading-relaxed opacity-70">
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
                <h3 className="text-xl font-semibold text-slate mb-3">
                  Continue as Guest
                </h3>
                <p className="text-slate opacity-70 leading-relaxed">
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

      {authMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-0"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAuthMode(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-dialog-title"
            className="relative w-full max-w-3xl"
          >
            <h2 id="auth-dialog-title" className="sr-only">
              {authMode === "register" ? "Create account" : "Patient login"}
            </h2>
            <AuthForm
              isRegister={authMode === "register"}
              isModal
              onClose={handleClose}
              onSuccess={handleAuthSuccess}
              onRegisterClick={() => setAuthMode("register")}
              onLoginClick={() => setAuthMode("login")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
