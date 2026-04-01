'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Car, TrendingUp, Calendar } from 'lucide-react';
import { Message } from '@/lib/types';

const SUGGESTIONS = [
  { icon: Car, text: 'Best cars under ₹10 lakhs' },
  { icon: TrendingUp, text: 'Is Tata Nexon EV a good deal?' },
  { icon: Sparkles, text: 'Compare Creta vs Seltos' },
  { icon: Calendar, text: 'Book a test drive for Fortuner' },
];

const QUICK_RESPONSES: Record<string, string> = {
  'best cars under': "Here are the best cars under ₹10L:\n\n🥇 Maruti Swift (₹7.5L) — best fuel economy, 1st owner\n🥈 Honda City (₹9.8L) — premium feel, loaded features\n🥉 Volkswagen Polo (₹6.2L) — German quality, solid build\n\nAll have good AI price ratings. Want me to book a test drive?",
  'nexon ev': "Tata Nexon EV — AI Price Analysis:\n\n💰 Listed: ₹16.8L\n🤖 AI Fair Value: ₹16.2L\n✅ Verdict: Good Deal! ₹60,000 below market\n\n📊 Specs: 437km range, 12,000 km driven, 1 owner\n⚡ Annual fuel saving: ~₹1.5L vs petrol\n\nThis is one of the best EV deals right now!",
  'creta vs seltos': "Creta vs Seltos — Head to Head:\n\n| | Creta | Seltos |\n|--|-------|--------|\n| Price | ₹14.5L | ₹13.5L |\n| Engine | 1.5L Diesel | 1.4L Turbo |\n| Features | Sunroof, ADAS | Bose Audio, HUD |\n| Mileage | 8,000 km | 18,000 km |\n\n🏆 Verdict: Seltos for better value; Creta for lower km.\nBoth are excellent!",
  'fortuner': "Toyota Fortuner — Test Drive Booking:\n\n📍 Location: Delhi\n💰 Price: ₹32L\n⭐ Rating: 4.9/5\n\nAvailable slots:\n• Tomorrow 10AM – 12PM\n• Tomorrow 2PM – 5PM\n• Weekend slot\n\nShall I book for you? Just share your name and number!",
  default: "I'm AutoDrive AI, powered by GPT-4o with RAG over our entire car inventory!\n\nI can help you:\n• 🔍 Find the perfect car for your needs\n• 💰 Analyze AI price fairness (XGBoost ML)\n• 📊 Compare any two cars\n• 📅 Book test drives instantly\n• ⚡ Recommend electric alternatives\n\nWhat would you like to know?",
};

function getBotResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, response] of Object.entries(QUICK_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return response;
  }
  return QUICK_RESPONSES.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: QUICK_RESPONSES.default },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: getBotResponse(text) }]);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black">AutoDrive AI</h1>
            <p className="text-blue-200 text-sm">Powered by GPT-4o + RAG on 10,000+ cars • Always online</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Suggestion pills — shown only at start */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all text-left text-sm text-slate-700 group"
                >
                  <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  {s.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold text-slate-600">
                  U
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 shadow-sm">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-slate-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask anything about cars..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center gap-2 font-semibold text-sm transition-colors"
          >
            <Send size={16} />
            Send
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 pb-2">
          AutoDrive AI • GPT-4o + XGBoost pricing • Powered by Azure OpenAI
        </p>
      </div>
    </div>
  );
}
