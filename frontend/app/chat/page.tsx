'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Car, TrendingUp, Calendar } from 'lucide-react';
import { Message } from '@/lib/types';
import { streamChat } from '@/lib/api';

const SUGGESTIONS = [
  { icon: Car, text: 'Best cars under ₹10 lakhs' },
  { icon: TrendingUp, text: 'Show electric cars in Bangalore' },
  { icon: Sparkles, text: 'Suggest automatic sedans under 15 lakh' },
  { icon: Calendar, text: 'How do I book a test drive?' },
];

const FALLBACK: Record<string, string> = {
  'under': "I can help find cars in your budget! Try the Cars page and use the price filter, or tell me a specific budget like 'cars under 10 lakh'.",
  'electric': "Electric cars are great for city driving! Filter by 'Electric' on the Cars page, or ask me like 'Show electric cars under 20 lakh'.",
  'book': "To book a test drive: open a car's detail page → click 'Book Test Drive' → pick a date and time. You need to be logged in!",
  default: "I'm AutoDrive AI, here to help you find your perfect car!\n\nTry asking:\n• 'Show cars under 10 lakh'\n• 'Find electric cars in Bangalore'\n• 'Suggest automatic sedans'",
};

function localFallback(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return FALLBACK.default;
}

export default function ChatPage() {
  const sessionId = useRef(`sess_${Math.random().toString(36).slice(2)}`);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: FALLBACK.default },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);

    // Add empty bot message that will be filled by streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let streamed = '';
    await streamChat(userMsg, sessionId.current, {
      onToken: (token) => {
        streamed += token;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: streamed };
          return updated;
        });
      },
      onDone: () => setTyping(false),
      onError: () => {
        const fallback = localFallback(userMsg);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fallback };
          return updated;
        });
        setTyping(false);
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black">AutoDrive AI</h1>
            <p className="text-blue-200 text-sm">Live inventory search • AI price analysis • Always online</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
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
                {msg.content || (msg.role === 'assistant' && typing ? (
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : null)}
              </div>
              {msg.role === 'user' && (
                <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold text-slate-600">
                  U
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

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
          AutoDrive AI • Live inventory search • Powered by AutoDrive
        </p>
      </div>
    </div>
  );
}
