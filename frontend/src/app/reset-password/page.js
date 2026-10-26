"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, Loader2, TriangleAlert } from "lucide-react";
import { resetPassword } from "@/lib/api";
import { PasswordField } from "@/components/patients/AuthForm";

const MIN_PASSWORD_LENGTH = 8;

const primaryButtonClass =
  "w-full h-12 short:h-11 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white text-sm sm:text-base font-medium shadow-md inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed";

function ResetPasswordForm() {
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // "form" | "done" | "invalid"
  const [status, setStatus] = useState(token ? "form" : "invalid");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setStatus("done");
      } else if (/invalid|expired/i.test(res.message || "")) {
        setStatus("invalid");
      } else {
        setError(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto w-10 h-10 text-green-600" strokeWidth={1.75} />
        <h1 className="mt-4 text-2xl font-bold text-[#032B4A]">Password updated</h1>
        <p className="mt-2 text-sm text-[#4f7ca8]">
          Your password has been reset. You can now log in with your new
          password.
        </p>
        <Link href="/patients" className={`${primaryButtonClass} mt-6`}>
          Go to log in
        </Link>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="text-center">
        <TriangleAlert className="mx-auto w-10 h-10 text-amber-500" strokeWidth={1.75} />
        <h1 className="mt-4 text-2xl font-bold text-[#032B4A]">Link expired</h1>
        <p className="mt-2 text-sm text-[#4f7ca8]">
          This reset link is invalid, has expired or has already been used.
          Please request a new one from the log in page.
        </p>
        <Link href="/patients" className={`${primaryButtonClass} mt-6`}>
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <span className="flex items-center justify-center w-12 h-12 rounded-2xl border border-[#0575E63D] text-[#0575E6]">
        <KeyRound className="w-6 h-6" strokeWidth={1.5} />
      </span>
      <h1 className="mt-5 text-2xl sm:text-3xl short:sm:text-2xl font-bold text-[#032B4A]">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-[#4f7ca8]">
        Use at least {MIN_PASSWORD_LENGTH} characters.
      </p>

      <form className="mt-7 short:mt-5 space-y-4 short:space-y-3" onSubmit={handleSubmit}>
        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          show={showPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
          autoComplete="new-password"
          minimal
        />
        <PasswordField
          id="confirm-new-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((visible) => !visible)}
          error={error}
          autoComplete="new-password"
          minimal
        />

        <button type="submit" disabled={loading} className={`${primaryButtonClass} !mt-6 short:!mt-4`}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#4f7ca8]">
        Remembered it?{" "}
        <Link
          href="/patients"
          className="font-semibold text-[#0575E6] underline underline-offset-2 hover:text-[#032B4A]"
        >
          Back to log in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="px-4 md:px-8 lg:px-16 font-poppins">
      <div className="relative overflow-hidden max-w-md mx-auto bg-white rounded-[2.25rem] border border-[#0575E61F] shadow-sm px-6 py-8 sm:px-10 sm:py-10 short:sm:py-8">
        {/* Soft brand glow, as on the welcome page */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-[#7DB9F5]/25 blur-3xl" />
        </div>
        <div className="relative">
          <Suspense fallback={<Loader2 className="mx-auto w-6 h-6 animate-spin text-[#0575E6]" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
