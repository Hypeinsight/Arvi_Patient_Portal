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
import Title from "../Title";
import InfoCard from "../InfoCard";
import { createReferralDetails, updateReferralDetails } from "@/lib/api/referral_details";

export default function ReferralDetails({ onNext, onBack }) {
  const { formData: storeData, sessionId } = useIntakeStore()

  const [selectedMethod, setSelectedMethod] = useState(
    storeData.referral?.has_referral === true  ? "yes" :
    storeData.referral?.has_referral === false ? "no"  : null
  )
  const [loading, setLoading] = useState(false);

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async() => {
    if (!selectedMethod) return;
    console.log("Navigate to next step");

    const payload = {
      has_referral: selectedMethod === "yes"
    };

    const data = storeData.referral
          ? await updateReferralDetails(sessionId, payload)
          : await createReferralDetails(sessionId, payload);

    if (data.success) {
      onNext(payload, "referral");
    }

  };

  const handleSelect = async (method) => {
    setSelectedMethod(method);
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">

          <ProgressSteps currentStep={6} completedSteps={[1, 2, 3, 4, 5]} />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">

            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Referral Details"/>
              
              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator/>

              {/* Choose Your Access Method Section */}
              <div className="mt-8 mb-16">
                {/* Existing Patient Login Card */}
                <InfoCard title="Important Discount Information" description=" Patients with a valid referral, Medicare number, and
                        uploaded referral letter are eligible for our referral
                        discount. Patients without a referral will be charged
                        standard consultation fees." />

                {/* Access Method Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Referral Available Card */}
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-60 2xl:h-80 ${
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
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-60 2xl:h-80 ${
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
