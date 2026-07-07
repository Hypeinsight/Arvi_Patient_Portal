"use client";

import { useState, useEffect } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { AU } from "country-flag-icons/react/3x2";
import ProgressIndicator from "@/components/ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import InfoCard from "../InfoCard";
import Title from "../Title";
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
  const { formData: storeData, ocrPersonalText, sessionId } = useIntakeStore();

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

    if (!ocrPersonalText) {
      return { ...EMPTY_FORM, ...baseDefaults };
    }

    const { data } = extractPersonalDetails(ocrPersonalText);

    return {
      ...EMPTY_FORM,
      ...baseDefaults,
      ...data,
    };
  });

  const [errors, setErrors] = useState({});
  // const [extractionStatus, setExtractionStatus] = useState(null);

  // Re-parse if user went back, changed document, and came forward again
  useEffect(() => {
    if (!ocrPersonalText) {
      return; // don't reset — initial useState already handles store data
    }
    const { data, extractionStatus: status } =
      extractPersonalDetails(ocrPersonalText);
    setFormData({ ...EMPTY_FORM, ...data });
    console.log("Extracted personal details:", data, status);
  }, [ocrPersonalText]);

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
      address: formData.homeAddress,
      emergency_contact_name: formData.emergencyContactName,
      emergency_contact_number: formData.emergencyContactNumber,
    };

    const data = storeData.personal
      ? await updatePatientProfile(sessionId, payload)
      : await createPatientProfile(sessionId, payload);

    if (data.success) {
      onNext(payload, "personal");
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Main Content */}
      <div className="pb-8">
        <div className="max-w-8xl mx-auto ">
          {/* Progress Steps */}
          <ProgressSteps currentStep={4} completedSteps={[1, 2, 3]} />

          {/* Main White Container */}
          <div className="relative mt-4 bg-white rounded-4xl">
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Personal Details" />
              <ProgressIndicator />

              {/* Personal Details Section */}
              <div className="mt-8 mb-16">
                <InfoCard
                  title={
                    ocrPersonalText
                      ? "Scanned Documents Overview"
                      : "Enter Your Details"
                  }
                  description={
                    ocrPersonalText
                      ? "Below is a list of all the details we've received. Double-check the files and update or remove any if needed."
                      : "No document was uploaded. Please fill in your personal details below."
                  }
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
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleInputChange("dateOfBirth", e.target.value)
                          }
                          onBlur={(e) => handleDobBlur(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                          className={`${fieldClass("dateOfBirth")} font-poppins ${
                            !formData.dateOfBirth
                              ? "text-gray-300 [&::-webkit-datetime-edit]:text-gray-300"
                              : "text-gray-900 [&::-webkit-datetime-edit]:text-gray-900"
                          } [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
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

                  {/* Third Row: Home Address */}
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

                  {/* Fourth Row: Emergency Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
