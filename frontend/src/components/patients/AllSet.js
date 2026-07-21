"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import useIntakeStore from "@/lib/intakeStore";
import { useRouter } from "next/navigation";

export default function AllSet() {
  const {reset} = useIntakeStore();
  const router = useRouter();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const handleClose = () => {
    reset();
    router.replace("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-4xl mx-auto pb-8 pt-16 p-4 md:p-8 md:pt-16 flex flex-col items-center text-center relative overflow-hidden bg-white">
        <div className="flex flex-col items-center relative">
          {/* Check Icon — badge/seal shape matching Figma */}
          <Image src="/successIcon.png" alt="Success" width={60} height={60} />

          {/* Title */}
          <h1 className="relative z-10 text-2xl font-semibold text-gray-900 m-3">
            You're All Set!
          </h1>

          {/* Subtitle */}
          <p className="relative z-10 text-gray-600 text-sm mb-4 max-w-md">
            Thank you for providing your details. Your information has been
            securely submitted.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full flex gap-1.5 justify-center items-center min-w-[150px] cursor-pointer bg-gradient-to-tr from-[#032B4A] to-[#0575E6] px-5 py-2.75 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="bg-white rounded-sm">
              <X className="h-4 w-4 text-blue-800" />
            </span>
            Close
          </button>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-start sm:items-center gap-1 text-gray-400 text-xs mt-16">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"
            />
            <path
              fill="white"
              d="M12 14a1.75 1.75 0 0 0-.75 3.33V19a.75.75 0 0 0 1.5 0v-1.67A1.75 1.75 0 0 0 12 14Z"
            />
          </svg>
          <span className="text-start">
            All your medical data is stored securely and treated with strict
            confidentiality.
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          // onClick={onClose}
          aria-label="Close uploader"
          className="absolute right-4 md:right-6 top-4 md:top-6 rounded-sm xs:rounded-lg bg-[#ff0000] p-0.25 xs:p-1 cursor-pointer text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
