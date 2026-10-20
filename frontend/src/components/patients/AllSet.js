"use client";

import { Lock } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import useIntakeStore from "@/lib/intakeStore";
import { useRouter } from "next/navigation";

export default function AllSet() {
  const { reset } = useIntakeStore();
  const router = useRouter();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  // The intake is finished, so closing clears it and returns to the start page
  const handleClose = () => {
    reset();
    router.replace("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-[#032B4A]/40 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-set-title"
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl px-6 py-10 sm:px-10 flex flex-col items-center text-center font-poppins"
      >
        <Image src="/successIcon.png" alt="" width={60} height={60} />

        <h1
          id="all-set-title"
          className="mt-4 text-xl sm:text-2xl font-semibold text-[#032B4A]"
        >
          You&apos;re All Set!
        </h1>

        <p className="mt-2 text-sm text-[#4f7ca8] max-w-sm">
          Thank you for providing your details. Your information has been
          securely submitted.
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-6 w-full sm:w-44 h-11 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-sm font-medium text-white shadow-md cursor-pointer hover:opacity-95 transition-opacity"
        >
          Done
        </button>

        <p className="mt-8 flex items-start sm:items-center gap-2 text-xs text-[#4f7ca8] text-start">
          <Lock className="w-4 h-4 shrink-0" />
          All your medical data is stored securely and treated with strict
          confidentiality.
        </p>
      </div>
    </div>
  );
}
