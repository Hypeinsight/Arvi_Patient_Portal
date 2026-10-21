"use client";

import { useState, useEffect } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { ArrowUpToLine } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { AU } from "country-flag-icons/react/3x2";
import NavigationButtons from "@/components/NavigationButtons";
import InfoCard from "../InfoCard";
import Title from "../Title";
import FileUploader from "@/components/FileUploader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { extractPersonalDetails } from "@/lib/utils";
import {
  createPatientProfile,
  updatePatientProfile,
} from "@/lib/api/patient_profiles";
import { createReferralDetails } from "@/lib/api/referral_details";
import { createConsent, updateConsent } from "@/lib/api/consent";
import { ocrPersonalId } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/date-picker";

// Date of birth must be in the past, so yesterday is the latest pickable day
const yesterdayISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "Male",
  phoneNumber: "",
  emailAddress: "",
  homeAddress: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "phoneNumber",
  "emailAddress",
  "homeAddress",
];

// Guests only book this one appointment, so we ask for the minimum.
const GUEST_REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "phoneNumber",
  "emailAddress",
];

const FIELD_LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phoneNumber: "Phone Number",
  emailAddress: "Email Address",
  homeAddress: "Home Address",
};

export default function PersonalDetails({ onNext, onBack, progress }) {
  const {
    formData: storeData,
    ocrPersonalText,
    uploadedPersonalFile,
    sessionId,
    setPersonalOcrResult,
    clearPersonalOcrResult,
    saveStepData,
    patientType,
  } = useIntakeStore();

  const isGuest = patientType === "guest";

  console.log("store data.personal:", storeData.personal);

  const [formData, setFormData] = useState(() => {
    const baseDefaults = {
      firstName: storeData.personal?.first_name ?? "",
      lastName: storeData.personal?.last_name ?? "",
      dateOfBirth: storeData.personal?.date_of_birth ?? "",
      gender: storeData.personal?.gender ?? "",
      phoneNumber: storeData.personal?.phone ?? "",
      emailAddress: storeData.personal?.email ?? "",
      homeAddress: storeData.personal?.address ?? "",
      emergencyContactName: storeData.personal?.emergency_contact_name ?? "",
      emergencyContactNumber:
        storeData.personal?.emergency_contact_number ?? "",
    };

    // don't reparse if store has explicit manually saved items
    if (storeData.personal && Object.values(storeData.personal).some(Boolean)) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    if (!ocrPersonalText) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    const { data } = extractPersonalDetails(ocrPersonalText);

    return {
      ...EMPTY_FORM,
      ...data,
      ...baseDefaults,
    };
  });

  const [errors, setErrors] = useState({});

  const [hasReferral, setHasReferral] = useState(
    storeData.referral?.has_referral ?? false,
  );

  // Guests and new patients accept the terms here; follow-up patients
  // already did on their first visit
  const needsConsent = patientType === "guest" || patientType === "new";
  const [acceptedConsent, setAcceptedConsent] = useState(
    !!(storeData.consent?.accepted_terms && storeData.consent?.accepted_privacy),
  );

  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    // SCENARIO 1: Explicit File Removal or Viewing an empty manual form
    if (!ocrPersonalText && !uploadedPersonalFile) {
      // The initial state already contains any stored personal data. When an
      // uploaded file is removed, keep the remaining manually entered values.
      return;
    }

    // SCENARIO 2: Fresh Document Uploaded (Takes Highest Priority!)
    if (ocrPersonalText) {
      const { data: ocrData, extractionStatus: status } =
        extractPersonalDetails(ocrPersonalText);
      console.log(
        "Extracted personal details from fresh upload:",
        ocrData,
        status,
      );

      // New OCR values take priority. If the document does not contain a
      // field, retain the value currently in the form (including manual input).
      setFormData((currentFormData) => ({
        firstName: ocrData.firstName || currentFormData.firstName,
        lastName: ocrData.lastName || currentFormData.lastName,
        dateOfBirth: ocrData.dateOfBirth || currentFormData.dateOfBirth,
        gender: ocrData.gender || currentFormData.gender,
        phoneNumber: ocrData.phoneNumber || currentFormData.phoneNumber,
        emailAddress: ocrData.emailAddress || currentFormData.emailAddress,
        homeAddress: ocrData.homeAddress || currentFormData.homeAddress,
        emergencyContactName:
          ocrData.emergencyContactName || currentFormData.emergencyContactName,
        emergencyContactNumber:
          ocrData.emergencyContactNumber ||
          currentFormData.emergencyContactNumber,
      }));
      return;
    }

    // SCENARIO 3: Navigating back to the screen normally with no active OCR changes
    if (storeData.personal && Object.values(storeData.personal).some(Boolean)) {
      setFormData({
        firstName: storeData.personal.first_name ?? "",
        lastName: storeData.personal.last_name ?? "",
        dateOfBirth: storeData.personal.date_of_birth ?? "",
        gender: storeData.personal.gender ?? "Male",
        phoneNumber: storeData.personal.phone ?? "",
        emailAddress: storeData.personal.email ?? "",
        homeAddress: storeData.personal.address ?? "",
        emergencyContactName: storeData.personal.emergency_contact_name ?? "",
        emergencyContactNumber:
          storeData.personal.emergency_contact_number ?? "",
      });
    }
  }, [ocrPersonalText, uploadedPersonalFile]);

  const handlePhoneInput = (field, value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length > 4)
      formatted = digits.slice(0, 4) + " " + digits.slice(4);
    if (digits.length > 7)
      formatted =
        digits.slice(0, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRemovePersonalFile = () => {
    const { data: ocrData } = extractPersonalDetails(ocrPersonalText);

    setFormData((currentFormData) =>
      Object.fromEntries(
        Object.entries(currentFormData).map(([field, value]) => [
          field,
          ocrData[field] && value === ocrData[field] ? EMPTY_FORM[field] : value,
        ]),
      ),
    );
    clearPersonalOcrResult();
    setErrors({});
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, "");

    const mobileRegex = /^(04|05)\d{8}$/;
    const landlineRegex = /^(02|03|07|08)\d{8}$/;
    const tollfreeRegex = /^(1300|1800)\d{6}$/;

    return (
      mobileRegex.test(digits) ||
      landlineRegex.test(digits) ||
      tollfreeRegex.test(digits)
    );
  };

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validateDateOfBirth = (value) => {
    if (!value) return { valid: false, message: "Date of Birth is required." };
    const dob = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dob >= today)
      return { valid: false, message: "Date of birth must be in the past." };
    return { valid: true };
  };

  const handleEmailBlur = (value) => {
    if (value && !validateEmail(value)) {
      setErrors((prev) => ({
        ...prev,
        emailAddress: "Enter a valid email address (e.g. name@example.com).",
      }));
    }
  };

  const handleDobBlur = (value) => {
    if (value) {
      const { valid, message } = validateDateOfBirth(value);
      if (!valid) setErrors((prev) => ({ ...prev, dateOfBirth: message }));
    }
  };

  const handlePhoneBlur = (field, value) => {
    if (value && !validatePhone(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Enter a valid Australian number (e.g. 0412 345 678).",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Required fields
    for (const field of isGuest ? GUEST_REQUIRED_FIELDS : REQUIRED_FIELDS) {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    }

    // Date of birth
    if (formData.dateOfBirth) {
      const { valid, message } = validateDateOfBirth(formData.dateOfBirth);
      if (!valid) newErrors.dateOfBirth = message;
    }

    // Email format (if filled)
    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      newErrors.emailAddress =
        "Enter a valid email address (e.g. name@example.com).";
    }

    // Phone
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid Australian number (e.g. 0412 345 678).";
    }

    // Emergency contact is hidden for guests (OCR may still fill it), so
    // only validate it for account holders
    if (!isGuest) {
      // Emergency contact number (optional, but validated if provided)
      if (
        formData.emergencyContactNumber &&
        !validatePhone(formData.emergencyContactNumber)
      ) {
        newErrors.emergencyContactNumber =
          "Enter a valid Australian number (e.g. 0412 345 678).";
      }
    }

    if (needsConsent && !acceptedConsent) {
      newErrors.consent =
        "Please accept the Terms of Use and Privacy Policy to continue.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fieldClass = (field) =>
    `w-full px-4 py-2 border rounded-lg text-sm font-poppins focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = async () => {
    console.log("Navigate to next step");
    if (!validate()) return;

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phoneNumber,
      email: formData.emailAddress,
      ...(!isGuest && {
        address: formData.homeAddress,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_number: formData.emergencyContactNumber,
      }),
    };

    const data = await createPatientProfile(sessionId, payload);
    if (!data.success) return;

    const referralPayload = { has_referral: hasReferral };
    const referralData = await createReferralDetails(sessionId, referralPayload);
    if (!referralData.success) return;

    saveStepData("referral", referralPayload);

    if (needsConsent) {
      const consentPayload = {
        accepted_terms: acceptedConsent,
        accepted_privacy: acceptedConsent,
        consent_marketing: false,
        timestamp: new Date().toISOString(),
      };
      const consentData = storeData.consent
        ? await updateConsent(sessionId, consentPayload)
        : await createConsent(sessionId, consentPayload);
      if (!consentData.success) return;
      saveStepData("consent", consentPayload);
    }

    onNext(payload, "personal");
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
              <Title title="Personal Details" />

              {/* Personal Details Section */}
              {/* No bottom margin: NavigationButtons adds its own top margin */}
              <div className="mt-5 tall:mt-8">
                <InfoCard
                  title={
                    ocrPersonalText
                      ? "Scanned Documents Overview"
                      : "You can either fill out the form manually or upload a document."
                  }
                  description={
                    ocrPersonalText
                      ? "Below is a list of all the details we've received. Double-check the files and update or remove any if needed."
                      : "If you upload a document, the system will automatically extract the details and fill the form for you."
                  }
                  buttonText={uploadedPersonalFile ? "Replace" : "Upload"}
                  buttonIcon={ArrowUpToLine}
                  buttonIconClassName="bg-white text-[#032B4A] hover:bg-blue-50 rounded-sm p-0.5"
                  onClick={() => setShowUploader(true)}
                />

                {/* Form Fields */}
                <form className="space-y-6">
                  {/* First Row: First Name, Last Name, Date of Birth */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        First Name*
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className={fieldClass("firstName")}
                        placeholder="First Name"
                      />
                      <ErrorMsg field="firstName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={fieldClass("lastName")}
                        placeholder="Last Name"
                      />
                      <ErrorMsg field="lastName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Date of Birth*
                      </label>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={(value) => {
                          handleInputChange("dateOfBirth", value);
                          handleDobBlur(value);
                        }}
                        max={yesterdayISO()}
                        className={fieldClass("dateOfBirth")}
                      />
                      <ErrorMsg field="dateOfBirth" />
                    </div>
                  </div>

                  {/* Second Row: Gender, Phone Number, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Gender*
                      </label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                      >
                        <SelectTrigger
                          className={`${fieldClass("gender")} ${
                            !formData.gender
                              ? "text-gray-300 text-sm"
                              : "text-gray-900"
                          }`}
                        >
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMsg field="gender" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Phone Number*
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <AU className="w-5 h-auto rounded-xs border border-gray-100 shadow-2xs" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            handlePhoneInput("phoneNumber", e.target.value)
                          }
                          onBlur={(e) =>
                            handlePhoneBlur("phoneNumber", e.target.value)
                          }
                          maxLength={12}
                          className={`${fieldClass("phoneNumber")} pl-10`}
                        />
                      </div>
                      <ErrorMsg field="phoneNumber" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        value={formData.emailAddress}
                        onChange={(e) =>
                          handleInputChange("emailAddress", e.target.value)
                        }
                        onBlur={(e) => handleEmailBlur(e.target.value)}
                        className={fieldClass("emailAddress")}
                        placeholder="Email Address"
                      />
                      <ErrorMsg field="emailAddress" />
                    </div>
                  </div>

                  {/* Third Row: Home Address, Emergency Contacts (account holders only) */}
                  {!isGuest && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Home Address*
                      </label>
                      <input
                        type="text"
                        value={formData.homeAddress}
                        onChange={(e) =>
                          handleInputChange("homeAddress", e.target.value)
                        }
                        className={fieldClass("homeAddress")}
                        placeholder="Home Address"
                      />
                      <ErrorMsg field="homeAddress" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          handleInputChange(
                            "emergencyContactName",
                            e.target.value,
                          )
                        }
                        className={fieldClass("emergencyContactName")}
                        placeholder="Emergency Contact Name"
                      />
                      <ErrorMsg field="emergencyContactName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Emergency Contact Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <AU className="w-5 h-auto rounded-xs border border-gray-100 shadow-2xs" />
                        </div>
                        <input
                          type="tel"
                          value={formData.emergencyContactNumber}
                          onChange={(e) =>
                            handlePhoneInput(
                              "emergencyContactNumber",
                              e.target.value,
                            )
                          }
                          onBlur={(e) =>
                            handlePhoneBlur(
                              "emergencyContactNumber",
                              e.target.value,
                            )
                          }
                          className={`${fieldClass("emergencyContactNumber")} pl-10`}
                        />
                      </div>
                      <ErrorMsg field="emergencyContactNumber" />
                    </div>
                  </div>
                  )}

                  {/* Fourth Row: Referral */}
                  <div>
                    <label
                      htmlFor="hasReferral"
                      className={`${fieldClass("hasReferral")} flex items-start gap-3 py-2.5 cursor-pointer`}
                    >
                      <Checkbox
                        id="hasReferral"
                        checked={hasReferral}
                        onCheckedChange={(checked) => setHasReferral(!!checked)}
                        className="w-4 h-4 mt-0.5 rounded-sm cursor-pointer border-2 border-blue-300 data-[state=checked]:bg-white data-[state=checked]:border-[#0575E6] data-[state=checked]:text-[#0575E6]"
                      />
                      <span>
                        I have a referral
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Patients with a valid referral, Medicare number, and
                          uploaded referral letter are eligible for our referral
                          discount. Patients without a referral will be charged
                          standard consultation fees.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Fifth Row: Privacy & Consent */}
                  {needsConsent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Privacy &amp; Consent*
                      </label>
                      <label
                        htmlFor="acceptedConsent"
                        className={`${fieldClass("consent")} flex items-start gap-3 py-3 cursor-pointer`}
                      >
                        <Checkbox
                          id="acceptedConsent"
                          checked={acceptedConsent}
                          onCheckedChange={(checked) => {
                            setAcceptedConsent(!!checked);
                            if (errors.consent)
                              setErrors((prev) => ({ ...prev, consent: "" }));
                          }}
                          className="w-4 h-4 mt-0.5 rounded-sm cursor-pointer border-2 border-blue-300 data-[state=checked]:bg-white data-[state=checked]:border-[#0575E6] data-[state=checked]:text-[#0575E6]"
                        />
                        <span>
                          I accept the Terms of Use and acknowledge that I have
                          read and understand the Privacy Policy (Australian
                          Privacy Principles compliant)
                        </span>
                      </label>
                      <ErrorMsg field="consent" />
                    </div>
                  )}
                </form>
              </div>

              {/* Navigation Buttons */}
              <NavigationButtons
                onBack={handlePrevious}
                onNext={handleNext}
                marginClassName="mt-6 tall:mt-8"
              />
            </div>
          </div>
        </div>
      </div>

      {showUploader && (
        <FileUploader
          isOpen={showUploader}
          initialFile={uploadedPersonalFile}
          subTitle="Upload any relevant personal documents."
          uploadText="Identity Document"
          uploadSubtext="Passport, National ID, or Driver's License"
          onCancel={() => setShowUploader(false)}
          onRemove={handleRemovePersonalFile}
          onImport={async (file) => {
            const data = await ocrPersonalId(sessionId, file);

            if (!data.success) {
              throw new Error(
                data.message || "Could not extract details from this document.",
              );
            }

            const extractedText = data.layout_text ?? data.text;
            if (!extractedText) {
              throw new Error("No personal details were found in this document.");
            }

            setPersonalOcrResult(file, extractedText);
            setShowUploader(false);
          }}
        />
      )}
    </div>
  );
}
