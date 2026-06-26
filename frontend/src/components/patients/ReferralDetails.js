import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";

export default function ReferralDetails({ onNext, onBack, progress }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = () => {
    if (!selectedMethod) return;
    console.log("Navigate to next step");
    onNext({ has_referral: selectedMethod === "yes" }, "referral");
  };

  const handleSelect = async (method) => {
    setSelectedMethod(method);
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-8xl mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900">
              Patient Intake Form
            </h1>
          </div>

          <ProgressSteps currentStep={6} completedSteps={[1, 2, 3, 4, 5]} />

          {/* Main White Container */}
          <div className="relative mt-7 min-h-[700px]">
            {/* Custom SVG Background */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1320 600"
              preserveAspectRatio="none"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))" }}
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
                        background: "linear-gradient(135deg, #0575E6, #021B79)",
                      }}
                    >
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <span className="text-gray-700">
                      Completing your registration...
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    {progress?.percent ?? 0}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #0575E6, #021B79)",
                      width: `${progress?.percent ?? 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Choose Your Access Method Section */}
              <div className="mt-8 mb-16">
                <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-8">
                  Referral Details
                </h2>

                {/* Existing Patient Login Card */}
                <Card className="mb-6 border-blue-200 bg-blue-50 h-20">
                  <CardContent className="p-6 h-full flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Important Discount Information
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Patients with a valid referral, Medicare number, and
                            uploaded referral letter are eligible for our
                            referral discount. Patients without a referral will
                            be charged standard consultation fees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Access Method Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Referral Available Card */}
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-80 ${
                      selectedMethod === "yes"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => !loading && handleSelect("yes")}
                  >
                    <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="relative mx-auto w-16 h-16">
                          <Image
                            src="/user1.png"
                            alt="User Icon"
                            width={64}
                            height={64}
                            className="w-16 h-16"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Yes, I have a referral
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Eligible for referral discount (with Medicare number +
                        letter upload)
                      </p>
                    </CardContent>
                  </Card>

                  {/* No Referral Card */}
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-80 ${
                      selectedMethod === "no"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => !loading && handleSelect("no")}
                  >
                    <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="relative mx-auto w-16 h-16">
                          <Image
                            src="/user2.png"
                            alt="User Icon"
                            width={64}
                            height={64}
                            className="w-16 h-16"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        No, I don't have a referral
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Standard consultation fees apply
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between items-center mt-16">
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
                      background: "linear-gradient(135deg, #0575E6, #021B79)",
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
  );
}
