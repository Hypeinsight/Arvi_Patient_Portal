"use client";

import { useState, useEffect } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { parseOcrText } from "@/lib/utils";

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
  const { formData: storeData, ocrText, saveStepData } = useIntakeStore();

  //  const [formData, setFormData] = useState(() => {
  //   // Initial parse on mount
  //   if (!ocrText) return EMPTY_FORM;
  //   return { ...EMPTY_FORM, ...parseOcrText(ocrText) };
  // });

  const [formData, setFormData] = useState({
    firstName: storeData.personal?.first_name ?? "",
    lastName: storeData.personal?.last_name ?? "",
    dateOfBirth: storeData.personal?.date_of_birth ?? "",
    gender: storeData.personal?.gender ?? "",
    phoneNumber: storeData.personal?.phone ?? "",
    emailAddress: storeData.personal?.email ?? "",
    homeAddress: storeData.personal?.address ?? "",
    emergencyContactName: storeData.personal?.emergency_contact_name ?? "",
    emergencyContactNumber: storeData.personal?.emergency_contact_number ?? "",
  });

  // const [formData, setFormData] = useState(() => {
  // const baseDefaults = {
  //   firstName: storeData.personal?.first_name ?? "",
  //   lastName: storeData.personal?.last_name ?? "",
  //   dateOfBirth: storeData.personal?.date_of_birth ?? "",
  //   gender: storeData.personal?.gender ?? "",
  //   phoneNumber: storeData.personal?.phone ?? "",
  //   emailAddress: storeData.personal?.email ?? "",
  //   homeAddress: storeData.personal?.address ?? "",
  //   emergencyContactName: storeData.personal?.emergency_contact_name ?? "",
  //   emergencyContactNumber: storeData.personal?.emergency_contact_number ?? "",
  // };

  // if (!ocrText) {
  //   return { ...EMPTY_FORM, ...baseDefaults };
  // }

  // return { 
  //   ...EMPTY_FORM, 
  //   ...baseDefaults, 
  //   ...parseOcrText(ocrText) 
  // };
  // });

  const [errors, setErrors] = useState({});

  // Re-parse if user went back, changed document, and came forward again
  // useEffect(() => {
  //   if (!ocrText) {
  //     setFormData(EMPTY_FORM);
  //   } else {
  //     setFormData({ ...EMPTY_FORM, ...parseOcrText(ocrText) });
  //     console.log("Parsed OCR text:", parseOcrText(ocrText));
  //   }
  // }, [ocrText]);

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
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    }

    // Email format (if filled)
    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      newErrors.emailAddress =
        "Enter a valid email address (e.g. name@example.com).";
    }

    // Date of birth
    if (formData.dateOfBirth) {
      const { valid, message } = validateDateOfBirth(formData.dateOfBirth);
      if (!valid) newErrors.dateOfBirth = message;
    }

    // Phone
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid Australian number (e.g. 0412 345 678).";
    }

    // Emergency contact number (optional, but validated if provided)
    if (
      formData.emergencyContactNumber &&
      !validatePhone(formData.emergencyContactNumber)
    ) {
      newErrors.emergencyContactNumber =
        "Enter a valid Australian number (e.g. 0412 345 678).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;

  const handlePrevious = () => {
    console.log("Navigate to previous step");
    onBack();
  };

  const handleNext = () => {
    console.log("Navigate to next step");
    if (!validate()) return;
    onNext(
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phoneNumber,
        email: formData.emailAddress,
        address: formData.homeAddress,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_number: formData.emergencyContactNumber,
      },
      "personal", // matches the formData section key in the store
    );
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-8xl mx-auto ">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900">
              Patient Intake Form
            </h1>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={4} completedSteps={[1, 2, 3]} />

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

              {/* Personal Details Section */}
              <div className="mt-8 mb-16">
                <h2 className="text-4xl font-medium text-gray-900 mb-12">
                  Personal Details
                </h2>

                {/* Information */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: "linear-gradient(135deg, #0575E6, #021B79)",
                      }}
                    >
                      <span className="text-white text-xs font-bold">i</span>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        Scanned Documents Overview
                      </h3>
                      {ocrText ? (
                        <>
                          <h3 className="font-medium text-gray-900 mb-1">
                            Details Pre-filled
                          </h3>
                          <p className="text-sm text-gray-700">
                            Below is a list of all the details we've received.
                            Double-check the files and update or remove any if
                            needed.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 mb-1">
                            Enter Your Details
                          </h3>
                          <p className="text-sm text-gray-700">
                            No document was uploaded. Please fill in your
                            personal details below.
                          </p>
                        </>
                      )}
                    </div>
                    {/* <div>
                      <h3 className="font-medium text-gray-900 mb-1">Scanned Documents Overview</h3>
                      <p className="text-sm text-gray-700 mb-1">
                        Below is a list of all the details we've received.
                        Double-check the files and update or remove any if
                        needed.
                      </p>
                    </div> */}
                  </div>
                </div>

                {/* Form Fields */}
                <form className="space-y-6">
                  {/* First Row: First Name, Last Name, Date of Birth */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name*
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className={fieldClass("firstName")}
                      />
                      <ErrorMsg field="firstName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={fieldClass("lastName")}
                      />
                      <ErrorMsg field="lastName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth*
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          onBlur={(e) => handleDobBlur(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                          className={`${fieldClass("dateOfBirth")} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                          placeholder="DD/MM/YYYY"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      <ErrorMsg field="dateOfBirth" />
                    </div>
                  </div>

                  {/* Second Row: Gender, Phone Number, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender*
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className={fieldClass("gender")}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                      <ErrorMsg field="gender" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number*
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <span className="w-6 h-4 bg-blue-500 rounded-sm mr-2"></span>
                          {/* <span className="text-sm text-gray-600">🇦🇺</span> */}
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
                          className={`${fieldClass("phoneNumber")} pl-16 pr-4`}
                        />
                      </div>
                      <ErrorMsg field="phoneNumber" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      />
                      <ErrorMsg field="emailAddress" />
                    </div>
                  </div>

                  {/* Third Row: Home Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Address*
                    </label>
                    <input
                      type="text"
                      value={formData.homeAddress}
                      onChange={(e) =>
                        handleInputChange("homeAddress", e.target.value)
                      }
                      className={fieldClass("homeAddress")}
                    />
                    <ErrorMsg field="homeAddress" />
                  </div>

                  {/* Fourth Row: Emergency Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Number
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
                      />
                      <ErrorMsg field="emergencyContactName" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <span className="w-6 h-4 bg-blue-500 rounded-sm mr-2"></span>
                          <span className="text-sm text-gray-600">🇦🇺</span>
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
                          className={`${fieldClass("emergencyContactNumber")} pl-16 pr-4`}
                        />
                      </div>
                      <ErrorMsg field="emergencyContactNumber" />
                    </div>
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
