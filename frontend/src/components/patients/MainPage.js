"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  Lock,
  LogIn,
  UserPlus,
  UserRound,
} from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import AuthForm from "@/components/patients/AuthForm";
import { prefillSession } from "@/lib/api/session";

export default function MainPage({ onNext }) {
  const {
    initSession,
    patientType,
    clearFormData,
    sessionId,
    setPrefillData,
    saveStepData,
  } = useIntakeStore();

  const [selectedMethod, setSelectedMethod] = useState(
    patientType === "guest" ? "guest" : patientType === "new" ? "create" : null,
  );
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  const handleLogin = () => {
    setSelectedMethod("login");
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
      initSession(data.session_id, data.patient_type, data.screens, data.is_new_account);
      setAuthMode(null);

      // New accounts are booked as new patients by the backend, with no
      // appointment type screen; keep the store in step for the review
      if (data.patient_type === "new") {
        saveStepData("appointment", { appointment_type: "new" });
      }

      // Fill the form from the account's last intake (or its sign-up email)
      const prefillData = await prefillSession(data.session_id);
      if (prefillData.success && prefillData.prefill) {
        setPrefillData(prefillData.prefill);
      }

      onNext();
    }
  };

  const handleSelect = async (method) => {
    setSelectedMethod(method);
    setLoading(true);

    const newPatientType = method === "guest" ? "guest" : "new";

    // Clear form data only if the patient type has changed
    if (newPatientType !== patientType) {
      clearFormData();
    }

    if (newPatientType !== patientType || !sessionId) {
      const data = await createSession(newPatientType, null, "doc-123", "apt-456");
      if (data.success) {
        initSession(data.session_id, data.patient_type, data.screens, data.is_new_account);
      } else {
        setLoading(false);
        return;
      }
    }

    onNext();
    setLoading(false);
  };

  const accessOptions = [
    {
      id: "login",
      icon: LogIn,
      title: "Log In",
      description:
        "Returning patient? Log in to continue with your saved details.",
      action: "Log in",
      onClick: handleLogin,
    },
    {
      id: "create",
      icon: UserPlus,
      title: "Create Account",
      description:
        "Save your information, track appointments, and access your records anytime.",
      action: "Create account",
      onClick: handleCreateAccount,
    },
    {
      id: "guest",
      icon: UserRound,
      title: "Continue as Guest",
      description:
        "Quick entry for this appointment only. Nothing is saved for next time.",
      action: "Continue",
      onClick: () => handleSelect("guest"),
    },
  ];

  return (
    <div className="px-4 md:px-8 lg:px-16 font-poppins">
      <div className="max-w-8xl mx-auto">
        <div className="relative overflow-hidden bg-white rounded-[2.25rem] border border-[#0575E61F] shadow-sm px-4 py-6 md:px-10 md:py-8 flex flex-col tall:min-h-[calc(100dvh-9rem)] tall:py-12">
          {/* Soft brand glow */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -bottom-20 -left-16 w-[24rem] h-[24rem] rounded-full bg-[#7DB9F5]/25 blur-3xl" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[34rem] h-[26rem] rounded-full bg-[#0575E6]/15 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 w-[24rem] h-[24rem] rounded-full bg-[#7DB9F5]/25 blur-3xl" />
          </div>

          <div className="relative flex-1 flex flex-col">
            {/* Heading */}
            <div className="text-center max-w-xl mx-auto mb-6 tall:mb-10">
              <h1 className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-clip-text text-transparent font-semibold text-xl sm:text-2xl lg:text-3xl tall:text-4xl">
                Welcome to Arvi Health
              </h1>
              <p className="mt-2 text-sm tall:text-base text-[#4f7ca8]">
                Let&apos;s get you ready for your appointment. Choose how you&apos;d
                like to continue.
              </p>
            </div>

            {/* Access options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 tall:flex-1 tall:auto-rows-fr">
              {accessOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedMethod === option.id;
                const isBusy = loading && isSelected;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.onClick}
                    disabled={loading}
                    className={`group text-left flex flex-col h-full rounded-3xl p-5 md:p-6 tall:p-10 bg-white/80 backdrop-blur-sm border-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#0575E6]/50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                      isSelected
                        ? "border-[#0575E6] shadow-lg"
                        : "border-[#0575E61F] shadow-sm"
                    }`}
                  >
                    <span className="flex items-center justify-center w-12 h-12 tall:w-16 tall:h-16 rounded-2xl border border-[#0575E63D] text-[#0575E6] transition-colors group-hover:border-[#0575E6]">
                      <Icon className="w-6 h-6 tall:w-8 tall:h-8" strokeWidth={1.5} />
                    </span>

                    <h2 className="mt-4 tall:mt-8 text-lg md:text-xl tall:text-2xl font-semibold text-[#032B4A]">
                      {option.title}
                    </h2>
                    <p className="mt-2 tall:mt-3 text-sm tall:text-base text-[#4f7ca8] leading-relaxed flex-1">
                      {option.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm tall:text-base font-medium text-[#0575E6]">
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {option.action}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Reassurance */}
            <p className="mt-6 tall:mt-10 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#4f7ca8]">
              <Lock className="w-4 h-4 shrink-0" />
              Your medical information is stored securely and kept confidential.
            </p>
          </div>
        </div>
      </div>

      {authMode && (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[#032B4A]/40 backdrop-blur-sm px-4 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAuthMode(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-dialog-title"
            className="relative w-full max-w-3xl my-auto"
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
