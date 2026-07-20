"use client";

import { useEffect } from "react";

import useIntakeStore from "@/lib/intakeStore";

import MainPage from "@/components/patients/MainPage";
import RegisterForm from "@/components/patients/RegisterForm";
import AppointmentType from "@/components/patients/AppointmentType";
import PrivacyConsent from "@/components/patients/PrivacyConsent";
import PersonalDetails from "@/components/patients/PersonalDetails";
import MedicalDetails from "@/components/patients/MedicalDetails";
import ReferralDetails from "@/components/patients/ReferralDetails";
import ReviewAndSubmit from "@/components/patients/ReviewAndSubmit";
import Chat from "@/components/patients/Chat";
import { useRouter } from "next/navigation";

const SCREEN_MAP = {
  choose_access_method: MainPage,
  register: RegisterForm,
  choose_appointment_type: AppointmentType,
  privacy_consent: PrivacyConsent,
  // account_setup: AccountSetup,
  // upload_personal_details: UploadPersonalDetails,
  personal_details: PersonalDetails,
  // upload_medical_details: UploadMedicalDetails,
  medical_details: MedicalDetails,
  referral_details: ReferralDetails,
  review_submit: ReviewAndSubmit,
  chat: Chat,
};

const PUBLIC_SCREENS = new Set(["choose_access_method"]);

export default function PatientsPage() {
  const router = useRouter();
  const {
    screens,
    currentIndex,
    goNext,
    goBack,
    saveStepData,
    getProgress,
    patientType,
    sessionId,
  } = useIntakeStore();

  // return <UploadPersonalDetails onNext={() => {}} onBack={() => {}} progress={{ percent: 100 }} />;
  const currentScreen = screens[currentIndex];
  const isPublic = PUBLIC_SCREENS.has(currentScreen);

  useEffect(() => {
    if (!screens.length) return;
    if (isPublic) return;

    const needsToken =
      patientType === "followup_lt12" || patientType === "followup_gt12";

    if (needsToken) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("user_token")
          : null;
      if (!token) router.replace("/");
    } else {
      // guest / new — just need a valid session, no token expected
      if (!sessionId) router.replace("/");
    }
  }, [screens, currentIndex, isPublic, patientType, sessionId, router]);

  if (!screens.length) {
    console.log("No screens available, showing MainPage");
    return <MainPage onNext={() => goNext()} />;
  }

  if (!isPublic) {
    const needsToken =
      patientType === "followup_lt12" || patientType === "followup_gt12";
    if (needsToken) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("user_token")
          : null;
      if (!token) return null;
    } else if (!sessionId) {
      return null;
    }
  }

  const CurrentComponent = SCREEN_MAP[currentScreen];
  const progress = getProgress();

  if (!CurrentComponent) {
    console.log("Unknown screen: ", currentScreen);
    return <p>Unknown screen: {currentScreen}</p>;
  }

  return (
    <CurrentComponent
      onNext={(data, section) => {
        if (data && section) saveStepData(section, data);
        goNext();
      }}
      onBack={goBack}
      progress={progress}
    />
  );
}
