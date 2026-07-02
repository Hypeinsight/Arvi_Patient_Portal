"use client";

import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { BatteryMedium, Info } from "lucide-react";
import ProgressIndicator from "../ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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

export default function AccountSetup({ onNext, onBack, progress }) {
  const { formData: storeData } = useIntakeStore();

  const [formData, setFormData] = useState({
    firstName: storeData.account?.first_name ?? "",
    lastName: storeData.account?.last_name ?? "",
    dateOfBirth: storeData.account?.date_of_birth ?? "",
    gender: storeData.account?.gender ?? "",
    phoneNumber: storeData.account?.phone ?? "",
    emailAddress: storeData.account?.email ?? "",
    homeAddress: storeData.account?.address ?? "",
    emergencyContactName: storeData.account?.emergency_contact_name ?? "",
    emergencyContactNumber: storeData.account?.emergency_contact_number ?? "",
  });
  const [phoneError, setPhoneError] = useState("");

  const [errors, setErrors] = useState({});

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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      "account", // matches the formData section key in the store
    );
  };

  const fieldClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-300 ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;

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
          <ProgressSteps currentStep={3} completedSteps={[1, 2]} />

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
                d="M1292 65C1307.464 65 1320 77.536 1320 93V568C1320 583.464 1307.464 596 1292 596H36C16.1178 596 0 579.882 0 560V540V528V36C0 16.1178 16.1178 0 36 0H570.123C580.863 0 588.794 5.1585 593.994 11.5561L661.498 55.556C666.429 61.469 675.812 65 685.998 65H1292Z"                fill="white"
              />
            </svg>

            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              {/* Progress Indicator - Positioned in top right */}
                <ProgressIndicator/>

              <div className="mt-16 md:mt-0 mb-8">
                <h2 className="text-base sm:text-[1.25rem] lg:text-3xl xl:text-[2rem] font-medium text-gray-800 mb-8 font-poppins">
                  Account Setup
                </h2>
              </div>

              {/* Account Setup Section */}
              <div className="mt-8 md:mt-16 mb-16">

                {/* Information */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                     <Info
                        className="w-5 md:w-8 text-blue-600 stroke-white"
                        fill="currentColor"
                      />
                    <div>
                      <h3 className="text-md md:text-lg font-semibold text-gray-900 mb-1">
                        Scanned Documents Overview
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Below is a list of all the details we've received.
                        Double-check the files and update or remove any if
                        needed.
                      </p>
                    </div>
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
                        placeholder="First Name"
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
                        placeholder="Last Name"
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
                          max={new Date().toISOString().split("T")[0]} // prevents future dates
                          className={`${fieldClass("dateOfBirth")} [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
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
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className={fieldClass("gender")}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMsg field="gender" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number*
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <span className="w-6 h-4 bg-blue-500 rounded-sm mr-2"></span>
                          <span className="text-sm text-gray-600">🇦🇺</span>
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
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">
                          {phoneError}
                        </p>
                      )}
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
                        placeholder="Email Address"
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
                      placeholder="Home Address"
                    />
                    <ErrorMsg field="homeAddress" />
                  </div>

                  {/* Fourth Row: Emergency Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact (Optional)
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
                          className={`${fieldClass("emergencyContactNumber")} pl-10`}
                        />
                        <ErrorMsg field="emergencyContactNumber" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Navigation Buttons */}
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
