"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ProgressSteps from "@/components/ProgressSteps"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PrivacyConsent() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)

  const handlePrevious = () => {
    // Handle navigation to previous step
    console.log("Navigate to previous step")
  }

  const handleNext = () => {
    // Handle navigation to next step
    console.log("Navigate to next step")
  }

  const isNextDisabled = !acceptedTerms || !acceptedPrivacy

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
          <ProgressSteps currentStep={2} completedSteps={[1]} />

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
                  <span className="font-medium text-gray-900 text-sm">50%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)',
                      width: `50%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Privacy & Consent Section */}
<div className="mt-16 mb-16">
  <h2 className="text-2xl font-medium text-gray-900 mb-12">
    Privacy & Consent
  </h2>

  {/* Consent Checkboxes */}
  <div className="space-y-6 max-w-8xl">
    {/* Terms of Use Checkbox */}
    <div className="flex items-start gap-4 p-9 bg-blue-50 rounded-lg">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          style={{
            accentColor: '#0575E6'
          }}
        />
      </div>
      <label htmlFor="terms" className="text-base text-gray-900 cursor-pointer leading-relaxed">
        I accept the Terms of Use
      </label>
    </div>

    {/* Privacy Policy Checkbox */}
    <div className="flex items-start gap-4 p-9 bg-blue-50 rounded-lg">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          id="privacy"
          checked={acceptedPrivacy}
          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          style={{
            accentColor: '#0575E6'
          }}
        />
      </div>
      <label htmlFor="privacy" className="text-base text-gray-900 cursor-pointer leading-relaxed">
        I acknowledge that I have read and understand the Privacy Policy (Australian Privacy Principles compliant)
      </label>
    </div>

    {/* Marketing Consent Checkbox */}
    <div className="flex items-start gap-4 p-9 bg-blue-50 rounded-lg">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          id="marketing"
          checked={consentMarketing}
          onChange={(e) => setConsentMarketing(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          style={{
            accentColor: '#0575E6'
          }}
        />
      </div>
      <label htmlFor="marketing" className="text-base text-gray-900 cursor-pointer leading-relaxed">
        I consent to receiving appointment reminders, health tips, and promotional materials via email and SMS (optional)
      </label>
    </div>
  </div>
</div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-16">
                {/* Footer Links */}
                <div className="flex gap-4 text-sm text-gray-600">
                  <button className="hover:text-gray-900 transition-colors underline">
                    Privacy Policy
                  </button>
                  <span>|</span>
                  <button className="hover:text-gray-900 transition-colors underline">
                    Terms of Use
                  </button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-20">
                <button
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 bg-white rounded-full hover:bg-blue-50 flex items-center gap-2 transition-all duration-200 font-medium"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`px-8 py-3 rounded-full flex items-center gap-2 text-white font-medium transition-all duration-200 ${
                    isNextDisabled 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'hover:opacity-90'
                    }`}
                    style={!isNextDisabled ? {
                    background: 'linear-gradient(135deg, #0575E6, #021B79)'
                    } : {}}
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}