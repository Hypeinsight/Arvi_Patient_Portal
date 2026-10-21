import { Loader2 } from "lucide-react";

// Styled to match the buttons in the login / register form
export default function NavigationButtons({
  onBack,
  onNext,
  isNextDisabled = false,
  backText = "Previous",
  nextText = "Next",
  loading = false,
  // Top spacing above the buttons; pages with long forms pass a smaller one
  marginClassName = "mt-8 tall:mt-16",
}) {
  return (
    <div className={`flex flex-col-reverse xs:flex-row justify-end gap-3 ${marginClassName} w-full font-poppins`}>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="w-full xs:w-36 xl:w-40 h-11 short:h-10 rounded-xl border border-[#0575E63D] bg-white text-sm font-medium text-[#0575E6] cursor-pointer hover:border-[#0575E6] hover:bg-[#0575E60A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {backText}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled || loading}
        className="w-full xs:w-36 xl:w-40 h-11 short:h-10 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-sm font-medium text-white shadow-md inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : nextText}
      </button>
    </div>
  );
}
