"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { forgotPassword } from "@/lib/api";
import { minimalInputClass } from "@/components/patients/AuthForm";

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setSentTo(email.trim());
      } else {
        toast.error(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // The backend answers the same way for unknown emails, so the message
  // stays neutral rather than confirming the account exists
  if (sentTo) {
    return (
      <div role="status" className="rounded-2xl border border-[#0575E61F] bg-[#F5F9FF] p-5 text-sm">
        <MailCheck className="w-7 h-7 text-[#0575E6]" strokeWidth={1.75} />
        <p className="mt-3 font-semibold text-[#032B4A]">Check your inbox</p>
        <p className="mt-1 text-[#4f7ca8] leading-relaxed">
          If an account exists for <span className="font-medium text-[#032B4A]">{sentTo}</span>,
          we&apos;ve sent a link to reset your password. The link expires in 30
          minutes.
        </p>
        <p className="mt-3 text-[#4f7ca8]">
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="font-semibold text-[#0575E6] underline underline-offset-2 cursor-pointer hover:text-[#032B4A]"
          >
            try again
          </button>
          .
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-5 w-full h-12 short:h-11 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white text-sm sm:text-base font-medium shadow-md cursor-pointer hover:opacity-95"
        >
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4 short:space-y-3" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="forgot-email" className="sr-only">
          Email address
        </label>
        <input
          id="forgot-email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
          className={`${minimalInputClass} border-[#0575E63D]`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 short:h-11 !mt-6 short:!mt-4 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white text-sm sm:text-base font-medium shadow-md inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending link...
          </>
        ) : (
          "Send reset link"
        )}
      </button>
    </form>
  );
}
