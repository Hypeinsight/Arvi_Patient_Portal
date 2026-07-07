import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NavigationButtons({
  onBack,
  onNext,
  isNextDisabled = false,
  backText = "Previous",
  nextText = "Next",
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-0 items-center sm:items-end mt-16 w-full">
      {/* Footer Links */}
      {/* <div className="flex gap-4 text-sm text-gray-600">
        <button type="button" className="hover:text-gray-900 transition-colors underline">
          Privacy Policy
        </button>
        <span>|</span>
        <button type="button" className="hover:text-gray-900 transition-colors underline">
          Terms of Use
        </button>
      </div> */}

      {/* Navigation Buttons */}
      <div className="flex gap-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={onBack}
          className="font-poppins w-full sm:w-[125px] xl:w-[145px] 2xl:w-[180px] px-2 sm:px-4 py-2 h-10 sm:py-5.5 border-2 border-blue-600 text-blue-600 bg-white rounded-full cursor-pointer hover:bg-blue-50 flex items-center justify-start gap-2 transition-all duration-200 text-xs sm:text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {backText}
        </button>
        
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
         
          className={`font-poppins disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 w-full sm:w-[125px] xl:w-[145px] 2xl:w-[180px] px-2 sm:px-4 py-2 h-10 sm:py-6 rounded-full flex items-center justify-end gap-2 text-white text-xs sm:text-sm font-medium transition-all duration-200 bg-gradient-to-bl from-[#0575e6] to-[#032b4a] ${isNextDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          // style={
          //   !isNextDisabled
          //     ? { background: "linear-gradient(135deg, #0575E6, #021B79)" }
          //     : {}
          // }
        >
          {nextText}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}