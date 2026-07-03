"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgressSteps from "@/components/ProgressSteps";
import { ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from "@/lib/intakeStore";
import { ocrPersonalId } from "@/lib/api" 

export default function UploadMedicalDetails({ onNext, onBack, progress }) {
  const {
    sessionId,
    uploadedFile,
    setMedicalOcrResult,
    clearMedicalOcrResult,
  } = useIntakeStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = () => {
    console.log("Navigate to next step");
    onNext();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jfif",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a JPG, PNG, or PDF file");
        return;
      }

      setSelectedFile(file);
      setOcrLoading(true);
      setOcrError(null);

      try {
        const data = await ocrPersonalId(sessionId, file);
        if (!data.success) throw new Error(data.message);
        setMedicalOcrResult(file, data.text);
      } catch (err) {
        setOcrError(
          "Could not read document automatically. Please fill in your details below.",
        );
        clearMedicalOcrResult();
      } finally {
        setOcrLoading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOcrError(null);
    clearMedicalOcrResult();
  };

  const handleSkip = () => {
    console.log("Skip this step");
    // Navigate to next step or handle skip logic
  };

  return (
    <div className="min-h-screen xs:px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8 px-4 xs:px-0">
        <div className="max-w-8xl mx-auto ">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900 font-poppins">
              Patient Intake Form
            </h1>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={5} completedSteps={[1, 2, 3, 4]} />

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
              <ProgressIndicator />

              <div className="mt-16 md:mt-0 mb-8">
                <h2 className="text-base sm:text-[1.25rem] lg:text-3xl xl:text-[2rem] font-medium text-gray-800 mb-8 font-poppins">
                  Upload Your Medical Details
                </h2>
              </div>

              {/* Upload Your Medical Details Section */}
              <div className="mt-8 mb-16">
                {/* Information */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Info
                        className="w-5 md:w-8 text-blue-600 stroke-white"
                        fill="currentColor"
                      />
                      <div>
                        <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-">
                          Document Upload Required
                        </h3>
                        <p className="text-xs md:text-sm text-gray-700">
                          To complete this process, uploading your medical
                          documents is required. Ensure your files are clear and
                          accurate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Description */}
                <p className="text-gray-700 mb-6 text-center sm:text-left">
                  Upload any relevant medical documents. You can also upload
                  additional documents after submission.
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center relative">
                  <div className="bg-gray-50 py-14 px-6 rounded-2xl">
                    <img
                      src="/bgImage1.png"
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain opacity-100 pointer-events-none select-none"
                      aria-hidden="true"
                    />
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
                          Lab results, diagnosis reports, discharge summary,
                          Prescription
                        </p>

                        {/* Choose File Button */}
                        <label
                          htmlFor="fileInput"
                          className="px-6 py-3 text-white rounded-full hover:opacity-90 transition-all duration-200 font-medium flex items-center gap-2 cursor-pointer"
                          style={{
                            background:
                              "linear-gradient(135deg, #0575E6, #021B79)",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                              stroke="white"
                              strokeWidth="2"
                              fill="none"
                            />
                            <polyline
                              points="14,2 14,8 20,8"
                              stroke="white"
                              strokeWidth="2"
                              fill="none"
                            />
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
                        {ocrLoading ? (
                          <>
                            <div className="mb-4 animate-pulse">
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                                <svg
                                  className="w-6 h-6 text-blue-600 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                              Reading document...
                            </h3>
                            <p className="text-gray-600">
                              Extracting your details
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mb-4">
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                                  stroke="#10B981"
                                  strokeWidth="2"
                                  fill="#F0FDF4"
                                />
                                <polyline
                                  points="14,2 14,8 20,8"
                                  stroke="#10B981"
                                  strokeWidth="2"
                                  fill="none"
                                />
                                <polyline
                                  points="9,11 12,14 16,10"
                                  stroke="#10B981"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </svg>
                            </div>

                            {ocrError ? (
                              <>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                  File uploaded
                                </h3>
                                <p className="text-amber-600 text-sm mb-2">
                                  {ocrError}
                                </p>
                                <p className="text-gray-500 text-sm mb-6">
                                  {selectedFile.name}
                                </p>
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                  Details extracted successfully
                                </h3>
                                <p className="text-gray-600 mb-1">
                                  {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </>
                            )}

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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <NavigationButtons onBack={handlePrevious} onNext={handleNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
