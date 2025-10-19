import { useState, useEffect, useRef, useMemo } from "react";
import { Send, User, Bot, ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { askFootyBot } from "./lib/footyApi";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isOptions?: boolean;
}

export function ChatBot() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your Lance AI Assistant. I can provide information on the following. Click any option to start:",
      sender: "bot",
      timestamp: new Date(),
      isOptions: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const options = [
    "Football (soccer) history: past matches, tournaments, seasons",
    "Players: careers, statistics, info",
    "Teams: clubs and national teams info, records",
    "Managers: current and past careers",
    "Tactics: formations and strategies",
    "Leagues and Cups: global competitions",
  ];

  // Scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const canSend = useMemo(
    () => inputMessage.trim().length > 0 && !isTyping,
    [inputMessage, isTyping]
  );

  async function sendToApi(text: string) {
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    const typingId = `t-${Date.now() + 1}`;
    const typingMessage: ChatMessage = {
      id: typingId,
      text: "…",
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, typingMessage]);
    setIsTyping(true);

    try {
      const reply = await askFootyBot(text);
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: reply } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text:
                  "I couldn’t reach the LanceSports API. Please try again in a moment.",
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isTyping) return;
    setInputMessage("");
    await sendToApi(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your Lance AI Assistant. I can provide information on the following. Click any option to start:",
        sender: "bot",
        timestamp: new Date(),
        isOptions: true,
      },
    ]);
    setInputMessage("");
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleOptionClick = (option: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.isOptions ? { ...m, isOptions: false } : m
      )
    );
    void sendToApi(option);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-green-800/30 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-6xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base text-gray-100">Lance AI Assistant</h1>
                <p className="text-xs text-green-400 hidden sm:block">Chat assistant</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            title="Reset conversation"
          >
            <RotateCcw className="w-5 h-5 text-green-400" />
          </button>
        </div>
      </header>

      {/* Chat body */}
      <main className="flex-1 overflow-y-auto flex justify-center px-2 sm:px-6 py-4">
        <div className="w-full max-w-[95%] space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-4 rounded-xl shadow-lg backdrop-blur-md whitespace-pre-line max-w-full sm:max-w-[70%] ${
                  msg.sender === "user"
                    ? "bg-green-700/40 text-white border border-green-500/30"
                    : "bg-gray-800/50 text-gray-100 border border-gray-700/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {msg.sender === "bot" ? (
                    <Bot className="text-green-400" size={18} />
                  ) : (
                    <User className="text-green-400" size={18} />
                  )}
                  <span className="font-semibold text-sm sm:text-base">
                    {msg.sender === "bot" ? "Lance AI Assistant" : "You"}
                  </span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>

                {msg.isOptions && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="w-full bg-green-800/30 border border-green-500/30 text-green-300 text-sm font-medium py-2 px-3 rounded-xl hover:bg-green-700/40 hover:text-white transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex w-full justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-xl shadow-lg backdrop-blur-md border border-gray-700/40">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input composer */}
      <footer className="sticky bottom-0 border-t border-green-800/30 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full px-4 py-3 flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Lance AI Assistant…"
            disabled={isTyping}
            className="flex-1 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-500 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900/30 backdrop-blur-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            aria-label="Send message"
            className="px-3 py-3 rounded-xl bg-green-700/40 hover:bg-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          >
            <Send className="w-5 h-5 text-green-300" />
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 text-center">
          AI assistant may make mistakes. Please verify important info.
        </p>
      </footer>
    </div>
  );
}
