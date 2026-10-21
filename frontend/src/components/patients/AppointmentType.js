"use client";

import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import useIntakeStore from "@/lib/intakeStore";
import {
  createAppointmentDetails,
  updateAppointmentDetails,
} from "@/lib/api/appointment_details";
import Title from "../Title";
import NavigationButtons from "@/components/NavigationButtons";
import Image from "next/image";
import { toast } from "sonner";

export default function AppointmentType({ onNext, onBack }) {
  const {
    patientType,
    formData,
    clearFormData,
    sessionId,
    updatePatientFlow,
    isNewAccount,
  } = useIntakeStore();
  const [loading, setLoading] = useState(false);

  const appointmentTypes = [
    {
      id: "new",
      patientType: "new",
      title: "New Patient",
      description: "First time visiting our clinic",
      icon: "/user1.png",
      width: 70,
      height: 70,
    },
    {
      id: "follow-up-12-plus",
      patientType: "followup_gt12",
      title: "Follow-up",
      subtitle: "(More than 12 months)",
      description: "For Patients Returning After 12+ Months",
      icon: "/user3.png",
      width: 100,
      height: 100,
    },
    {
      id: "follow-up-12-less",
      patientType: "followup_lt12",
      title: "Follow-up",
      subtitle: "(Less than 12 months)",
      description: "For Patients Returning Within 12 Months",
      icon: "/user4.png",
      width: 100,
      height: 100,
    },
  ];

  // The backend only accepts "new" for accounts without a completed intake,
  // and only follow-ups for accounts that have one.
  const availableTypes = appointmentTypes.filter((type) =>
    isNewAccount ? type.patientType === "new" : type.patientType !== "new",
  );

  const [selectedType, setSelectedType] = useState(
    appointmentTypes.find(
      (type) =>
        type.patientType ===
        (formData.appointment?.appointment_type ?? formData.appointment?.type),
    )?.id ?? null,
  );

  // Clicking a card only selects it; Next saves the choice and moves on,
  // like the other form steps
  const handleNext = async () => {
    const type = appointmentTypes.find((t) => t.id === selectedType);
    if (!type) return;

    const payload = {
      appointment_type: type.patientType,
    };

    setLoading(true);
    try {
      const data = formData.appointment
        ? await updateAppointmentDetails(sessionId, payload)
        : await createAppointmentDetails(sessionId, payload);

      if (!data.success) {
        toast.error(data.message || "Error selecting type");
        return;
      }

      updatePatientFlow(data.patient_type, data.screens);
      onNext(payload, "appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          {/* Progress Steps */}
          <ProgressSteps />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-6 tall:p-8">
              <Title
                title="Choose Your Appointment Type"
                className="md:!text-2xl"
              />


              {/* Choose your appointment Type Section */}
              <div className="mt-5 mb-6 tall:mt-8 tall:mb-12">
                <div
                  className={`grid grid-cols-1 gap-4 md:gap-6 ${
                    availableTypes.length > 2
                      ? "md:grid-cols-3"
                      : "md:grid-cols-2"
                  }`}
                >
                  {availableTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`
          relative cursor-pointer transition-all duration-200 hover:shadow-lg
          border-2 rounded-2xl bg-white p-3 text-center h-36 md:h-52 tall:h-88 flex flex-col justify-center items-center
          ${
            selectedType === type.id
              ? "border-blue-600 shadow-lg"
              : "border-[#0575E63D] hover:border-gray-300"
          }
        `}
                        onClick={() => !loading && setSelectedType(type.id)}
                      >
                        {/* Icon */}
                        <Image
                          src={type.icon}
                          width={type.width}
                          height={type.height}
                          alt="icon"
                          className="h-14 w-auto tall:h-[5.5rem]"
                        />

                        {/* Content */}
                        <h3 className="font-poppins text-sm md:text-[1.125rem] tall:text-[1.625rem] font-medium text-slate mb-1">
                          {type.title}
                        </h3>
                        <p className="font-poppins text-xs md:text-[0.9375rem] tall:text-[1.5rem] text-slate mb-1 leading-tight">
                          {type.subtitle}
                        </p>
                        {type.description && (
                          <p className="font-poppins text-xs md:text-[1rem] text-slate opacity-70 leading-tight">
                            {type.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next saves the selected appointment type */}
              <NavigationButtons
                onBack={onBack}
                onNext={handleNext}
                isNextDisabled={!selectedType}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
