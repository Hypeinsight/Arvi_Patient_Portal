"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressSteps from "@/components/ProgressSteps";
import { Check, Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator"
import NavigationButtons from "@/components/NavigationButtons"
import useIntakeStore from "@/lib/intakeStore"
import { goToChat } from "@/lib/api"

export default function ReviewAndSubmit({ onNext, onBack }) {
  const { formData, patientType, sessionId } = useIntakeStore()
  console.log("ReviewAndSubmit formData:", formData)

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async () => {
    console.log("Navigate to next step");
    const result = await goToChat(sessionId, formData)
    if (result.success) {
      onNext()
    }
  };

  const name = formData.personal
    ? `${formData.personal.first_name ?? ""} ${formData.personal.last_name ?? ""}`.trim()
    : "—"

  const appointmentType = formData.appointment?.type
    ? formData.appointment.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "—"

  const accessMethod = patientType === "guest" ? "Guest" : "Account User"

  const referral = formData.referral?.has_referral === true
    ? "Referral Discount Applied"
    : formData.referral?.has_referral === false
    ? "Standard Fees Apply"
    : "—"

  return (
    <div className="min-h-screen xs:px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8 px-4 xs:px-0">
        <div className="max-w-8xl mx-auto">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900 font-poppins">
              Patient Intake Form
            </h1>
          </div>

          <ProgressSteps currentStep={7} completedSteps={[1, 2, 3, 4, 5, 6]} />

          {/* Main White Container */}
          <div className="relative mt-7 min-h-[700px] bg-white rounded-4xl md:bg-transparent">
            {/* Custom SVG Background */}
            <svg
              className="absolute inset-0 w-full h-full hidden md:block"
              viewBox="0 0 1320 600"
              preserveAspectRatio="none"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))" }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1292 65C1307.464 65 1320 77.536 1320 93V568C1320 583.464 1307.464 596 1292 596H36C16.1178 596 0 579.882 0 560V540V528V36C0 16.1178 16.1178 0 36 0H570.123C580.863 0 588.794 5.1585 593.994 11.5561L661.498 55.556C666.429 61.469 675.812 65 685.998 65H1292Z"
                fill="white"
              />
            </svg>

            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator/>

              <div className="mt-16 md:mt-0 mb-8">
                <h2 className="text-base sm:text-[1.25rem] lg:text-3xl xl:text-[2rem] font-medium text-gray-800 mb-8 font-poppins">
                  Review & Submit
                </h2>
              </div>

              {/* Review & Submit Section */}
              <div className="mt-8 md:mt-16 mb-16">
                {/* Form complete card */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-green-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-1">
                        Form Complete!
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700">
                            Your intake form is 90% complete. Please review the
                            information below and submit when ready.
                      </p>
                    </div>
                  </div>
                    </div>

                {/* Summary Section */}
                <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-4">Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Name:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">{name}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Appointment Type:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">{appointmentType}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Access Method:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">{accessMethod}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Referral:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">{referral}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* What happens next card */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info
                      className="w-5 md:w-8 text-blue-600 stroke-white"
                      fill="currentColor"
                    />
                    <div>
                      <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-1">
                        What happens next?
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700">
                        After submission, you'll receive a confirmation email
                        with your appointment details. Our medical team will
                        review your information before your consultation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <NavigationButtons
                onBack={handlePrevious}
                onNext={handleNext}
                nextText="Submit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
