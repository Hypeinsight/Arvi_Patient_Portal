import React from "react";
import { BatteryMedium } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";

function ProgressIndicator() {
  const { getProgress } = useIntakeStore();
  const progress = getProgress();
  
  return (
    <div className="md:absolute top-6 right-4 md:right-8 left-4 md:left-auto flex flex-col gap-2 w-auto md:w-64 lg:w-80">
      {/* Text and Percentage Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <BatteryMedium className="w-4 md:w-6 text-blue-500" />
          <span className="text-gray-700">Completing your registration...</span>
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
  );
}

export default ProgressIndicator;
