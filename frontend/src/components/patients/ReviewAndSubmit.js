"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressSteps from "@/components/ProgressSteps";
import { Check, Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from "@/lib/intakeStore";
import Title from "../Title";
import InfoCard from "../InfoCard";
import { createSummary } from "@/lib/api/summary";

export default function ReviewAndSubmit({ onNext, onBack }) {
  const { formData, patientType, sessionId } = useIntakeStore();
  console.log("ReviewAndSubmit formData:", formData);

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async () => {
    console.log("Navigate to next step");
    const data = await createSummary(sessionId);
    if (data.success) {
      onNext();
    }
  };

  const name = formData.personal
    ? `${formData.personal.first_name ?? ""} ${formData.personal.last_name ?? ""}`.trim()
    : "—";

  const appointmentType = formData.appointment?.type
    ? formData.appointment.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";

  const accessMethod = patientType === "guest" ? "Guest" : "Account User";

  const referral =
    formData.referral?.has_referral === true
      ? "Referral Discount Applied"
      : formData.referral?.has_referral === false
        ? "Standard Fees Apply"
        : "—";

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          <ProgressSteps currentStep={7} completedSteps={[1, 2, 3, 4, 5, 6]} />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Review & Submit" />

              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator />

              {/* Review & Submit Section */}
              <div className="mt-8 mb-16">
                {/* Form complete card */}
                <InfoCard
                  title="Form Complete!"
                  description="Your intake form is 90% complete. Please review the information below and submit when ready."
                  icon={Check}
                />

                {/* Summary Section */}
                <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-4">
                  Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Name:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">
                        {name}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Appointment Type:
                      </p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">
                        {appointmentType}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Access Method:
                      </p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">
                        {accessMethod}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 rounded-[1.125rem] h-20">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-1">Referral:</p>
                      <p className="text-sm md:text-base text-gray-900 font-medium">
                        {referral}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* What happens next card */}
                <InfoCard
                  title=" What happens next?"
                  description="After submission, you'll receive a confirmation email
                        with your appointment details. Our medical team will
                        review your information before your consultation."
                />
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
