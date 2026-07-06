"use client";

import { useState, useEffect } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from "@/lib/intakeStore";
import { extractMedicalDetails } from "@/lib/utils";
import Title from "../Title";
import InfoCard from "@/components/InfoCard";

const REQUIRED_FIELDS = [
  "currentConditions",
  "currentMedications",
  "allergies",
  "previousSurgeries",
  "familyMedicalHistory",
];

const FIELD_LABELS = {
  currentConditions: "Current Medical Conditions",
  currentMedications: "Current Medications",
  allergies: "Allergies",
  previousSurgeries: "Previous Surgeries",
  familyMedicalHistory: "Family Medical History",
};

const EMPTY_FORM = {
  currentConditions: "",
  currentMedications: "",
  allergies: "",
  previousSurgeries: "",
  familyMedicalHistory: "",
};

export default function MedicalDetails({ onNext, onBack }) {
  const { formData: storeData, ocrMedicalText } = useIntakeStore();

  const [formData, setFormData] = useState(() => {
    const baseDefaults = {
      currentConditions: storeData.medical?.conditions?.join(", ") ?? "",
      currentMedications: storeData.medical?.medications?.join(", ") ?? "",
      allergies: storeData.medical?.allergies?.join(", ") ?? "",
      previousSurgeries: storeData.medical?.previous_surgeries ?? "",
      familyMedicalHistory: storeData.medical?.family_history ?? "",
    };

    if (!ocrMedicalText) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    const { data } = extractMedicalDetails(ocrMedicalText);
    return { ...EMPTY_FORM, ...baseDefaults, ...data };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!ocrMedicalText) {
      setFormData(EMPTY_FORM);
      // setExtractionStatus(null)
    } else {
      const { data, extractionStatus: status } =
        extractMedicalDetails(ocrMedicalText);
      setFormData({ ...EMPTY_FORM, ...data });
      // setExtractionStatus(status)
      console.log("Extracted medical details:", data, status);
    }
  }, [ocrMedicalText]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = () => {
    if (!validate()) {
      console.log("Validation failed");
      return;
    }
    console.log("Navigate to next step");
    onNext(
      {
        conditions: formData.currentConditions
          ? formData.currentConditions.split(",").map((s) => s.trim())
          : [],
        medications: formData.currentMedications
          ? formData.currentMedications.split(",").map((s) => s.trim())
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(",").map((s) => s.trim())
          : [],
        previous_surgeries: formData.previousSurgeries,
        family_history: formData.familyMedicalHistory,
      },
      "medical",
    );
  };

  const textareaClass = (field) =>
    `w-full px-4 py-3 font-poppins text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-300 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          {/* Progress Steps */}
          <ProgressSteps currentStep={5} completedSteps={[1, 2, 3, 4]} />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Medical Details" />

              {/* Progress Indicator - Positioned in top right */}
              <ProgressIndicator />

              {/* Medical Details Section */}
              <div className="mt-8 mb-16">
                {/* Information */}
                <InfoCard
                  title="Scanned Documents Overview"
                  description="Below is a list of all the details we’ve received.
                        Double-check the files and update or remove any if
                        needed."
                />

                <form className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Current Medical Conditions*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.currentConditions}
                        onChange={(e) =>
                          handleInputChange("currentConditions", e.target.value)
                        }
                        placeholder="List any current medical conditions you have"
                        className={textareaClass("currentConditions")}
                      />
                      <ErrorMsg field="currentConditions" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Current Medications*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.currentMedications}
                        onChange={(e) =>
                          handleInputChange(
                            "currentMedications",
                            e.target.value,
                          )
                        }
                        placeholder="List all medications you are currently taking"
                        className={textareaClass("currentMedications")}
                      />
                      <ErrorMsg field="currentMedications" />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Allergies*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.allergies}
                        onChange={(e) =>
                          handleInputChange("allergies", e.target.value)
                        }
                        placeholder="List any known allergies (Medications, food, environment)"
                        className={textareaClass("allergies")}
                      />
                      <ErrorMsg field="allergies" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Previous Surgeries*
                      </label>
                      <textarea
                        rows={3}
                        value={formData.previousSurgeries}
                        onChange={(e) =>
                          handleInputChange("previousSurgeries", e.target.value)
                        }
                        placeholder="List any previous surgeries with dates"
                        className={textareaClass("previousSurgeries")}
                      />
                      <ErrorMsg field="previousSurgeries" />
                    </div>
                  </div>

                  {/* Row 3 — full width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                      Family Medical History*
                    </label>
                    <textarea
                      rows={4}
                      value={formData.familyMedicalHistory}
                      onChange={(e) =>
                        handleInputChange(
                          "familyMedicalHistory",
                          e.target.value,
                        )
                      }
                      placeholder="Relevant family medical history (Heart Disease, diabetes, etc.)"
                      className={textareaClass("familyMedicalHistory")}
                    />
                    <ErrorMsg field="familyMedicalHistory" />
                  </div>
                </form>
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
