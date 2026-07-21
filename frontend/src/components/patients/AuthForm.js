"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/lib/api";
import { Eye, EyeOff, X } from "lucide-react";

export default function AuthForm({
  onRegisterClick,
  onLoginClick,
  onSuccess,
  isRegister = false,
  isOpen = false,
  onClose,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = isRegister
      ? await registerUser(email, password)
      : await loginUser(email, password);

    console.log("AuthForm handleSubmit response:", res);

    if (res.success) {
      localStorage.setItem("user_token", res.access_token);
      onSuccess?.(res.user.id);
    } else {
      toast.error(res.message || "An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className={
        isOpen
          ? "flex items-center justify-center"
          : "flex items-center justify-center min-h-[80vh] px-4"
      }
    >
      <div className="bg-white realative rounded-xl xs:rounded-4xl px-4 py-6 xs:p-8 md:px-14 md:py-10 w-full max-w-xl shadow-sm flex flex-col items-center relative">
        <button
          type="button"
          onClick={onClose}
          // disabled={isImporting}
          aria-label="Close uploader"
          className="absolute right-3 top-3 xs:right-6 xs:top-6 rounded-lg bg-[#ff0000] p-0.25 xs:p-1 cursor-pointer text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-3 xs:h-4 w-3 xs:w-4" />
        </button>

        <div className="mb-6 flex justify-center">
          <Image
            src="/main_logo.png"
            alt="ARVI Health Logo"
            width={160}
            height={90}
            className="md:w-40 md:h-auto w-20 sm:w-28 h-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-slate tracking-tight mb-8 text-center">
          Patient Intake Form
        </h1>

        <form className="w-full flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-4 w-full mb-3">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#edf4fe] text-slate placeholder-[#4f7ca8] rounded-xl px-6 py-2 sm:py-4 outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#edf4fe] text-slate placeholder-[#4f7ca8] rounded-xl py-2 sm:py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer text-[#4f7ca8] hover:text-[#005cb9]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isRegister && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#edf4fe] text-slate placeholder-[#4f7ca8] rounded-xl py-2 sm:py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer text-[#4f7ca8] hover:text-[#005cb9]"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            )}
          </div>

          {!isRegister && (
            <div className="text-right w-full ">
              <button
                type="button"
                className="text-gradient-brand font-medium text-sm hover:underline cursor-pointer"
              >
                Forgot Password
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-tr cursor-pointer from-[#032B4A] to-[#0575E6] text-white font-medium text-base md:text-lg py-2 sm:py-4 rounded-xl shadow-md hover:opacity-95 transition-opacity duration-200 mb-6 disabled:opacity-50"
          >
            {loading
              ? isRegister
                ? "Creating account..."
                : "Signing in..."
              : isRegister
                ? "Create account"
                : "Sign in with email"}
          </button>
        </form>

        {!isRegister && (
          <p className="text-slate font-medium text-xs xs:text-sm md:text-base text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-gradient-brand font-semibold hover:underline cursor-pointer"
            >
              Register as new patient
            </button>
          </p>
        )}
        {isRegister && (
          <p className="text-slate font-medium text-sm md:text-base text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-[#005cb9] font-semibold hover:underline cursor-pointer"
            >
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
