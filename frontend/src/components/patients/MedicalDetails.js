"use client"

import { useState } from "react"
import ProgressSteps from "@/components/ProgressSteps"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

export default function MedicalDetails({onNext, onBack, progress}) {
  const [formData, setFormData] = useState({
    currentConditions: "",
    currentMedications: "",
    allergies: "",
    previousSurgeries: "",
    familyMedicalHistory: "",
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePrevious = () => {
    console.log("Navigate to previous step")
    onBack()
  }

  const handleNext = () => {
    console.log("Navigate to next step")
    onNext(
      {
        conditions: formData.currentConditions
          ? formData.currentConditions.split(",").map(s => s.trim())
          : [],
        medications: formData.currentMedications
          ? formData.currentMedications.split(",").map(s => s.trim())
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(",").map(s => s.trim())
          : [],
        previous_surgeries: formData.previousSurgeries,
        family_history: formData.familyMedicalHistory,
      },
      "medical"
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-8xl mx-auto ">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900">Patient Intake Form</h1>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={5} completedSteps={[1, 2, 3, 4]} />

          {/* Main White Container */}
          <div className="relative mt-7 min-h-[700px]">
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
                  <span className="font-medium text-gray-900 text-sm">{progress?.percent ?? 0}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)',
                      width: `${progress?.percent ?? 0}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Medical Details Section */}
              <div className="mt-8 mb-16">
                <div className="mb-8">
                  <h2 className="text-4xl font-medium text-gray-900">
                    Medical Details
                  </h2>
                </div>

                 {/* Information */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #0575E6, #021B79)'
                        }}
                      >
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Scanned Documents Overview</h3>
                        <p className="text-sm text-gray-700">
                          Below is a list of all the details we’ve received. Double-check the files and update or remove any if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Medical Conditions*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.currentConditions}
                        onChange={e => handleInputChange("currentConditions", e.target.value)}
                        placeholder="List any current medical conditions you have"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Medications*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.currentMedications}
                        onChange={e => handleInputChange("currentMedications", e.target.value)}
                        placeholder="List all medications you are currently taking"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.allergies}
                        onChange={e => handleInputChange("allergies", e.target.value)}
                        placeholder="List any known allergies (Medications, food, environment)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Surgeries*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.previousSurgeries}
                        onChange={e => handleInputChange("previousSurgeries", e.target.value)}
                        placeholder="List any previous surgeries with dates"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Row 3 — full width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Medical History*
                    </label>
                    <textarea
                      rows={4}
                      value={formData.familyMedicalHistory}
                      onChange={e => handleInputChange("familyMedicalHistory", e.target.value)}
                      placeholder="Relevant family medical history (Heart Disease, diabetes, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </form>

               
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
                <div className="flex gap-4">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 bg-white rounded-full hover:bg-blue-50 flex items-center gap-2 transition-all duration-200 font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-full flex items-center gap-2 text-white font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)'
                    }}
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