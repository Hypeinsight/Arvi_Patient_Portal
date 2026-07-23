"use client";

import React, {useState} from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressSteps from "@/components/ProgressSteps";
import { Check } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from "@/lib/intakeStore";
import Title from "../Title";
import InfoCard from "../InfoCard";
import { createSummary } from "@/lib/api/summary";

export default function ReviewAndSubmit({ onNext, onBack }) {
  const { formData, patientType, sessionId } = useIntakeStore();
  const [loading, setLoading] = useState(false);
  console.log("ReviewAndSubmit formData:", formData);

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async () => {
    console.log("Navigate to next step");
    setLoading(true);
    const data = await createSummary(sessionId);
    setLoading(false);
    if (data.success) {
      onNext();
    }
  };

  const name = formData.personal
    ? `${formData.personal.first_name ?? ""} ${formData.personal.last_name ?? ""}`.trim()
    : "_";

  const dob = formData.personal?.date_of_birth
    ? new Date(formData.personal.date_of_birth).toLocaleDateString()
    : "_";

  const email = formData.personal?.email ?? "_";

  const phone = formData.personal?.phone ?? "_";

  const address = formData.personal?.address ?? "_";

  const appointmentType = formData.appointment?.type
    ? formData.appointment.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "_";

  const accessMethod = patientType === "guest" ? "Guest" : "Account User";

  const referral =
    formData.referral?.has_referral === true
      ? "Referral Discount Applied"
      : formData.referral?.has_referral === false
        ? "Standard Fees Apply"
        : "_";

  const summary = [
    { label: "Name", value: name },
    { label: "Date of Birth", value: dob },
    { label: "Email", value: email },
    { label: "Phone", value: phone },
    { label: "Address", value: address },
    { label: "Appointment Type", value: appointmentType },
    { label: "Access Method", value: accessMethod },
    { label: "Referral", value: referral },
  ];

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          <ProgressSteps />

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
                <div className="grid md:grid-cols-2 gap-4 mb-6 font-poppins max-h-[30vh] overflow-y-auto scrollbar">
                  {summary.map((item) => (
                    <Card
                      key={item.label}
                      className="bg-blue-50 rounded-[1.125rem] h-auto"
                    >
                      <CardContent className="p-4 flex items-center gap-1">
                        <p className="text-sm md:text-base font-medium text-slate">
                          {item.label}:
                        </p>
                        <p
                          className={`text-sm md:text-base text-light-gray font-medium ${item.label == "Email" ? "lowercase" : "capitalize"}`}
                        >
                          {item.value.length > 40 ? `${item.value.slice(0,5)}...` : item.value}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
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
                nextText="Chat"
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
