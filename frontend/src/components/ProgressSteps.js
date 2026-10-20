"use client";

import { Check } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";

const SCREEN_LABELS = {
  choose_appointment_type: "Appointment Type",
  account_setup: "Account Setup",
  upload_personal_details: "Upload Personal Details",
  personal_details: "Personal Details",
  upload_medical_details: "Upload Medical Details",
  medical_details: "Medical Details",
  review_submit: "Review & Submit",
};

const NON_PROGRESS_SCREENS = new Set([
  "choose_access_method",
  "register",
  "chat",
  "all_set",
]);

const BRAND_GRADIENT = "linear-gradient(135deg, #0575E6, #021B79)";

const formatScreenLabel = (screen) =>
  SCREEN_LABELS[screen] ??
  screen
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ProgressSteps() {
  const { screens, currentIndex, goTo } = useIntakeStore();
  const currentScreen = screens[currentIndex];
  const currentScreenIndex = screens.indexOf(currentScreen);
  const progressScreens = screens.filter(
    (screen) => !NON_PROGRESS_SCREENS.has(screen),
  );

  if (!progressScreens.length) return null;

  return (
    <nav
      aria-label="Intake progress"
      className="bg-white/70 rounded-3xl px-2 sm:px-4 py-4 shadow-sm"
    >
      <ol className="flex items-start">
        {progressScreens.map((screen, index) => {
          const screenIndex = screens.indexOf(screen);
          const isCurrent = screen === currentScreen;
          const isCompleted = screenIndex < currentScreenIndex;
          const isLast = index === progressScreens.length - 1;

          return (
            <li
              key={screen}
              className="relative flex-1 flex flex-col items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Connector to the next step */}
              {!isLast && (
                <div
                  className="absolute top-4 left-1/2 w-full h-0.5 bg-blue-100"
                  aria-hidden="true"
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: isCompleted ? "100%" : "0%",
                      background: BRAND_GRADIENT,
                    }}
                  />
                </div>
              )}

              {/* Completed steps are links back to that screen */}
              <button
                type="button"
                onClick={() => goTo(screenIndex)}
                disabled={!isCompleted}
                aria-label={
                  isCompleted
                    ? `Go back to ${formatScreenLabel(screen)}`
                    : undefined
                }
                className={`group relative z-10 flex flex-col items-center ${
                  isCompleted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Step marker */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "text-white ring-4 ring-blue-100"
                      : isCompleted
                        ? "text-white group-hover:ring-4 group-hover:ring-blue-100"
                        : "bg-white border-2 border-blue-200 text-blue-300"
                  }`}
                  style={
                    isCurrent || isCompleted
                      ? { background: BRAND_GRADIENT }
                      : undefined
                  }
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                </div>

                {/* Step label */}
                <span
                  className={`mt-2 px-1 text-center text-xs md:text-sm leading-tight font-poppins ${
                    isCurrent
                      ? "block font-semibold text-[#032B4A]"
                      : isCompleted
                        ? "hidden sm:block font-medium text-[#0575E6] group-hover:underline"
                        : "hidden sm:block text-gray-400"
                  }`}
                >
                  {formatScreenLabel(screen)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
