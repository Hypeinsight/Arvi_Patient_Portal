import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NavigationButtons({
  onBack,
  onNext,
  isNextDisabled = false,
  backText = "Previous",
  nextText = "Next",
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0 items-center sm:items-end mt-16 w-full">
      {/* Footer Links */}
      <div className="flex gap-4 text-sm text-gray-600">
        <button type="button" className="hover:text-gray-900 transition-colors underline">
          Privacy Policy
        </button>
        <span>|</span>
        <button type="button" className="hover:text-gray-900 transition-colors underline">
          Terms of Use
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 border-2 border-blue-600 text-blue-600 bg-white rounded-full hover:bg-blue-50 flex items-center justify-start gap-2 transition-all duration-200 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {backText}
        </button>
        
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`w-full sm:w-auto px-8 py-3 rounded-full flex items-center justify-end gap-2 text-white font-medium transition-all duration-200 ${
            isNextDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "hover:opacity-90"
          }`}
          style={
            !isNextDisabled
              ? { background: "linear-gradient(135deg, #0575E6, #021B79)" }
              : {}
          }
        >
          {nextText}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}