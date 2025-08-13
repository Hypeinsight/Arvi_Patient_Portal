"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TopNav() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Mock user data - replace with your actual user state/context
  const user = {
    profileImage: "/user-icon-icon.png",
    firstname: "John",
    lastname: "Doe"
  }

  useEffect(() => {
    setIsMounted(true)
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Handle scroll events
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getDynamicGreeting = () => {
    const hour = currentTime.getHours()
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning"
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon"  
    } else if (hour >= 18 && hour < 22) {
      return "Good Evening"
    } else {
      return "Good Night"
    }
  }

  const handleSignOut = () => {
    // Add your sign out logic here
    console.log("Sign out clicked")
  }

  return (
    <>
      <header
        className={`relative z-20 max-w-[1920px] mx-auto w-full transition-colors duration-300 min-h-[60px] justify-center mt-10`}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-20 px-6 relative pt-[10px]">
          {/* Logo Section */}
          <div className="flex items-center md:ml-12">
            <Link href="/patients/" className="flex items-center">
              <Image src="/main_logo.png" alt="Health Logo" width={128} height={75} className="md:w-32 md:h-auto w-20 h-auto"/>
            </Link>
          </div>

          {/* Action Buttons & User Info */}
          <div className="hidden md:flex items-center justify-end gap-4">
            <div className="flex items-center gap-4">
              {/* Good Morning Section */}
              <div className="text-left">
                <div className="text-lg font-medium text-gray-800">
                  {isMounted ? getDynamicGreeting() : "Good Morning"}
                </div>
                <div className="text-sm text-gray-600">{user?.firstname || ""} {user?.lastname || "Doctor"}</div>
              </div>

              {/* Time Display Container */}
              <div className="flex items-center bg-blue-100/70 rounded-full px-6 py-3 shadow-sm relative z-0">
                <span className="text-2xl font-bold text-[#2563EB] font-mono tracking-normal mr-4 relative z-0">
                  {isMounted ? (
                    currentTime.toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit", 
                      second: "2-digit",
                      hour12: false 
                    })
                  ) : (
                    "00:00:00"
                  )}
                </span>

                {/* Profile Dropdown */}
                <div className="relative z-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-1 bg-white/90 rounded-full p-1 hover:bg-white transition-all duration-200 shadow-sm h-12 w-auto px-2 relative z-0"
                      >
                        <Image 
                          src={user?.profileImage || "/user-icon-icon.png"} 
                          alt="User" 
                          width={40} 
                          height={40} 
                          className="rounded-full" 
                        />
                        <svg 
                          className="h-3 w-3 text-gray-600 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 mt-2 z-0">
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Add your mobile menu content here */}
        
      </header>
    </>
  );
}