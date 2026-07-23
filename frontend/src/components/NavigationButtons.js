import { Play, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function NavigationButtons({
  onBack,
  onNext,
  isNextDisabled = false,
  backText = "Previous",
  nextText = "Next",
  loading = false,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-0 items-center xs:items-end mt-16 w-full">
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
      <div className="flex gap-4 w-full xs:w-auto">
        <div className="bg-gradient-to-bl from-[#0575e6] to-[#032b4a] flex h-9 xs:h-11 w-full xs:w-auto rounded-lg xs:rounded-xl p-0.25">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className={`font-poppins w-full xs:w-[125px] xl:w-[145px] 2xl:w-[180px] px-2 sm:px-4 h-full text-blue-600 bg-white rounded-lg xs:rounded-xl hover:bg-blue-50 flex items-center justify-center gap-2 transition-all duration-200 text-xs sm:text-sm font-medium ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Play className="w-4 h-4 -scale-x-100" fill="#032b4a" />
            {backText}
          </button>
        </div>

        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || loading}
          className={`font-poppins hover:opacity-90 disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 w-full xs:w-[125px] xl:w-[145px] 2xl:w-[180px] px-2 sm:px-4 h-9 xs:h-11 rounded-lg xs:rounded-xl flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium transition-all duration-200 bg-gradient-to-tr from-[#032B4A] to-[#0575E6] ${isNextDisabled || loading ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {nextText}
              <Play className="w-4 h-4" fill="white" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
