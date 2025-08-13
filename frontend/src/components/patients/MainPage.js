"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function MainPage() {
  const [selectedMethod, setSelectedMethod] = useState(null)

  const handleLogin = () => {
    console.log("Login clicked")
    // Add your login logic here
  }

  const handleCreateAccount = () => {
    console.log("Create Account selected")
    setSelectedMethod("create")
    // Add your create account logic here
  }

  const handleContinueAsGuest = () => {
    console.log("Continue as Guest selected")
    setSelectedMethod("guest")
    // Add your guest logic here
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-2xl sm:text-[40px] font-medium text-gray-900">Patient Intake Form</h1>
        </div>

        {/* Choose Your Access Method Section */}
        <div className="mb-8 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-8">Choose Your Access Method</h2>
          
          {/* Existing Patient Login Card */}
          <Card className="mb-6 border-blue-200 bg-blue-50 h-20">
            <CardContent className="p-6 h-full flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Existing Patient Login</h3>
                    <p className="text-gray-600 text-sm">Already have an account? Log in now to continue with the next process.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-full px-3 sm:px-4 md:px-6 min-w-[80px] sm:min-w-[90px] md:min-w-[100px] h-9 sm:h-10 md:h-auto text-xs sm:text-sm md:text-base flex-1 sm:flex-none"
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Access Method Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Account Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-80 ${
                selectedMethod === "create" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={handleCreateAccount}
            >
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="mb-6">
                  <div className="relative mx-auto w-16 h-16">
                    <Image 
                      src="/user1.png" 
                      alt="User Icon" 
                      width={64} 
                      height={64} 
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
                <p className="text-gray-600 leading-relaxed">
                  Save your information, track appointments, and access your medical records anytime.
                </p>
              </CardContent>
            </Card>

            {/* Continue as Guest Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 h-80 ${
                selectedMethod === "guest" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
              }`}
              onClick={handleContinueAsGuest}
            >
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="mb-6">
                  <div className="relative mx-auto w-16 h-16">
                    <Image 
                      src="/user2.png" 
                      alt="User Icon" 
                      width={64} 
                      height={64} 
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Continue as Guest</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick entry for this appointment only. Session expires after completion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex gap-4 text-sm text-gray-600 mt-12">
          <button className="hover:text-gray-900 transition-colors underline">
            Privacy Policy
          </button>
          <span>|</span>
          <button className="hover:text-gray-900 transition-colors underline">
            Terms of Use
          </button>
        </div>
      </div>
    </div>
  )
}