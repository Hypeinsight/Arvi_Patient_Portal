"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import logoBlack from "../../../public/logoBlack.png";
import logo from "../../../public/logo.png";
import bgImg from "../../../public/bgImage1.png";
import { SendHorizontal } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import { fetchChatHistory, sendChatMessage } from "@/lib/api/chat";

export default function Chat() {
  const { sessionId } = useIntakeStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef(null);

  // Fetch chat history from Redis if the page refreshes
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId) {
        setInitializing(false);
        return;
      }
      const data = await fetchChatHistory(sessionId);
      if (data.success && data.chat_messages.length > 0) {
        setMessages(data.chat_messages);
      }
      setInitializing(false);
    };
    loadHistory();
  }, [sessionId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return; // Prevent sending empty messages or sending while loading

    const userMessage = input.trim();
    setInput("");

    // Optimistically add user message to display
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    const data = await sendChatMessage(sessionId, userMessage);

    if (data.success) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  console.log("Has messages:", hasMessages);
  console.log("Initializing:", initializing);

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
          <div className="border-2 border-[#0575E63D] rounded-[2.25rem] flex-1 flex flex-col relative overflow-hidden">
            {!hasMessages && !initializing && (
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Background image — centered in available space */}
                <Image
                  src={bgImg}
                  alt="background image"
                  className="absolute object-contain w-80 opacity-100"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-2 px-2 pb-6">
                  <div className="flex gap-2 items-start">
                    <p className="text-xl xs:text-2xl sm:text-4xl bg-gradient-to-r from-[#691A6A] to-[#043762] bg-clip-text text-transparent font-semibold">
                      Welcome
                    </p>
                    <Image
                      src={logo}
                      alt="logo"
                      className="w-14 xs:w-16 sm:w-20"
                    />
                    <p className="text-xl xs:text-2xl sm:text-4xl bg-gradient-to-r from-[#691A6A] to-[#043762] bg-clip-text text-transparent font-semibold">
                      Chat
                    </p>
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base">
                    <div className="bg-gradient-to-b from-[#0575E6] to-[#032B4A] bg-clip-text text-transparent text-center">
                      Your information has been received securely.
                    </div>
                    <div className="bg-gradient-to-b from-[#0575E6] to-[#032B4A] bg-clip-text text-transparent text-center">
                      Use this chat to ask questions, get guidance, or discuss
                      your care.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message list — shown once chat starts */}
            {hasMessages && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-br-none"
                          : "bg-[#0575E614] text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#0575E614] text-gray-400 px-4 py-3 rounded-2xl rounded-bl-none text-sm">
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* Input bar at bottom */}
            <div className="absolute bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <div className="flex gap-2 bg-[#0575E614] rounded-full px-2 sm:px-3 py-1 sm:py-2">
                <input
                  className="flex-1 bg-transparent outline-none text-xs xs:text-sm placeholder:bg-gradient-to-r placeholder:from-[#032B4A] placeholder:to-[#0575E6] placeholder:bg-clip-text placeholder:text-transparent text-black"
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-full p-2 sm:px-6 sm:py-2 text-sm flex gap-2 cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out"
                >
                  <span className="hidden sm:block">Send</span>
                  <SendHorizontal size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
