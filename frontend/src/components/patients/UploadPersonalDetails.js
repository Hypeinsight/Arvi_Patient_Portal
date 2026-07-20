"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProgressSteps from "@/components/ProgressSteps";
import useIntakeStore from "@/lib/intakeStore";
import { ocrPersonalId } from "@/lib/api";
import { File, SkipForward } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import InfoCard from "@/components/InfoCard";
import Title from "@/components/Title";

export default function UploadPersonalDetails({ onNext, onBack }) {
  const {
    sessionId,
    uploadedPersonalFile,
    setPersonalOcrResult,
    clearPersonalOcrResult,
    saveStepData,
  } = useIntakeStore();

  const [selectedFile, setSelectedFile] = useState(uploadedPersonalFile ?? null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);

  // Synchronize state if the store changes out of band
  useEffect(() => {
    setSelectedFile(uploadedPersonalFile);
  }, [uploadedPersonalFile]);

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
    if (!file) return;
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
      setPersonalOcrResult(file, data.layout_text);
    } catch (err) {
      setOcrError(
        "Could not read document automatically. Please fill in your details below.",
      );
      clearPersonalOcrResult();
    } finally {
      setOcrLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOcrError(null);
    clearPersonalOcrResult();
    saveStepData("personal", null); // Clear personal details in the store
  };

  const handleSkip = () => {
    console.log("Skip this step");
    clearPersonalOcrResult();
    onNext();
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto ">

          {/* Progress Steps */}
          <ProgressSteps />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Upload Your Personal Details" className="md:!text-2xl"/>

              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator />

              {/* Upload Your Personal Details Section */}
              <div className="mt-8 mb-16">
                {/* Information */}
                <InfoCard
                  title="Optional Step"
                  description="You can upload your personal documents now or skip
                          this step and add them later in your account."
                  buttonText="Skip"
                  buttonIcon={SkipForward}
                  onClick={handleSkip}
                />

                {/* File Upload Description */}
                <p className="text-gray-700 mb-6 text-center sm:text-left">
                  Upload any relevant personal documents. You can also upload
                  additional documents after submission.
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center relative">
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
                          Identity Document
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Passport, National ID, Driver's License
                        </p>

                        {/* Choose File Button */}
                        {/* <label
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
                        </label> */}

                        <label
                          htmlFor="fileInput"
                          className="cursor-pointer inline-block"
                        >
                          <Button
                            type="button"
                            asChild
                            className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-full cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out px-2 sm:px-3 md:px-5 min-w-[70px] sm:min-w-[90px] text-xs sm:text-sm md:text-base flex items-center gap-2"
                          >
                            <span>
                              Choose File
                              <File className="w-4 h-4 inline" />
                            </span>
                          </Button>
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
