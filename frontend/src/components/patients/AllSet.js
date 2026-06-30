"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, LockKeyhole } from "lucide-react";

export default function AllSet() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="w-full max-w-6xl rounded-3xl mx-auto pb-8 pt-16 flex flex-col items-center text-center relative overflow-hidden bg-white h-[70vh]">
        <div className="flex flex-col items-center relative">
          <img
            src="/bgImage1.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-100 pointer-events-none select-none"
            aria-hidden="true"
          />
          {/* Check Icon — badge/seal shape matching Figma */}
          <div className="relative z-10 mb-2">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 4
          C33.5 4 35.5 7.5 37 8
          C38.5 8.5 42 6.5 43.5 7.5
          C45 8.5 44.5 12.5 45.5 14
          C46.5 15.5 50.5 16 51.5 17.5
          C52.5 19 51 23 51.5 24.5
          C52 26 56 27.5 56 29
          C56 30.5 52 32 51.5 33.5
          C51 35 52.5 39 51.5 40.5
          C50.5 42 46.5 42.5 45.5 44
          C44.5 45.5 45 49.5 43.5 50.5
          C42 51.5 38.5 49.5 37 50
          C35.5 50.5 33.5 54 32 54
          C30.5 54 28.5 50.5 27 50
          C25.5 49.5 22 51.5 20.5 50.5
          C19 49.5 19.5 45.5 18.5 44
          C17.5 42.5 13.5 42 12.5 40.5
          C11.5 39 13 35 12.5 33.5
          C12 32 8 30.5 8 29
          C8 27.5 12 26 12.5 24.5
          C13 23 11.5 19 12.5 17.5
          C13.5 16 17.5 15.5 18.5 14
          C19.5 12.5 19 8.5 20.5 7.5
          C22 6.5 25.5 8.5 27 8
          C28.5 7.5 30.5 4 32 4Z"
                fill="#16a34a"
              />
              <path
                d="M21 30l8 8 14-14"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
            Redirecting to your chat screen{dots}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-gray-400 text-xs">
          <LockKeyhole className="w-4 h-4" />
          <span>
            All your medical data is stored securely and treated with strict
            confidentiality.
          </span>
        </div>
      </div>
    </div>
  );
}
