"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from '@/lib/intakeStore';

export default function ReferralDetails({ onNext, onBack }) {
  const { formData: storeData } = useIntakeStore()

  const [selectedMethod, setSelectedMethod] = useState(
    storeData.referral?.has_referral === true  ? "yes" :
    storeData.referral?.has_referral === false ? "no"  : null
  )
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
    <div className="min-h-screen xs:px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8 px-4 xs:px-0">
        <div className="max-w-8xl mx-auto">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900 font-poppins">
              Patient Intake Form
            </h1>
          </div>

          <ProgressSteps currentStep={6} completedSteps={[1, 2, 3, 4, 5]} />

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
              <ProgressIndicator/>

              <div className="mt-16 md:mt-0 mb-8">
                <h2 className="text-base sm:text-[1.25rem] lg:text-3xl xl:text-[2rem] font-medium text-gray-800 mb-8 font-poppins">
                  Referral Details
                </h2>
              </div>

              {/* Choose Your Access Method Section */}
              <div className="mt-8 md:mt-16 mb-16">
                {/* Existing Patient Login Card */}
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
                      <p className="text-xs md:text-sm text-gray-700">
                        Patients with a valid referral, Medicare number, and
                        uploaded referral letter are eligible for our referral
                        discount. Patients without a referral will be charged
                        standard consultation fees.
                      </p>
                    </div>
                  </div>
                </div>

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
                    <CardContent className="p-6 md:p-8 text-center h-full flex flex-col justify-center">
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                        Yes, I have a referral
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
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
                    <CardContent className="p-6 md:p-8 text-center h-full flex flex-col justify-center">
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
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                        No, I don't have a referral
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        Standard consultation fees apply
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <NavigationButtons
                onBack={handlePrevious}
                onNext={handleNext}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
