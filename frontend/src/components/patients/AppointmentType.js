"use client";

import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressIndicator from "../ProgressIndicator";
import useIntakeStore from "@/lib/intakeStore";
import {
  createAppointmentDetails,
  updateAppointmentDetails,
} from "@/lib/api/appointment_details";
import Title from "../Title";
import InfoCard from "../InfoCard";
import Image from "next/image";
import { toast } from "sonner";

export default function AppointmentType({ onNext }) {
  const { patientType, formData, clearFormData, sessionId } = useIntakeStore();
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

  const [selectedType, setSelectedType] = useState(
    appointmentTypes.find(
      (type) => type.patientType === formData.appointment?.type,
    )?.id ?? null,
  );

  const handleSelect = async (type) => {  
    const currentAppointmentType = formData.appointment?.type ?? patientType;
    
    const payload = {
      appointment_type: type.patientType,
    };

    const data = formData.appointment
    ? await updateAppointmentDetails(sessionId, payload)
    : await createAppointmentDetails(sessionId, payload);
    
    if (!data.success) {
      toast.error(data.message || "Error selecting type");
      return;
    }
    
    setSelectedType(type.id);
    
    if (type.patientType !== currentAppointmentType) {
      clearFormData();
    }
    onNext(payload, "appointment");
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
            <div className="relative z-10 p-4 md:p-8">
              <Title
                title="Choose Your Appointment Type"
                className="md:!text-2xl"
              />

              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator />

              {/* Choose your appointment Type Section */}
              <div className="mt-8 mb-16">
                {/* Discount Information */}
                <InfoCard
                  title="Important Discount Information"
                  description="Patients with a valid referral, Medicare number, and uploaded referral letter are eligible for our referral discount.
                        Patients without a referral will be charged standard consultation fees."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {appointmentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`
          relative cursor-pointer transition-all duration-200 hover:shadow-lg
          border-2 rounded-2xl bg-white p-3 text-center h-40 md:h-88 flex flex-col justify-center items-center
          ${
            selectedType === type.id
              ? "border-blue-600 shadow-lg"
              : "border-[#0575E63D] hover:border-gray-300"
          }
        `}
                        onClick={() => !loading && handleSelect(type)}
                      >
                        {/* Icon */}
                        <Image
                          src={type.icon}
                          width={type.width}
                          height={type.height}
                          alt="icon"
                          className=""
                        />

                        {/* Content */}
                        <h3 className="font-poppins text-sm md:text-[1.25rem] 2xl:text-[1.625rem] font-medium text-slate mb-1">
                          {type.title}
                        </h3>
                        <p className="font-poppins text-xs md:text-[1rem] 2xl:text-[1.5rem] text-slate mb-1 leading-tight">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
