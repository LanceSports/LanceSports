import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { gunzipSync } from 'zlib';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your LanceSports assistant. Anything Football related, stats, scores, historical records, ask away! How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('live') || lowerMessage.includes('score')) {
      return 'You can check live scores and ongoing matches in the Live Matches section. All current games are updated in real-time!';
    }
    
    if (lowerMessage.includes('fixture') || lowerMessage.includes('upcoming')) {
      return 'Browse upcoming fixtures in the Upcoming Matches section. You can filter by league, date, or team to find exactly what you\'re looking for.';
    }
    
    if (lowerMessage.includes('league') || lowerMessage.includes('premier') || lowerMessage.includes('cricket')) {
      return 'LanceSports covers all major leagues including Premier League, Cricket, Rugby, and more. Use our filters to focus on your favorite competitions!';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return 'I can help you navigate LanceSports! Ask me about live scores, fixtures, leagues, or any sports-related questions.';
    }
    
    return 'Thanks for your message! For live scores, fixtures, and sports updates, explore the different sections of LanceSports. Is there anything specific you\'d like to know?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 glass-card-dark rounded-xl border border-green-800/30 glass-glow shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-800/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-gray-100 text-sm">LanceSports Assistant</h3>
                <p className="text-green-400 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 h-64 scrollbar-thin scrollbar-thumb-green-600/50 scrollbar-track-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs px-3 py-2 rounded-lg text-sm
                    ${message.isUser
                      ? 'bg-green-600/80 text-white glass-green-dark'
                      : 'glass-dark text-gray-100 border border-green-800/20'
                    }
                  `}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-green-800/30">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 glass-dark rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 border border-green-800/30 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="glass-green-dark p-2 rounded-lg hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-4 h-4 text-green-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-4 right-4 w-14 h-14 rounded-full
          glass-green-dark glass-hover-dark glass-glow
          flex items-center justify-center
          transition-all duration-300 z-40
          hover:scale-110 active:scale-95
          ${isOpen ? 'ring-2 ring-green-500/50' : ''}
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-green-400" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </>
        )}
      </button>
    </>
  );
};