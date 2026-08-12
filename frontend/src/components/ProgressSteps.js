"use client";

import useIntakeStore from "@/lib/intakeStore";

const SCREEN_LABELS = {
  choose_appointment_type: "Appointment Type",
  privacy_consent: "Privacy & Consent",
  account_setup: "Account Setup",
  upload_personal_details: "Upload Personal Details",
  personal_details: "Personal Details",
  clinic_details: "Clinic Details",
  upload_medical_details: "Upload Medical Details",
  medical_details: "Medical Details",
  referral_details: "Referral Details",
  review_submit: "Review & Submit",
};

const NON_PROGRESS_SCREENS = new Set([
  "choose_access_method",
  "register",
  "chat",
  "all_set",
]);

const formatScreenLabel = (screen) =>
  SCREEN_LABELS[screen] ??
  screen
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function ProgressSteps() {
  const { screens, currentIndex } = useIntakeStore();
  const currentScreen = screens[currentIndex];
  const currentScreenIndex = screens.indexOf(currentScreen);
  const progressScreens = screens.filter(
    (screen) => !NON_PROGRESS_SCREENS.has(screen),
  );

  if (!progressScreens.length) return null;

  return (
    <div className="flex items-center bg-blue-100/70 rounded-full px-0 py-0 shadow-sm relative z-0">
      <div className="w-full overflow-auto no-scrollbar">
        <div className="flex items-center justify-between gap-2">
          {progressScreens.map((screen, index) => {
            const stepNumber = index + 1;
            const screenIndex = screens.indexOf(screen);
            const isCurrent = screen === currentScreen;
            const isCompleted = screenIndex < currentScreenIndex;
            const isActive = isCurrent || isCompleted;

            return (
              <div className="flex items-center" key={screen}>
                <div
                  className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-transparent border hover:border-blue-300"
                      : "bg-transparent"
                  }`}
                  style={{
                    background: "transparent",
                    borderColor: "#0575E6",
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                      isActive ? "text-white" : "border"
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #0575E6, #021B79)",
                          }
                        : {
                            background: "transparent",
                            borderColor: "#0575E6",
                            borderWidth: "2px",
                            color: "#0575E6",
                          }
                    }
                  >
                    {isCompleted ? "✓" : stepNumber}
                  </div>
                  <span
                    className="whitespace-nowrap"
                    style={{
                      background:
                        "linear-gradient(135deg, #0575E6, #021B79)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {formatScreenLabel(screen)}
                  </span>
                </div>
                {index < progressScreens.length - 1 && (
                  <div className="w-8 h-px mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
