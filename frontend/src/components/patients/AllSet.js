"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"

export default function AllSet() {
  const [dots, setDots] = useState("")

  // Animate the dots in "Redirecting..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-2xl rounded-3xl p-16 flex flex-col items-center text-center relative overflow-hidden bg-white"
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.06 }}
        >
          <span
            className="text-8xl font-black tracking-widest text-blue-900"
            style={{ transform: "rotate(-15deg)", fontSize: "120px" }}
          >
            ARVI<br />HEALTH
          </span>
        </div>

        {/* Check Icon */}
        <div className="relative z-10 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="relative z-10 text-3xl font-semibold text-gray-900 mb-3">
          You're All Set!
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 text-gray-600 text-sm leading-relaxed mb-10 max-w-sm">
          Thank you for providing your details. Your information has been securely submitted.
          You can now chat with our care team for next steps.
        </p>

        {/* Spinning Globe / Loader */}
        <div className="relative z-10 mb-3">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              background: "conic-gradient(from 0deg, #0575E6, #021B79, #0575E6)",
              boxShadow: "0 0 20px rgba(5, 117, 230, 0.4)",
            }}
          />
        </div>

        {/* Redirecting text */}
        <p className="relative z-10 text-gray-500 text-sm mb-16">
          Redirecting to your chat screen{dots}
        </p>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2 text-gray-400 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>All your medical data is stored securely and treated with strict confidentiality.</span>
        </div>
      </div>
    </div>
  )
}