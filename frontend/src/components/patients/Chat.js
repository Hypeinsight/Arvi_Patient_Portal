"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  SendHorizontal,
  SkipForward,
  Check,
  Loader2,
  Sparkles,
  TriangleAlert,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import useIntakeStore from "@/lib/intakeStore";
import {
  fetchChatHistory,
  sendChatMessage,
  submit as submitChat,
} from "@/lib/api/chat";
import { retryDelivery } from "@/lib/api/clinics";
import InfoCard from "@/components/InfoCard";
import AllSet from "@/components/patients/AllSet";

// Starters for the patient's first reply. Clicking one fills the input so the
// patient can finish it in their own words; nothing is sent automatically.
const SUGGESTIONS = [
  "The main reason for my visit today is...",
  "I've noticed a new symptom recently...",
  "Why do you need to know this?",
];

export default function Chat() {
  const { sessionId, formData } = useIntakeStore();
  const [messages, setMessages] = useState([]);
  // The intake is saved but didn't reach the clinic; offer a retry
  const [deliveryFailed, setDeliveryFailed] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [chatEnded, setChatEnded] = useState(false);
  const [showAllSet, setShowAllSet] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

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

  // Auto scroll to bottom on new messages. Scroll only the conversation box;
  // scrollIntoView would also shift the card and the page.
  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

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

  const sendMessage = async (userMessage) => {
    if (!userMessage || loading) return; // Prevent sending empty messages or sending while loading

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

  const handleSend = () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;
    setInput("");
    sendMessage(userMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubmit = async () => {
    if (loading || submitting) return;

    setSubmitting(true);
    try {
      const data = await submitChat(sessionId);

      if (!data.success) {
        toast.error(data.message || "Could not send your details. Please try again.");
      } else if (data.delivered) {
        setShowAllSet(true);
      } else {
        setDeliveryFailed(true);
      }
    } catch {
      toast.error("Could not send your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resends the saved intake; ARVI ignores a duplicate if an earlier try got through
  const handleRetryDelivery = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const data = await retryDelivery(sessionId);
      if (data.success) {
        setDeliveryFailed(false);
        setShowAllSet(true);
      } else {
        toast.error("We still couldn't reach your clinic. Please try again shortly.");
      }
    } catch {
      toast.error("We still couldn't reach your clinic. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasMessages = messages.length > 0;
  // Only offer suggestions until the patient answers the first question
  const showSuggestions =
    hasMessages &&
    !messages.some((msg) => msg.role === "user") &&
    !chatEnded &&
    !loading &&
    !submitting;

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 pb-4 md:px-8 lg:px-16 font-poppins">
      <div className="max-w-8xl mx-auto flex flex-col w-full flex-1 min-h-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="bg-gradient-to-tr from-[#032B4A] to-[#0575E6] bg-clip-text text-transparent font-semibold text-base xs:text-lg sm:text-xl lg:text-2xl">
            Welcome Arvi Chat
          </h1>
          {!chatEnded && !deliveryFailed && (
            <button
              onClick={handleSubmit}
              disabled={loading || submitting}
              className="h-[30px] xs:h-[38px] w-auto shrink-0 justify-center bg-white/70 text-[#032B4A] border border-[#0575E6] rounded-lg xs:rounded-xl py-1 px-2 xs:p-2 sm:px-4 sm:py-2 text-sm flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity duration-500 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Skip &amp; send
                  <SkipForward size={15} fill="#032B4A" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Chat card */}
        <div className="relative bg-white rounded-[2.25rem] border border-[#0575E61F] overflow-hidden flex flex-col h-[calc(100dvh-10rem)] md:h-[calc(100dvh-12rem)] min-h-[26rem]">
          {/* Soft brand glow behind the conversation */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -bottom-24 -left-16 w-[28rem] h-[28rem] rounded-full bg-[#4DA3F0]/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[34rem] h-[30rem] rounded-full bg-[#0575E6]/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 w-[24rem] h-[24rem] rounded-full bg-[#7DB9F5]/25 blur-3xl" />
          </div>

          {/* Conversation */}
          <div
            ref={scrollRef}
            className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-10 pt-5 pb-4"
          >
            {/* Intro */}
            <div className="flex flex-col items-center text-center mb-5">
              <Sparkles className="w-6 h-6 text-[#0575E6]" strokeWidth={1.75} />
              <h2 className="mt-2 text-base sm:text-xl font-medium text-[#032B4A]">
                Your pre-visit chat with Arvi
              </h2>
            </div>

            {initializing && (
              <div className="flex justify-center text-[#0575E6]/60">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            {/* Message list */}
            <div className="flex flex-col gap-4 max-w-[940px] mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-white rounded-br-none"
                        : "bg-white/80 backdrop-blur-sm border border-[#0575E61F] shadow-sm text-[#032B4A] rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/80 backdrop-blur-sm border border-[#0575E61F] shadow-sm text-[#4f7ca8] px-4 py-3 rounded-2xl rounded-bl-none text-sm">
                    Typing...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="relative px-4 sm:px-10 pb-6 pt-2 shrink-0">
            <div className="max-w-[940px] mx-auto">
              {deliveryFailed ? (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-sm px-4 py-3"
                >
                  <TriangleAlert className="w-6 h-6 shrink-0 text-red-500" strokeWidth={1.75} />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-[#032B4A]">
                      Your details are saved, but we couldn&apos;t reach{" "}
                      {formData.doctor?.organization_name || "your clinic"}.
                    </p>
                    <p className="text-[#4f7ca8]">
                      Please try again so your doctor receives them before your
                      appointment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryDelivery}
                    disabled={submitting}
                    className="h-10 px-5 shrink-0 rounded-xl bg-gradient-to-tr from-[#032B4A] to-[#0575E6] text-sm font-medium text-white inline-flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4" />
                        Try again
                      </>
                    )}
                  </button>
                </div>
              ) : chatEnded ? (
                <InfoCard
                  title="You're Almost Done"
                  description="Thank you for completing your intake. Tap Send your details to securely share your information with your healthcare team."
                  className="mb-0"
                  icon={Check}
                  buttonIconClassName="text-white"
                  buttonText="Send your details"
                  buttonIcon={SendHorizontal}
                  buttonClassName="flex-row-reverse !px-5"
                  buttonDisabled={loading || submitting}
                  onClick={handleSubmit}
                  loading={submitting}
                />
              ) : (
                <>
                  {/* Suggestions for the first reply */}
                  {showSuggestions && (
                    <div className="mb-3">
                      <p className="text-xs text-[#4f7ca8] mb-2">
                        Suggestions on what to tell Arvi
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestion(suggestion)}
                            className="text-left px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#0575E61F] shadow-sm text-xs sm:text-sm text-[#032B4A] cursor-pointer hover:bg-white hover:border-[#0575E6]/40 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex items-end gap-2 bg-white/90 backdrop-blur-sm border border-[#0575E63D] rounded-xl shadow-sm px-4 py-3 focus-within:border-[#0575E6] transition-colors">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      className="flex-1 bg-transparent no-scrollbar leading-5 outline-none resize-none text-sm text-[#032B4A] placeholder:text-[#4f7ca8]/70 py-1"
                      placeholder="Type your answer here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading || submitting}
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading || submitting || !input.trim()}
                      aria-label="Send message"
                      className="shrink-0 p-1.5 rounded-lg text-[#0575E6] cursor-pointer hover:bg-[#0575E614] transition-colors disabled:text-[#0575E6]/30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <SendHorizontal size={22} strokeWidth={1.75} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {showAllSet && (
            <AllSet
              doctorName={formData.doctor?.doctor_name}
              clinicName={formData.doctor?.organization_name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
