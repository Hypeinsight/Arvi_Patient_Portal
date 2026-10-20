"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Info,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import ProgressSteps from "@/components/ProgressSteps";
import useIntakeStore from "@/lib/intakeStore";
import { createSummary } from "@/lib/api/summary";

const APPOINTMENT_LABELS = {
  new: "New Patient",
  followup_lt12: "Follow-up (within 12 months)",
  followup_gt12: "Follow-up (over 12 months)",
};

// "YYYY-MM-DD" -> "DD/MM/YYYY", without going through Date (avoids timezone shifts)
const formatDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
};

const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || null;
  return value || null;
};

export default function ReviewAndSubmit({ onNext, onBack }) {
  const { formData, patientType, sessionId, screens, goTo } = useIntakeStore();
  const [loading, setLoading] = useState(false);

  const isGuest = patientType === "guest";
  const personal = formData.personal ?? {};
  const medical = formData.medical ?? {};

  // Lock page scroll while the popup is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Escape works like Back
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape" && !loading) onBack();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [loading, onBack]);

  const handleNext = async () => {
    setLoading(true);
    const data = await createSummary(sessionId);
    setLoading(false);
    if (data.success) {
      onNext();
    }
  };

  const editScreen = (screen) => {
    const index = screens.indexOf(screen);
    if (index >= 0) goTo(index);
  };

  const emergencyContact = [
    personal.emergency_contact_name,
    personal.emergency_contact_number,
  ]
    .filter(Boolean)
    .join(" - ");

  const appointmentType =
    formData.appointment?.appointment_type ?? formData.appointment?.type;

  const sections = [
    {
      title: "Personal details",
      screen: "personal_details",
      rows: [
        {
          label: "Name",
          value: `${personal.first_name ?? ""} ${personal.last_name ?? ""}`.trim(),
        },
        { label: "Date of birth", value: formatDate(personal.date_of_birth) },
        { label: "Gender", value: personal.gender },
        { label: "Phone", value: personal.phone },
        { label: "Email", value: personal.email, lowercase: true },
        ...(isGuest
          ? []
          : [
              { label: "Home address", value: personal.address },
              { label: "Emergency contact", value: emergencyContact },
            ]),
      ],
    },
    {
      title: "Medical details",
      screen: "medical_details",
      rows: [
        { label: "Conditions", value: formatList(medical.conditions) },
        { label: "Medications", value: formatList(medical.medications) },
        { label: "Allergies", value: formatList(medical.allergies) },
        { label: "Previous surgeries", value: medical.previous_surgeries },
        { label: "Family history", value: medical.family_history },
      ],
    },
    {
      title: "Appointment",
      screen: isGuest ? null : "choose_appointment_type",
      rows: [
        { label: "Access method", value: isGuest ? "Guest" : "Account user" },
        ...(isGuest
          ? []
          : [
              {
                label: "Appointment type",
                value: APPOINTMENT_LABELS[appointmentType] ?? appointmentType,
              },
            ]),
        {
          label: "Referral",
          value:
            formData.referral?.has_referral === true
              ? "Yes - referral discount applies"
              : formData.referral?.has_referral === false
                ? "No - standard fees apply"
                : null,
        },
      ],
    },
  ];

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="max-w-8xl mx-auto">
        <ProgressSteps />
      </div>

      {/* Review popup */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#032B4A]/40 backdrop-blur-sm p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-title"
          className="w-full max-w-2xl max-h-[90dvh] flex flex-col bg-white rounded-3xl shadow-2xl font-poppins overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-[#0575E61F]">
            <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl border border-[#0575E63D] text-[#0575E6]">
              <ClipboardCheck className="w-6 h-6" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <h2
                id="review-title"
                className="text-lg sm:text-xl font-semibold text-[#032B4A]"
              >
                Review your details
              </h2>
              <p className="mt-0.5 text-sm text-[#4f7ca8]">
                Check everything is correct before starting your pre-visit
                chat.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              aria-label="Close and go back"
              className="p-1.5 rounded-lg text-[#4f7ca8] cursor-pointer hover:bg-[#0575E614] hover:text-[#032B4A] disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-[#0575E61F] bg-[#F5F9FF]"
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <h3 className="text-sm font-semibold text-[#032B4A]">
                    {section.title}
                  </h3>
                  {section.screen && (
                    <button
                      type="button"
                      onClick={() => editScreen(section.screen)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0575E6] cursor-pointer hover:underline disabled:cursor-not-allowed"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <dl className="divide-y divide-[#0575E614] px-4 pb-1">
                  {section.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 py-2 text-sm"
                    >
                      <dt className="text-[#4f7ca8]">{row.label}</dt>
                      <dd
                        className={`break-words ${
                          row.value
                            ? `text-[#032B4A] ${row.lowercase ? "lowercase" : ""}`
                            : "text-[#4f7ca8]/60 italic"
                        }`}
                      >
                        {row.value || "Not provided"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <p className="flex items-start gap-2 text-xs text-[#4f7ca8]">
              <Info className="w-4 h-4 shrink-0 mt-px" />
              Our medical team will review your information before your
              consultation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-[#0575E61F]">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="h-10 px-6 rounded-xl border border-[#0575E6] text-sm font-medium text-[#0575E6] bg-white cursor-pointer hover:bg-[#0575E614] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="h-10 px-6 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-sm font-medium text-white inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Confirm &amp; start chat
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
