import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { askFootyBot } from "./lib/footyApi";

interface ChatMessage {
  id: string;
  text: string;
  role: "user" | "assistant" | "system";
  timestamp: number; // epoch ms
}

export const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      text:
        "Hello! I'm your LanceSports assistant. Ask me anything football-related — stats, scores, historical records, tactics — and I’ll help.",
      role: "assistant",
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // for smooth auto-scroll to the latest message
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isOpen]);

  const canSend = useMemo(
    () => inputMessage.trim().length > 0 && !isSending,
    [inputMessage, isSending]
  );

  async function handleSendMessage() {
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setInputMessage("");

    // Push user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text,
      role: "user",
      timestamp: Date.now(),
    };

    // Add a temporary “typing” message
    const typingId = `t-${Date.now() + 1}`;
    const typingMsg: ChatMessage = {
      id: typingId,
      text: "…", // simple typing indicator
      role: "assistant",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setIsSending(true);
    console.log("[chat] send", {text});
    try {
      const reply = await askFootyBot(text);
      console.log(reply);
      // Replace typing bubble with real reply
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: reply } : m))
      );
    } catch (err: any) {
      const fallback =
        "I couldn’t reach the LanceSports API. Please try again shortly.";
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: fallback } : m))
      );
      // Optional: console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 glass-card-dark rounded-xl border border-green-800/30 glass-glow shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-800/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-gray-100 text-sm">LanceSports Assistant</h3>
                <p className="text-green-400 text-xs">
                  {isSending ? "Typing…" : "Online"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 h-64 scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      isUser
                        ? "bg-green-600/80 text-white glass-green-dark"
                        : "glass-dark text-gray-100 border border-green-800/20"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-green-800/30">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                className="flex-1 glass-dark rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
              <button
                onClick={handleSendMessage}
                disabled={!canSend}
                className="glass-green-dark p-2 rounded-lg hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Send"
              >
                <Send className="w-4 h-4 text-green-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((s) => !s)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full glass-green-dark glass-hover-dark glass-glow flex items-center justify-center transition-all duration-300 z-40 hover:scale-110 active:scale-95 ${
          isOpen ? "ring-2 ring-green-500/50" : ""
        }`}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-green-400" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </>
        )}
      </button>
    </>
  );
};
