"use client";

import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import useIntakeStore from "@/lib/intakeStore";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import Title from "../Title";
import { Checkbox } from "@/components/ui/checkbox";
import { createConsent, updateConsent } from "@/lib/api/consent";

export default function PrivacyConsent({ onNext, onBack, progress }) {
  const { formData: storeData, sessionId } = useIntakeStore();

  const [acceptedTerms, setAcceptedTerms] = useState(
    storeData.consent?.accepted_terms ?? false,
  );
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(
    storeData.consent?.accepted_privacy ?? false,
  );
  const [consentMarketing, setConsentMarketing] = useState(
    storeData.consent?.consent_marketing ?? false,
  );

  const handlePrevious = () => {
    // Handle navigation to previous step
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async () => {
    if (isNextDisabled) return;

    const payload = {
      accepted_terms: acceptedTerms,
      accepted_privacy: acceptedPrivacy,
      consent_marketing: consentMarketing,
      timestamp: new Date().toISOString(),
    };

    const data = storeData.consent
      ? await updateConsent(
          sessionId,
          payload
        )
      : await createConsent(
          sessionId,
          payload
        );

    if (data.success) {
      onNext(payload, "consent");
    }
  };

  const isNextDisabled = !acceptedTerms || !acceptedPrivacy;

  return (
    <div className="px-4 md:px-8 lg:px-16 font-poppins">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          {/* Page Title */}
          {/* <div className="mb-4">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900 font-poppins">
              Patient Intake Form
            </h1>
          </div> */}

          {/* Progress Steps */}
          <ProgressSteps />

          {/* Main White Container */}
          <div className="relative bg-white rounded-4xl mt-4">
            {/* Custom SVG Background */}
            {/* <svg
              className="absolute inset-0 w-full h-full hidden md:block"
              viewBox="0 0 1320 600"
              preserveAspectRatio="none"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))" }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                // d="M1292 80C1307.464 80 1320 92.536 1320 108V568C1320 583.464 1307.464 596 1292 596H36C16.1178 596 0 579.882 0 560V540V528V36C0 16.1178 16.1178 0 36 0H670.123C680.863 0 688.794 5.1585 693.994 11.5561L761.498 68.556C766.429 75.469 775.812 80 785.998 80H1292Z"
                d="M1292 65C1307.464 65 1320 77.536 1320 93V568C1320 583.464 1307.464 596 1292 596H36C16.1178 596 0 579.882 0 560V540V528V36C0 16.1178 16.1178 0 36 0H570.123C580.863 0 588.794 5.1585 593.994 11.5561L661.498 55.556C666.429 61.469 675.812 65 685.998 65H1292Z"
  
                fill="white"
              />
            </svg> */}

            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Privacy & Consent" />

              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator />

              {/* Privacy & Consent Section */}
              <div className="mt-8 mb-16">
                {/* Consent Checkboxes */}
                <div className="space-y-6 max-w-8xl">
                  {/* Terms of Use Checkbox */}
                  <div className="flex items-start gap-4 p-3 md:p-4 bg-blue-50 rounded-2xl">
                    <div className="relative mt-0.5">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) =>
                          setAcceptedTerms(!!checked)
                        }
                        className="w-4 md:w-5 h-4 md:h-5 rounded-sm md:rounded-md cursor-pointer border-2 border-blue-300 data-[state=checked]:bg-[#0575E6] data-[state=checked]:border-[#0575E6]"
                      />
                    </div>
                    <label
                      htmlFor="terms"
                      className="text-sm md:text-base text-gray-900 cursor-pointer leading-relaxed"
                    >
                      I accept the Terms of Use
                    </label>
                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start gap-4 p-3 md:p-4 bg-blue-50 rounded-2xl">
                    <div className="relative mt-0.5">
                      <Checkbox
                        id="privacy"
                        checked={acceptedPrivacy}
                        onCheckedChange={(checked) =>
                          setAcceptedPrivacy(!!checked)
                        }
                        className="w-4 md:w-5 h-4 md:h-5 rounded-sm md:rounded-md cursor-pointer border-2 border-blue-300 data-[state=checked]:bg-[#0575E6] data-[state=checked]:border-[#0575E6]"
                      />
                    </div>
                    <label
                      htmlFor="privacy"
                      className="text-sm md:text-base text-gray-900 cursor-pointer leading-relaxed"
                    >
                      I acknowledge that I have read and understand the Privacy
                      Policy (Australian Privacy Principles compliant)
                    </label>
                  </div>

                  {/* Marketing Consent Checkbox */}
                  <div className="flex items-start gap-4 p-3 md:p-4 bg-blue-50 rounded-2xl">
                    <div className="relative mt-0.5">
                      <Checkbox
                        id="marketing"
                        checked={consentMarketing}
                        onCheckedChange={(checked) =>
                          setConsentMarketing(!!checked)
                        }
                        className="w-4 md:w-5 h-4 md:h-5 rounded-sm md:rounded-md cursor-pointer border-2 border-blue-300 data-[state=checked]:bg-[#0575E6] data-[state=checked]:border-[#0575E6]"
                      />
                    </div>
                    <label
                      htmlFor="marketing"
                      className="text-sm md:text-base text-gray-900 cursor-pointer leading-relaxed"
                    >
                      I consent to receiving appointment reminders, health tips,
                      and promotional materials via email and SMS (optional)
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <NavigationButtons
                onBack={handlePrevious}
                onNext={handleNext}
                isNextDisabled={!acceptedTerms || !acceptedPrivacy}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
