import { useState, useEffect, useRef, useMemo } from "react";
import { Send, User, Bot, ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Use Vite env if set; otherwise fall back to your Render URL.
// IMPORTANT: no trailing slash.
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://lancesports-3kmd.onrender.com";

async function askFootyBot(message: string): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/football-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`API ${resp.status} ${resp.statusText} — ${text}`.trim());
  }
  const data = await resp.json().catch(() => ({}));
  return data?.reply ?? "Sorry, I couldn’t generate a reply.";
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
    // user message
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
    };

    // “typing” placeholder
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
      // replace typing bubble with actual reply
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, text: reply } : m))
      );
    } catch (err: any) {
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
      // console.error(err);
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
    // send immediately
    setInputMessage("");
    if (!isTyping) {
      void sendToApi(question);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="glass-card-dark border-b border-green-800/30 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="glass-dark glass-hover-dark p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center glass-glow">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base text-gray-100">LanceSports AI</h1>
                <p className="text-xs text-green-400 hidden sm:block">
                  Always ready to help
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="glass-dark glass-hover-dark p-2 rounded-lg border border-green-800/30 hover:border-green-600/50 transition-all"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {messages.length === 1 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl text-gray-100 mb-4 text-center">
                Ask me anything about sports
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="glass-card-dark glass-hover-dark p-3 sm:p-4 rounded-lg border border-green-800/30 hover:border-green-600/50 text-left transition-all group"
                  >
                    <p className="text-sm sm:text-base text-gray-300 group-hover:text-green-300 transition-colors">
                      {q}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}
              >
                <div
                  className={`flex gap-2 sm:gap-3 max-w-full sm:max-w-3xl ${message.isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      message.isUser
                        ? "bg-green-600/80 glass-green-dark"
                        : "bg-gradient-to-br from-green-500 to-green-600 glass-glow"
                    }`}
                  >
                    {message.isUser ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${
                      message.isUser
                        ? "glass-green-dark text-gray-100 border border-green-600/30"
                        : "glass-card-dark text-gray-100 border border-green-800/30"
                    }`}
                  >
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
                    <div
                      className={`text-xs mt-2 ${
                        message.isUser ? "text-green-300" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex gap-2 sm:gap-3 max-w-full sm:max-w-3xl">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center glass-glow">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="glass-card-dark px-3 py-2 sm:px-4 sm:py-3 rounded-2xl border border-green-800/30">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-card-dark border-t border-green-800/30 sticky bottom-0 safe-bottom">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isTyping}
              autoComplete="off"
              className="flex-1 glass-dark rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-100 placeholder-gray-500 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!canSend}
              className="glass-green-dark p-2 sm:p-3 rounded-xl hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 group-hover:text-green-300 group-disabled:text-gray-500" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center hidden sm:block">
            AI assistant can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
