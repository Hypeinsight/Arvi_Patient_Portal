"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ProgressSteps from "@/components/ProgressSteps"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

export default function UploadMedicalDetails() {
  const [selectedFile, setSelectedFile] = useState(null)

  const handlePrevious = () => {
    console.log("Navigate to previous step")
  }

  const handleNext = () => {
    console.log("Navigate to next step")
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a JPG, PNG, or PDF file")
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleSkip = () => {
    console.log("Skip this step")
    // Navigate to next step or handle skip logic
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
                  <span className="font-medium text-gray-900 text-sm">60%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #0575E6, #021B79)',
                      width: `60%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Upload Your Medical Details Section */}
              <div className="mt-8 mb-16">
                <div className="mb-8">
                  <h2 className="text-4xl font-medium text-gray-900">
                    Upload Your Medical Details
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
                        <h3 className="font-medium text-gray-900 mb-1">Document Upload Required</h3>
                        <p className="text-sm text-gray-700">
                          To complete this process, uploading your medical documents is required. Ensure your files are clear and accurate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Description */}
                <p className="text-gray-700 mb-6">
                  Upload any relevant medical documents. You can also upload additional documents after submission.
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-16 text-center bg-gray-50 relative">
                  <input
                    type="file"
                    id="fileInput"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!selectedFile ? (
                    <div className="flex flex-col items-center">
                      {/* Upload Icon */}
                      <div className="mb-4">
                        <img 
                          src="/upload.png" 
                          alt="Upload" 
                          width="48" 
                          height="48"
                          className="mx-auto"
                        />
                      </div>

                      {/* Upload Text */}
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Medical Report
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Lab results, diagnosis reports, discharge summary, Prescription
                      </p>

                      {/* Choose File Button */}
                      <label
                        htmlFor="fileInput"
                        className="px-6 py-3 text-white rounded-full hover:opacity-90 transition-all duration-200 font-medium flex items-center gap-2 cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #0575E6, #021B79)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="white" strokeWidth="2" fill="none"/>
                          <polyline points="14,2 14,8 20,8" stroke="white" strokeWidth="2" fill="none"/>
                        </svg>
                        Choose File
                      </label>

                      {/* File Format Info */}
                      <p className="text-sm text-gray-500 mt-4">
                        Format: JPG, PNG, PDF | Max size: 10 MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* File Success Icon */}
                      <div className="mb-4">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#10B981" strokeWidth="2" fill="#F0FDF4"/>
                          <polyline points="14,2 14,8 20,8" stroke="#10B981" strokeWidth="2" fill="none"/>
                          <polyline points="9,11 12,14 16,10" stroke="#10B981" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>

                      {/* File Info */}
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        File Uploaded Successfully
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <label
                          htmlFor="fileInput"
                          className="px-4 py-2 border-2 border-blue-600 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer"
                        >
                          Replace File
                        </label>
                        <button
                          onClick={handleRemoveFile}
                          className="px-4 py-2 border-2 border-red-600 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                          Remove File
                        </button>
                      </div>
                    </div>
                  )}
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