"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import useIntakeStore from "@/lib/intakeStore";
import { prepareSummary } from "@/lib/api/chat";

export default function AllSet({onNext}) {
  const [dots, setDots] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const { sessionId } = useIntakeStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Prepare the chat (calls backend), then redirect
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const prepareAndRedirect = async () => {
      try {
        const data = await prepareSummary(sessionId);
        if (cancelled) return;

        if (data.success) {
          onNext();
        } else {
          setError(true);
        }
      } catch (err) {
        if (!cancelled) setError(true);
      }
    };

    prepareAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="w-full max-w-6xl rounded-3xl mx-auto pb-8 pt-16 p-4 md:p-8 flex flex-col items-center text-center relative overflow-hidden bg-white">
        <div className="flex flex-col items-center relative">
          <img
            src="/bgImage1.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-100 pointer-events-none select-none"
            aria-hidden="true"
          />
          {/* Check Icon — badge/seal shape matching Figma */}
          <div className="relative z-10 mb-2">
            <div className="relative h-12 w-12 md:h-16 md:w-16">
              <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute right-1 top-1 h-5 w-5 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute bottom-1 left-1 h-5 w-5 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-[#10B36B] md:h-7 md:w-7" />
              <div className="absolute inset-1.5 rounded-[14px] bg-[#10B36B] md:inset-2 md:rounded-[18px]" />
              <Check
                className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-white md:h-9 md:w-9"
                strokeWidth={4}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="relative z-10 text-3xl font-semibold text-gray-900 mb-3">
            You're All Set!
          </h1>

          {/* Subtitle */}
          <p className="relative z-10 text-gray-600 text-sm mb-10 max-w-md">
            Thank you for providing your details. Your information has been
            securely submitted. You can now chat with our care team for next
            steps.
          </p>

          {/* Globe animation */}
          <div className="relative z-10 mb-3 w-12 h-12">
            <div
              className="w-12 h-12 rounded-full relative overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #4fa3f7, #0575E6 45%, #021B79)",
                boxShadow:
                  "0 0 24px rgba(5, 117, 230, 0.5), inset -3px -3px 8px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.15)",
              }}
            >
              {/* Animated latitude lines */}
              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "3s" }}
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-full h-full"
                  style={{ opacity: 0.35 }}
                >
                  <ellipse
                    cx="24"
                    cy="24"
                    rx="22"
                    ry="8"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                  />
                  <ellipse
                    cx="24"
                    cy="24"
                    rx="22"
                    ry="16"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                  />
                  <line
                    x1="2"
                    y1="24"
                    x2="46"
                    y2="24"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <line
                    x1="24"
                    y1="2"
                    x2="24"
                    y2="46"
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              {/* Highlight gloss */}
              <div className="absolute top-1 left-2 w-4 h-3 rounded-full bg-white opacity-25 blur-sm" />
            </div>
          </div>

          {/* Redirecting text */}
          <p className="relative z-10 text-gray-500 text-sm mb-16">
            {error ? "Something went wrong. Please refresh to try again": `Redirecting to your chat screen${dots}`}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-gray-400 text-xs">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"
            />
            <path
              fill="white"
              d="M12 14a1.75 1.75 0 0 0-.75 3.33V19a.75.75 0 0 0 1.5 0v-1.67A1.75 1.75 0 0 0 12 14Z"
            />
          </svg>
          <span>
            All your medical data is stored securely and treated with strict
            confidentiality.
          </span>
        </div>
      </div>
    </div>
  );
}
