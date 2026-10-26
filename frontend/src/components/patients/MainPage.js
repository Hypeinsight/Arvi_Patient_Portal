"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Loader2,
  Lock,
  LogIn,
  UserPlus,
  UserRound,
} from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { createSession } from "@/lib/api/session";
import AuthForm from "@/components/patients/AuthForm";
import ForgotPasswordForm from "@/components/patients/ForgotPasswordForm";
import { prefillSession } from "@/lib/api/session";

const AUTH_COPY = {
  login: {
    title: "Welcome back!",
    prompt: "Don't have an account?",
    switchLabel: "Create a new account now",
    switchNote: "it's free and takes less than a minute.",
  },
  register: {
    title: "Create your account",
    prompt: "Already have an account?",
    switchLabel: "Log in instead",
    switchNote: "your saved details will be filled in for you.",
  },
  forgot: {
    title: "Forgot your password?",
    prompt: "Enter the email you signed up with and we'll send you a link to choose a new one. Remembered it?",
    switchLabel: "Back to log in",
    switchNote: "",
  },
};

// Concentric arcs drawn behind the brand panel text
function BrandArcs() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M ${-80 + i * 40} 820 C ${120 + i * 40} ${560 - i * 30}, ${300 + i * 45} ${
            320 - i * 25
          }, ${340 + i * 50} ${40 + i * 30}`}
          stroke="#0575E6"
          strokeOpacity="0.1"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

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

  // Escape returns from the sign-in view to the access options
  useEffect(() => {
    if (!authMode) return;
    const handleKey = (event) => {
      if (event.key === "Escape") setAuthMode(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [authMode]);

  const handleAuthSuccess = async (userId) => {
    const data = await createSession("pending", userId);

    if (data.success) {
      // Stay on the sign-in view until the next step shows, so the access
      // options don't flash up while the prefill loads
      initSession(data.session_id, data.patient_type, data.screens, data.is_new_account);

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
      const data = await createSession(newPatientType, null);
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

  if (authMode) {
    const copy = AUTH_COPY[authMode];

    return (
      <div className="px-4 md:px-8 lg:px-16 font-poppins">
        <div className="max-w-8xl mx-auto">
          <div className="grid md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] overflow-hidden bg-white rounded-[2.25rem] border border-[#0575E61F] shadow-sm md:min-h-[calc(100dvh-9rem)] short:md:min-h-[calc(100dvh-5rem)]">
            {/* Brand panel */}
            <aside className="relative overflow-hidden bg-gradient-to-br from-[#F5F9FF] via-[#EDF4FF] to-[#E3EEFC] border-b md:border-b-0 md:border-r border-[#0575E61F] px-6 py-6 md:px-14 md:py-14 short:md:py-8 flex flex-col">
              {/* Soft brand glow, as on the welcome page */}
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute -bottom-24 -left-16 w-[26rem] h-[26rem] rounded-full bg-[#7DB9F5]/30 blur-3xl" />
                <div className="absolute -top-20 -right-16 w-[20rem] h-[20rem] rounded-full bg-[#0575E6]/10 blur-3xl" />
              </div>
              <BrandArcs />

              <div className="relative flex-1 flex flex-col">
                
                <div className="md:my-auto">
                  <h1 className="mt-6 md:mt-0 pb-1 bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-clip-text text-transparent text-3xl md:text-5xl short:md:text-4xl tall:text-6xl font-bold leading-[1.1] tracking-tight">
                    Hello,
                    <br />
                    welcome to Arvi!
                  </h1>
                  <p className="mt-4 md:mt-6 short:md:mt-4 max-w-md text-sm md:text-lg short:md:text-base text-[#4f7ca8] leading-relaxed">
                    Share your details and health history before your visit, so
                    your doctor is ready for you the moment you walk in.
                  </p>
                </div>

                <p className="hidden md:flex items-center gap-2 text-sm text-[#4f7ca8]">
                  <Lock className="w-4 h-4 shrink-0" />
                  © {new Date().getFullYear()} Arvi Health. Your information
                  stays private and secure.
                </p>
              </div>
            </aside>

            {/* Form panel */}
            <section
              aria-labelledby="auth-heading"
              className="relative px-6 py-6 md:px-14 md:py-14 short:md:py-6 flex flex-col"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f7ca8] cursor-pointer hover:text-[#032B4A] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              <div className="w-full max-w-sm mx-auto my-auto pt-10 short:pt-3">
                <h2
                  id="auth-heading"
                  className="text-2xl sm:text-3xl short:sm:text-2xl font-bold text-[#032B4A]"
                >
                  {copy.title}
                </h2>
                <p className="mt-2 text-sm text-[#4f7ca8] leading-relaxed">
                  {copy.prompt}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      const next = authMode === "login" ? "register" : "login";
                      setAuthMode(next);
                      setSelectedMethod(next === "register" ? "create" : "login");
                    }}
                    className="font-semibold text-[#0575E6] underline underline-offset-2 cursor-pointer hover:text-[#032B4A]"
                  >
                    {copy.switchLabel}
                  </button>
                  {copy.switchNote && `, ${copy.switchNote}`}
                </p>

                <div className="mt-8 short:mt-5">
                  {authMode === "forgot" ? (
                    <ForgotPasswordForm onBackToLogin={() => setAuthMode("login")} />
                  ) : (
                    <AuthForm
                      variant="plain"
                      isRegister={authMode === "register"}
                      onSuccess={handleAuthSuccess}
                      onForgotPassword={() => setAuthMode("forgot")}
                    />
                  )}
                </div>

                {authMode !== "forgot" && (
                <>
                <div className="mt-8 short:mt-4 flex items-center gap-3 text-xs text-[#4f7ca8]/70">
                  <span className="flex-1 h-px bg-[#0575E61F]" />
                  or
                  <span className="flex-1 h-px bg-[#0575E61F]" />
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect("guest")}
                  disabled={loading}
                  className="mt-4 short:mt-3 w-full h-12 short:h-11 rounded-xl border border-[#0575E63D] bg-white text-sm font-medium text-[#032B4A] inline-flex items-center justify-center gap-2 cursor-pointer hover:border-[#0575E6] hover:bg-[#F5F9FF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserRound className="w-4 h-4" />
                      Continue as guest
                    </>
                  )}
                </button>
                </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

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
    </div>
  );
}
