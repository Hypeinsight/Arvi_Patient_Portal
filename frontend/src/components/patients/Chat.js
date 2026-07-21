"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import bgImg from "../../../public/bgImage1.png";
import { SendHorizontal, SkipForward, Check } from "lucide-react";
import useIntakeStore from "@/lib/intakeStore";
import {
  fetchChatHistory,
  sendChatMessage,
  submit as submitChat,
} from "@/lib/api/chat";
import InfoCard from "@/components/InfoCard";
import AllSet from "@/components/patients/AllSet";

export default function Chat() {
  const { sessionId } = useIntakeStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [chatEnded, setChatEnded] = useState(false);
  const [showAllSet, setShowAllSet] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  console.log("Session ID:", sessionId);

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

  // Restore focus after the chat API finishes and the input is re-enabled.
  useEffect(() => {
    if (!loading && !chatEnded) {
      inputRef.current?.focus();
    }
  }, [loading, chatEnded]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.style.height = "auto";

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * 3; // cap at 3 rows

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return; // Prevent sending empty messages or sending while loading

    const userMessage = input.trim();
    setInput("");

    // Optimistically add user message to display
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(sessionId, userMessage);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
        if (data.chat_ended) {
          setChatEnded(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmit = async () => {
    // setShowAllSet(true);
    if (loading || submitting) return;

    setSubmitting(true);
    try {
      const data = await submitChat(sessionId);
      if (data.success) {
        setShowAllSet(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="p-4 md:px-8 lg:px-16 font-poppins">
      <div className="max-w-8xl mx-auto flex flex-col w-full flex-1 min-h-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-start gap-2 shrink-0">
            <h1 className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-clip-text text-transparent font-semibold text-lg xs:text-xl sm:text-2xl lg:text-4xl">
              Welcome ARVI Chat
            </h1>
          </div>
          {!chatEnded && (
            <button
              onClick={handleSubmit}
              disabled={loading || submitting}
              className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-clip-text text-transparent border border-[#0575E6] rounded-lg xs:rounded-xl py-1 px-2 xs:p-2 sm:px-4 sm:py-2 text-sm flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity duration-500 ease-in-out"
            >
              <span className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-transparent bg-clip-text">
                Skip
              </span>
              <SkipForward
                size={15}
                className="text-[#032B4A]"
                fill="#032B4A"
              />
            </button>
          )}
        </div>

        {/* White box fills remaining space */}
        <div className="bg-white rounded-[2.25rem] p-4 sm:p-10 flex-1 flex flex-col border border-gray-200 min-h-[80vh] max-h-[80vh]">
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
                    <p className="text-lg xs:text-xl sm:text-2xl lg:text-4xl text-center bg-gradient-to-r from-[#691A6A] to-[#043762] bg-clip-text text-transparent font-semibold">
                      Hey, How Can We Help Today?
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
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-8 py-6 flex flex-col gap-4">
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
            <div className="px-4 sm:px-6 pb-6 pt-2 shrink-0">
              {chatEnded ? (
                <InfoCard
                  title="You're Almost Done"
                  description="Thank you for completing your intake. Tap Send All Details to securely share your information with your healthcare team."
                  className="mb-0"
                  icon={Check}
                  buttonIconClassName="text-white"
                  buttonText="Send your details"
                  buttonIcon={SendHorizontal}
                  buttonClassName="flex-row-reverse !px-5"
                  buttonDisabled={loading || submitting}
                  onClick={handleSubmit}
                />
              ) : (
                <div className="relative flex items-end gap-2 bg-[#0575E614] rounded-lg px-2 sm:px-3 py-2.5 sm:py-[18px] max-w-[940px] mx-auto">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    className="flex-1 bg-transparent no-scrollbar leading-5 pr-10 sm:pr-28 outline-none resize-none text-xs xs:text-sm placeholder:bg-gradient-to-r placeholder:from-[#032B4A] placeholder:to-[#0575E6] placeholder:bg-clip-text placeholder:text-transparent text-black"
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || submitting}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || submitting || !input.trim()}
                    className="absolute right-2 sm:right-3 bottom-1 sm:bottom-2 bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-lg sm:rounded-xl p-2 sm:px-6 sm:py-2 text-sm flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity duration-500 ease-in-out"
                  >
                    <span className="hidden sm:block leading-6">Send</span>
                    <SendHorizontal size={15} />
                  </button>
                </div>
              )}
            </div>

            {showAllSet && <AllSet />}
          </div>
        </div>
      </div>
    </div>
  );
}
