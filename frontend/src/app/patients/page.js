"use client";

import { useEffect, useRef } from "react";

import useIntakeStore from "@/lib/intakeStore";

import MainPage from "@/components/patients/MainPage";
import RegisterForm from "@/components/patients/RegisterForm";
import ClinicDoctor from "@/components/patients/ClinicDoctor";
import AppointmentType from "@/components/patients/AppointmentType";
import PersonalDetails from "@/components/patients/PersonalDetails";
import MedicalDetails from "@/components/patients/MedicalDetails";
import ReviewAndSubmit from "@/components/patients/ReviewAndSubmit";
import Chat from "@/components/patients/Chat";
import { useRouter } from "next/navigation";

const SCREEN_MAP = {
  choose_access_method: MainPage,
  register: RegisterForm,
  choose_clinic_doctor: ClinicDoctor,
  choose_appointment_type: AppointmentType,
  // account_setup: AccountSetup,
  // upload_personal_details: UploadPersonalDetails,
  personal_details: PersonalDetails,
  // upload_medical_details: UploadMedicalDetails,
  medical_details: MedicalDetails,
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

  // The whole form lives on one URL, so record each screen as a browser
  // history entry to make the browser's Back/Forward buttons move between steps.
  const changedByBrowser = useRef(false);

  useEffect(() => {
    if (!currentScreen) return;
    if (changedByBrowser.current) {
      changedByBrowser.current = false;
      return;
    }

    // Keep Next.js's own history state, only add our step to it
    const state = window.history.state ?? {};
    if (state.intakeStep === currentScreen) return;

    if (!state.intakeStep && currentIndex > 0) {
      // First step entered: let Back return to the start of the form
      window.history.replaceState({ ...state, intakeStep: screens[0] }, "");
    }
    window.history.pushState(
      { ...window.history.state, intakeStep: currentScreen },
      "",
    );
  }, [currentScreen, currentIndex, screens]);

  useEffect(() => {
    const handlePopState = (event) => {
      const step = event.state?.intakeStep;
      const { screens, currentIndex, setCurrentIndex, reset } =
        useIntakeStore.getState();
      if (!step || !screens.length) return;

      // Back from the chat ends the intake and returns to the start page
      if (screens[currentIndex] === "chat") {
        const leave = window.confirm(
          "Leave the chat? Your chat answers won't be sent to your doctor.",
        );
        if (leave) {
          reset();
          router.replace("/");
        } else {
          window.history.pushState(
            { ...window.history.state, intakeStep: "chat" },
            "",
          );
        }
        return;
      }

      const index = screens.indexOf(step);
      if (index === -1 || index === currentIndex) return;
      changedByBrowser.current = true;
      setCurrentIndex(index);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

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
      // guest / new - just need a valid session, no token expected
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
