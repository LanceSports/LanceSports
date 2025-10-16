import { useState, useEffect, useRef, useMemo } from "react";
import { Send, User, Bot, ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { askFootyBot } from "./lib/footyApi";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text:
        "Hello! I'm your LanceSports AI assistant. I can help you with live scores, match schedules, league standings, and sports news. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      isUser: true,
      timestamp: new Date(),
    };

    const typingId = `t-${Date.now() + 1}`;
    const typingMessage: ChatMessage = {
      id: typingId,
      text: "…",
      isUser: false,
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
        text:
          "Hello! I'm your LanceSports AI assistant. I can help you with live scores, match schedules, league standings, and sports news. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    "Show me live matches",
    "Premier League standings",
    "Champions League fixtures",
    "How to view match details?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage("");
    if (!isTyping) {
      void sendToApi(question);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex flex-col">
      {/* Header — minimal, ChatGPT-like */}
      <header className="sticky top-0 z-10 border-b border-green-800/30 backdrop-blur-sm bg-gray-900/50">
        <div className="max-w-3xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="glass-dark glass-hover-dark p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-green-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center glass-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base text-gray-100">LanceSports AI</h1>
                <p className="text-xs text-green-400 hidden sm:block">
                  Chat assistant
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="glass-dark glass-hover-dark p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            title="Reset conversation"
          >
            <RotateCcw className="w-5 h-5 text-green-400" />
          </button>
        </div>
      </header>

      {/* Chat body */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto w-full px-4 py-4 sm:py-6">
          {/* Suggestions when empty — like ChatGPT starter cards */}
          {messages.length === 1 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl text-gray-100 mb-4 text-center">
                Ask me anything about sports
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="glass-card-dark glass-hover-dark p-4 rounded-xl border border-green-800/30 hover:border-green-600/50 text-left transition-all group"
                  >
                    <p className="text-sm sm:text-base text-gray-300 group-hover:text-green-300 transition-colors">
                      {q}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages — narrow centered column, chatgpt-style bubbles */}
          <div className="space-y-4 sm:space-y-5">
            {messages.map((message) => {
              const isUser = message.isUser;
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar on the left for assistant, on the right for user (ChatGPT style) */}
                  {!isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center glass-glow">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={[
                      "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed",
                      isUser
                        ? "glass-green-dark text-gray-100 border border-green-600/30"
                        : "glass-card-dark text-gray-100 border border-green-800/30",
                      "group"
                    ].join(" ")}
                    title={message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  >
                    {/* ChatGPT-like rich text handling (kept from your original) */}
                    <div className="whitespace-pre-wrap break-words">
                      {message.text.split("\n").map((line, i) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {parts.map((part, j) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                  <strong key={j} className="text-green-300">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              if (part.startsWith("• ")) {
                                return (
                                  <span key={j} className="block ml-4 text-gray-300">
                                    {part}
                                  </span>
                                );
                              }
                              return <span key={j}>{part}</span>;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    {/* Subtle timestamp on hover (ChatGPT vibe) */}
                    <span
                      className={`absolute -bottom-5 ${
                        isUser ? "right-2" : "left-2"
                      } text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* User avatar on the right */}
                  {isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-600/80 glass-green-dark flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator — inline like ChatGPT */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center glass-glow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card-dark px-4 py-3 rounded-2xl border border-green-800/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Composer — single centered bar like ChatGPT */}
      <footer className="sticky bottom-0 border-t border-green-800/30 bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto w-full px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message LanceSports AI…"
              disabled={isTyping}
              autoComplete="off"
              className="flex-1 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-500 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed glass-dark"
            />
            <button
              onClick={handleSendMessage}
              disabled={!canSend}
              aria-label="Send message"
              className="glass-green-dark px-3 py-3 rounded-xl hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group flex-shrink-0"
            >
              <Send className="w-5 h-5 text-green-400 group-hover:text-green-300 group-disabled:text-gray-500" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            AI assistant can make mistakes. Please verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
