"use client"

import { useState } from "react"
import ProgressSteps from "@/components/ProgressSteps"
import { User, Users, ArrowLeft, ArrowRight, Info } from "lucide-react"
import ProgressIndicator from "../ProgressIndicator"
import useIntakeStore from "@/lib/intakeStore"

export default function AppointmentType({onNext}) {
  const { patientType, formData, clearFormData } = useIntakeStore()
  const [loading, setLoading] = useState(false)

  const appointmentTypes = [
    {
      id: "new",
      patientType: "new",
      title: "New Patient",
      subtitle: "First time visiting our clinic",
      icon: User
    },
    {
      id: "follow-up-12-plus",
      patientType: "followup_gt12",
      title: "Follow-up",
      subtitle: "(More than 12 months)",
      description: "For Patients Returning After 12+ Months",
      icon: Users,
      hasLeftArrow: true
    },
    {
      id: "follow-up-12-less",
      patientType: "followup_lt12",
      title: "Follow-up",
      subtitle: "(Less than 12 months)",
      description: "For Patients Returning Within 12 Months",
      icon: Users,
      hasRightArrow: true
    }
  ]

  const [selectedType, setSelectedType] = useState(
    appointmentTypes.find(
      type => type.patientType === formData.appointment?.type
    )?.id ?? null
  )

 const handleSelect = async (type) => {
  setSelectedType(type.id)

  const currentAppointmentType = formData.appointment?.type ?? patientType
  if (type.patientType !== currentAppointmentType) {
    clearFormData()
  }

  onNext({ type: type.patientType }, "appointment")
}

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-8xl mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900">Patient Intake Form</h1>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={1} />

          {/* Main White Container */}
          <div className="relative mt-7 min-h-[700px]  bg-white rounded-4xl md:bg-transparent">
            {/* Custom SVG Background */}
            <svg 
  className="absolute inset-0 w-full h-full hidden md:block" 
  viewBox="0 0 1320 600" 
  preserveAspectRatio="none"
  style={{ filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))' }}
>
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M1292 80C1307.464 80 1320 92.536 1320 108V568C1320 583.464 1307.464 596 1292 596H36C16.1178 596 0 579.882 0 560V540V528V36C0 16.1178 16.1178 0 36 0H670.123C680.863 0 688.794 5.1585 693.994 11.5561L761.498 68.556C766.429 75.469 775.812 80 785.998 80H1292Z"
    fill="white"
  />
</svg>
            
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
            {/* Progress Indicator - Positioned in top right */}
            <ProgressIndicator/>

            <div className="mt-16 md:mt-0 mb-8">
                <h2 className="text-base sm:text-[1.25rem] lg:text-3xl xl:text-[2rem] font-medium text-gray-800 mb-8 font-poppins">
                  Choose Your Appointment Type
                </h2>
              </div>

            {/* Choose your appointment Type Section */}
            <div className="mt-8 md:mt-16 mb-16">

              {/* Discount Information */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                     <Info
                        className="w-5 md:w-8 text-blue-600 stroke-white"
                        fill="currentColor"
                      />
                    <div>
                      <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-1">
                        Important Discount Information
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Patients with a valid referral, Medicare number, and uploaded referral letter are eligible for our referral discount.
                        Patients without a referral will be charged standard consultation fees.
                      </p>
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {appointmentTypes.map((type) => {
    const Icon = type.icon
    return (
      <div
        key={type.id}
        className={`
          relative cursor-pointer transition-all duration-200 hover:shadow-lg 
          border-2 rounded-lg bg-white p-3 text-center h-40 md:h-88 flex flex-col justify-center
          ${selectedType === type.id 
            ? 'border-blue-600 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
        onClick={() => !loading && handleSelect(type)}
      >
        {/* Left Arrow */}
        {type.hasLeftArrow && (
          <ArrowLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
        )}

        {/* Icon */}
        <div className="mb-2 flex justify-center">
          <div className="relative">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0575E6, #021B79)'
              }}
            >
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            {type.id !== "new-patient" && (
              <div 
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #0575E6, #021B79)'
                }}
              ></div>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          {type.title}
        </h3>
        <p className="text-xs text-gray-600 mb-1 leading-tight">
          {type.subtitle}
        </p>
        {type.description && (
          <p className="text-xs text-gray-500 leading-tight">
            {type.description}
          </p>
        )}

        {/* Right Arrow */}
        {type.hasRightArrow && (
          <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
        )}
      </div>
    )
  })}
</div>
            </div>

            {/* Footer Links */}
            <div className="flex gap-4 text-sm text-gray-600 mt-12">
              <button className="hover:text-gray-900 transition-colors underline">
                Privacy Policy
              </button>
              <span>|</span>
              <button className="hover:text-gray-900 transition-colors underline">
                Terms of Use
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
