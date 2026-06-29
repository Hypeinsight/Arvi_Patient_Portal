"use client";

import useIntakeStore from '@/lib/intakeStore';
import { createSession } from "@/lib/api";

import MainPage from "@/components/patients/MainPage";
import AppointmentType from "@/components/patients/AppointmentType";
import PrivacyConsent from "@/components/patients/PrivacyConsent";
import AccountSetup from "@/components/patients/AccountSetup";
import UploadPersonalDetails from "@/components/patients/UploadPersonalDetails";
import PersonalDetails from "@/components/patients/PersonalDetails";
import UploadMedicalDetails from "@/components/patients/UploadMedicalDetails";
import MedicalDetails from "@/components/patients/MedicalDetails";
import ReferralDetails from "@/components/patients/ReferralDetails";
import ReviewAndSubmit from "@/components/patients/ReviewAndSubmit";
import AllSet from "@/components/patients/AllSet";

const SCREEN_MAP = {
  choose_access_method: MainPage,
  choose_appointment_type: AppointmentType,
  privacy_consent: PrivacyConsent,
  account_setup: AccountSetup,
  upload_personal_details: UploadPersonalDetails,
  personal_details: PersonalDetails,
  upload_medical_details: UploadMedicalDetails,
  medical_details: MedicalDetails,
  referral_details: ReferralDetails,
  review_submit: ReviewAndSubmit,
  all_set: AllSet,
};

export default function PatientsPage() {
  const {
    screens,
    currentIndex,
    goNext,
    goBack,
    saveStepData,
    getProgress,
  } = useIntakeStore();

  // return <UploadPersonalDetails onNext={() => {}} onBack={() => {}} progress={{ percent: 100 }} />;

  if (!screens.length) {
    return (
      <MainPage
        onNext={() => goNext()}
      />
    );
  }

  const currentScreen = screens[currentIndex];
  const CurrentComponent = SCREEN_MAP[currentScreen];
  const progress = getProgress();

  if (!CurrentComponent) {
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
