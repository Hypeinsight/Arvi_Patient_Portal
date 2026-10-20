"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/lib/api";
import { Eye, EyeOff, Loader2, Lock, Mail, X } from "lucide-react";

const inputClass =
  "w-full h-12 short:h-10 pl-11 rounded-xl border bg-white text-sm text-[#032B4A] placeholder:text-[#4f7ca8]/60 outline-none transition-colors focus:border-[#0575E6] focus:ring-4 focus:ring-[#0575E6]/10";

function PasswordField({ id, label, value, onChange, show, onToggle, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#032B4A] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f7ca8]" />
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className={`${inputClass} pr-12 ${error ? "border-red-400" : "border-[#0575E63D]"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#4f7ca8] cursor-pointer hover:text-[#0575E6]"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function AuthForm({
  onRegisterClick,
  onLoginClick,
  onSuccess,
  isRegister = false,
  isOpen = false,
  isModal = false,
  onClose,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister && password !== confirmPassword) {
      setMismatch(true);
      return;
    }

    setLoading(true);
    try {
      const res = isRegister
        ? await registerUser(email, password)
        : await loginUser(email, password);

      if (res.success) {
        localStorage.setItem("user_token", res.access_token);
        onSuccess?.(res.user.id);
      } else {
        toast.error(res.message || "An error occurred. Please try again.");
      }
    } catch {
      toast.error("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        isOpen || isModal
          ? "flex items-center justify-center"
          : "flex items-center justify-center min-h-[80vh] px-4"
      }
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 sm:px-10 sm:py-10 short:py-6 short:sm:py-6 font-poppins">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-1.5 rounded-lg text-[#4f7ca8] cursor-pointer hover:bg-[#0575E614] hover:text-[#032B4A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/main_logo.png"
            alt="Arvi Health Logo"
            width={96}
            height={54}
            className="w-20 short:w-16 h-auto object-contain"
            priority
          />
          <h1 className="mt-5 short:mt-3 text-xl sm:text-2xl font-semibold text-[#032B4A]">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-[#4f7ca8]">
            {isRegister
              ? "Save your details for faster check-ins next time."
              : "Log in to continue your patient intake."}
          </p>
        </div>

        {/* Form */}
        <form className="mt-7 short:mt-5 space-y-4 short:space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-[#032B4A] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f7ca8]" />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={`${inputClass} pr-4 border-[#0575E63D]`}
              />
            </div>
          </div>

          <PasswordField
            id="auth-password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMismatch(false);
            }}
            show={showPassword}
            onToggle={() => setShowPassword((visible) => !visible)}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />

          {isRegister && (
            <PasswordField
              id="auth-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setMismatch(false);
              }}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((visible) => !visible)}
              error={mismatch ? "Passwords do not match." : ""}
              autoComplete="new-password"
            />
          )}

          {!isRegister && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-xs font-medium text-[#0575E6] cursor-pointer hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 short:h-11 mt-2 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white text-sm sm:text-base font-medium shadow-md inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRegister ? "Creating account..." : "Signing in..."}
              </>
            ) : isRegister ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </button>
        </form>

        {/* Switch between login and register */}
        <p className="mt-6 short:mt-4 text-center text-sm text-[#4f7ca8]">
          {isRegister ? "Already have an account? " : "New patient? "}
          <button
            type="button"
            onClick={isRegister ? onLoginClick : onRegisterClick}
            className="font-semibold text-[#0575E6] cursor-pointer hover:underline"
          >
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}
