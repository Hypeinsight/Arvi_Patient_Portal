"use client";

import { useState } from "react";
import Image from "next/image";
import { loginUser, registerUser } from "@/lib/api";

export default function LoginForm({ onRegisterClick, onLoginSuccess, isRegister = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   const res = await loginUser(email, password);

  //   if (res.success) {
  //     localStorage.setItem("user_token", res.token);
  //     onLoginSuccess?.();
  //   } else {
  //     setError(res.message || "Invalid email or password");
  //   }

  //   setLoading(false);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = isRegister
      ? await registerUser(email, password)
      : await loginUser(email, password);

    if (res.success) {
      localStorage.setItem("user_token", res.access_token);
      onLoginSuccess?.(res.user.id);
    } else {
      setError(res.message || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-[40px] px-8 py-12 md:px-16 md:py-14 w-full max-w-3xl shadow-sm flex flex-col items-center relative">
        <div className="mb-6 flex justify-center">
          <Image
            src="/main_logo.png"
            alt="ARVI Health Logo"
            width={160}
            height={90}
            className="md:w-40 md:h-auto w-28 h-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight mb-8 text-center">
          Patient Intake Form
        </h1>

        <form className="w-full flex flex-col" onSubmit={handleSubmit}>
          <div className="space-y-4 w-full mb-3">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#edf4fe] text-[#2b5c8f] placeholder-[#4f7ca8] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#edf4fe] text-[#2b5c8f] placeholder-[#4f7ca8] rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-400 font-medium transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <div className="text-right w-full mb-8">
            <button
              type="button"
              className="text-[#005cb9] font-medium text-sm hover:underline cursor-pointer"
            >
              Forgot Password
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r cursor-pointer from-[#0056b3] to-[#0069d9] text-white font-medium text-lg py-4 rounded-full shadow-md hover:opacity-95 transition-opacity duration-200 mb-6 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in with email"}
          </button>
        </form>

        <p className="text-gray-600 font-medium text-sm md:text-base text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-[#005cb9] font-semibold hover:underline cursor-pointer"
          >
            Register as new patient or guest user
          </button>
        </p>
      </div>
    </div>
  );
}
