"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ProgressSteps from "@/components/ProgressSteps"
import { User, Users, ArrowLeft, ArrowRight } from "lucide-react"

export default function AppointmentType() {
  const [selectedType, setSelectedType] = useState(null)

  const steps = [
    { number: 1, title: "Appointment Type", isActive: true },
    { number: 2, title: "Privacy & Consent" },
    { number: 3, title: "Personal Details" },
    { number: 4, title: "Medical Details" },
    { number: 5, title: "Referral Details" },
    { number: 6, title: "Review & Submit" }
  ]

  const appointmentTypes = [
    {
      id: "new-patient",
      title: "New Patient",
      subtitle: "First time visiting our clinic",
      icon: User
    },
    {
      id: "follow-up-12-plus",
      title: "Follow-up",
      subtitle: "(More than 12 months)",
      description: "For Patients Returning After 12+ Months",
      icon: Users,
      hasLeftArrow: true
    },
    {
      id: "follow-up-12-less",
      title: "Follow-up",
      subtitle: "(Less than 12 months)",
      description: "For Patients Returning Within 12 Months",
      icon: Users,
      hasRightArrow: true
    }
  ]

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
          <div className="relative mt-7 h-186">
            {/* Custom SVG Background */}
            <svg 
  className="absolute inset-0 w-full h-full" 
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
            <div className="relative z-10 p-8">
            {/* Progress Indicator - Positioned in top right */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 w-80">
              {/* Text and Percentage Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)'
                    }}
                  >
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <span className="text-gray-700">Completing your registration...</span>
                </div>
                <span className="font-medium text-gray-900 text-sm">20%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #0575E6, #021B79)',
                    width: `20%`
                  }}
                ></div>
              </div>
            </div>

            {/* Choose your appointment Type Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-medium text-gray-900 mb-8">
                Choose Your Appointment Type
              </h2>

              {/* Discount Information */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)'
                    }}
                  >
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Important Discount Information</h3>
                    <p className="text-sm text-gray-700 mb-1">
                      Patients with a valid referral, Medicare number, and uploaded referral letter are eligible for our referral discount.
                    </p>
                    <p className="text-sm text-gray-700">
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
          border-2 rounded-lg bg-white p-3 text-center h-88 flex flex-col justify-center
          ${selectedType === type.id 
            ? 'border-blue-600 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
        onClick={() => setSelectedType(type.id)}
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