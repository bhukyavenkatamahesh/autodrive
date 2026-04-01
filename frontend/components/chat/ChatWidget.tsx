'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, ChevronDown } from 'lucide-react';
import { Message } from '@/lib/types';

const SUGGESTIONS = [
  'Show me SUVs under ₹15L',
  'What are the best electric cars?',
  'I need a family car with 7 seats',
  'Compare Swift vs Baleno',
];

const BOT_RESPONSES: Record<string, string> = {
  default: "I'm AutoDrive AI, powered by GPT-4o! I can help you find the perfect car, compare models, check prices, and book test drives. What are you looking for?",
  suv: "Great choice! Here are some popular SUVs under ₹15L:\n\n🚗 **Hyundai Creta** – ₹14.5L, 8,000 km, Diesel AT\n🚗 **Kia Seltos** – ₹13.5L, 18,000 km, Petrol AT\n🚗 **MG Hector** – ₹11.5L, 55,000 km, Petrol MT\n\nAll verified, single owner. Want me to book a test drive for any of these?",
  electric: "Electric cars are the future! Top picks:\n\n⚡ **Tata Nexon EV** – ₹16.8L, 437km range, just 12,000 km\n⚡ Home charger included, 0 emission\n⚡ AI Price: ₹16.2L (good deal!)\n\nElectric cars save ~₹1.5L/year on fuel. Want more details?",
  family: "For a 7-seater family car, I recommend:\n\n🚐 **Toyota Fortuner** – ₹32L, Diesel AT, 42,000 km\n🚐 **Mahindra XUV700** – ₹22L, Diesel AT, 7-seater\n\nBoth are excellent family SUVs with ADAS safety features. Which fits your budget better?",
  compare: "Swift vs Baleno comparison:\n\n| Feature | Swift | Baleno |\n|---------|-------|--------|\n| Price | ₹7.5L | ₹8.5L |\n| Boot | 268L | 318L |\n| Mileage | 23 kmpl | 22 kmpl |\n| Seating | 5 | 5 |\n\nBaleno offers more space. Swift is sportier. Which matters more to you?",
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('suv') || lower.includes('15l') || lower.includes('15 l')) return BOT_RESPONSES.suv;
  if (lower.includes('electric') || lower.includes('ev')) return BOT_RESPONSES.electric;
  if (lower.includes('family') || lower.includes('7 seat') || lower.includes('seven')) return BOT_RESPONSES.family;
  if (lower.includes('compare') || lower.includes('swift') || lower.includes('baleno')) return BOT_RESPONSES.compare;
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! 👋 I'm AutoDrive AI. I can help you find the perfect car based on your budget, needs, and preferences. What are you looking for today?";
  }
  if (lower.includes('price') || lower.includes('budget')) {
    return "I can help you find cars in any budget! Our AI price predictor (XGBoost ML) also shows you the fair market value so you never overpay. What's your budget range?";
  }
  return `I found several options matching "${msg}". Our AI-powered search suggests checking the Cars page with this filter applied. Want me to show you the top 3 matches?`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: BOT_RESPONSES.default },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = getResponse(userMsg);
    setTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
          title="Chat with AutoDrive AI"
        >
          <Bot size={24} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-200 ${
            minimized ? 'h-16' : 'h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AutoDrive AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <p className="text-blue-200 text-xs">GPT-4o • Always online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {minimized ? <ChevronDown size={16} className="text-white" /> : <Minimize2 size={16} className="text-white" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Bot size={14} className="text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot size={14} className="text-blue-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !typing && sendMessage(input)}
                  placeholder="Ask about any car..."
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
