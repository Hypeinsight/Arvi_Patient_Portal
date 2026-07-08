import React from "react";
import Image from "next/image";
import logoBlack from "../../../public/logoBlack.png";
import logo from "../../../public/logo.png";
import bgImg from "../../../public/bgImage1.png"
import { SendHorizontal } from "lucide-react";

export default function Chat() {
  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="max-w-8xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-2 mb-4">
          <Image src={logoBlack} alt="Logo" width={75} />
          <h1 className="text-black text-4xl">Chat</h1>
        </div>

        {/* White box fills remaining space */}
        <div className="bg-white rounded-[2.25rem] p-4 sm:p-10 flex-1 flex flex-col border border-gray-200 min-h-[80vh] ">
          <div className="border-2 border-[#0575E63D] rounded-[2.25rem] flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background image — centered in available space */}
            <Image src={bgImg} alt="background image" className="absolute object-contain w-80 opacity-100"/>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-2 px-2 pb-6">
              <div className="flex gap-2 items-start">
                <p className="text-xl xs:text-2xl sm:text-4xl bg-gradient-to-r from-[#691A6A] to-[#043762] bg-clip-text text-transparent font-semibold">
                  Welcome
                </p>
                <Image src={logo} alt="logo" className="w-14 xs:w-16 sm:w-20"/>
                <p className="text-xl xs:text-2xl sm:text-4xl bg-gradient-to-r from-[#691A6A] to-[#043762] bg-clip-text text-transparent font-semibold">
                  Chat
                </p>
              </div>
              <div className="text-xs xs:text-sm sm:text-base">
                  <div className="bg-gradient-to-b from-[#0575E6] to-[#032B4A] bg-clip-text text-transparent text-center">
                  Your information has been received securely.
                  </div>
                  <div className="bg-gradient-to-b from-[#0575E6] to-[#032B4A] bg-clip-text text-transparent text-center">
                  Use this chat to ask
                  questions, get guidance, or discuss your care.
                  </div>
              </div>
            </div>

            {/* Input bar at bottom */}
            <div className="absolute bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex gap-2 bg-[#0575E614] rounded-full px-2 sm:px-3 py-1 sm:py-2">
                <input
                  className="flex-1 bg-transparent outline-none text-xs xs:text-sm placeholder:text-blue-600 text-black"
                  placeholder="Type your message here..."
                />
                <button className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-full p-2 sm:px-6 sm:py-2 text-sm flex gap-2 cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out">
                  <span className="hidden sm:block">Send</span><SendHorizontal size={15}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
