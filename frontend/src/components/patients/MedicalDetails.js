"use client";

import { useState, useEffect } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import useIntakeStore from "@/lib/intakeStore";
import { extractMedicalDetails } from "@/lib/utils";
import Title from "../Title";
import InfoCard from "@/components/InfoCard";
import FileUploader from "@/components/FileUploader";
import { ArrowUpToLine } from "lucide-react";
import { ocrPersonalId } from "@/lib/api";
import {
  createMedicalDetails,
  updateMedicalDetails,
} from "@/lib/api/medical_details";

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
  const {
    formData: storeData,
    ocrMedicalText,
    uploadedMedicalFile,
    sessionId,
    setMedicalOcrResult,
  } = useIntakeStore();

  const [formData, setFormData] = useState(() => {
    const baseDefaults = {
      currentConditions: storeData.medical?.conditions?.join(", ") ?? "",
      currentMedications: storeData.medical?.medications?.join(", ") ?? "",
      allergies: storeData.medical?.allergies?.join(", ") ?? "",
      previousSurgeries: storeData.medical?.previous_surgeries ?? "",
      familyMedicalHistory: storeData.medical?.family_history ?? "",
    };

    // don't reparse if store has explicit manually saved items
    if (storeData.medical && Object.values(storeData.medical).some(Boolean)) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    if (!ocrMedicalText) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    const { data } = extractMedicalDetails(ocrMedicalText);
    return { ...EMPTY_FORM, ...data, ...baseDefaults };
  });

  const [errors, setErrors] = useState({});
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    // SCENARIO 1: Explicit File Removal or Viewing an empty manual form
    if (!ocrMedicalText && !uploadedMedicalFile) {
      const hasStoreData =
        storeData.medical && Object.values(storeData.medical).some(Boolean);

      if (hasStoreData) {
        setFormData({
          currentConditions: storeData.medical.conditions?.join(", ") ?? "",
          currentMedications: storeData.medical.medications?.join(", ") ?? "",
          allergies: storeData.medical.allergies?.join(", ") ?? "",
          previousSurgeries: storeData.medical.previous_surgeries ?? "",
          familyMedicalHistory: storeData.medical.family_history ?? "",
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      return;
    }

    // SCENARIO 2: Fresh Document Uploaded (Takes Highest Priority!)
    if (ocrMedicalText) {
      const { data: ocrData, extractionStatus: status } =
        extractMedicalDetails(ocrMedicalText);
      console.log(
        "Extracted medical details from fresh upload:",
        ocrData,
        status,
      );

      // Merge: OCR data takes priority, but preserve manual store fields if OCR missed them
      setFormData({
        currentConditions:
          ocrData.currentConditions ||
          storeData.medical?.conditions?.join(", ") ||
          "",
        currentMedications:
          ocrData.currentMedications ||
          storeData.medical?.medications?.join(", ") ||
          "",
        allergies:
          ocrData.allergies || storeData.medical?.allergies?.join(", ") || "",
        // If your OCR rarely picks up heavy historical contexts like surgeries or family history,
        // safely preserve the user's manual store entries below:
        previousSurgeries:
          ocrData.previousSurgeries ||
          storeData.medical?.previous_surgeries ||
          "",
        familyMedicalHistory:
          ocrData.familyMedicalHistory ||
          storeData.medical?.family_history ||
          "",
      });
      return;
    }

    // SCENARIO 3: Navigating back to the screen normally with no active OCR changes
    if (storeData.medical && Object.values(storeData.medical).some(Boolean)) {
      setFormData({
        currentConditions: storeData.medical.conditions?.join(", ") ?? "",
        currentMedications: storeData.medical.medications?.join(", ") ?? "",
        allergies: storeData.medical.allergies?.join(", ") ?? "",
        previousSurgeries: storeData.medical.previous_surgeries ?? "",
        familyMedicalHistory: storeData.medical.family_history ?? "",
      });
    }
  }, [ocrMedicalText, uploadedMedicalFile]); // Listens strictly to document attachment changes

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

  const handleNext = async () => {
    if (!validate()) {
      console.log("Validation failed");
      return;
    }
    console.log("Navigate to next step");

    const payload = {
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
    };

    const data = await createMedicalDetails(sessionId, payload);

    if (data.success) {
      onNext(payload, "medical");
    }
  };

  const textareaClass = (field) =>
    `w-full px-4 py-3 font-poppins no-scrollbar text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-300 ${
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
          <ProgressSteps />

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
                  title={
                    ocrMedicalText
                      ? "Scanned Documents Overview"
                      : "You can either fill out the form manually or upload a document."
                  }
                  description={
                    ocrMedicalText
                      ? "Below is a list of all the details we've received. Double-check the files and update or remove any if needed."
                      : "If you upload a document, the system will automatically extract the details and fill the form for you."
                  }
                  buttonText={uploadedMedicalFile ? "Replace" : "Upload"}
                  buttonIcon={ArrowUpToLine}
                  buttonIconClassName="bg-white text-[#032B4A] hover:bg-blue-50 rounded-sm p-0.5"
                  onClick={() => setShowUploader(true)}
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

      {showUploader && (
        <FileUploader
          isOpen={showUploader}
          initialFile={uploadedMedicalFile}
          title="Import Medical Details"
          subTitle="Upload any relevant medical documents."
          uploadText="Medical Report"
          uploadSubtext="Lab results, diagnosis reports, discharge summaries, or prescriptions"
          onCancel={() => setShowUploader(false)}
          onImport={async (file) => {
            const data = await ocrPersonalId(sessionId, file);

            if (!data.success) {
              throw new Error(
                data.message || "Could not extract details from this document.",
              );
            }

            const extractedText = data.text ?? data.layout_text;
            if (!extractedText) {
              throw new Error("No medical details were found in this document.");
            }

            setMedicalOcrResult(file, extractedText);
            setShowUploader(false);
          }}
        />
      )}
    </div>
  );
}
