'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, X, Send, Minimize2, ChevronDown } from 'lucide-react';
import { streamChat, ChatAction } from '@/lib/api';
import { Message } from '@/lib/types';

const SUGGESTIONS = [
  'Show me SUVs under ₹15L',
  'What are the best electric cars?',
  'I need a family car with 7 seats',
  'Compare Swift vs Baleno',
];

const GREETING =
  "I'm AutoDrive AI. I can help you find the perfect car, compare models, check prices, and book test drives. What are you looking for?";

const FALLBACK_RESPONSES: Record<string, string> = {
  suv:
    "Here are some popular SUVs under ₹15L:\n\n🚗 **Hyundai Creta** – ₹14.5L, 8,000 km, Diesel AT\n🚗 **Kia Seltos** – ₹13.5L, 18,000 km, Petrol AT\n🚗 **MG Hector** – ₹11.5L, 55,000 km, Petrol MT\n\nWant me to book a test drive for any of these?",
  electric:
    "Electric top picks:\n\n⚡ **Tata Nexon EV** – ₹16.8L, 437km range, 12,000 km\n⚡ Home charger included, zero emissions\n⚡ AI fair value: ₹16.2L (good deal!)\n\nElectric cars save ~₹1.5L/year on fuel. Want more details?",
  family:
    'For a 7-seater family car:\n\n🚐 **Toyota Fortuner** – ₹32L, Diesel AT, 42,000 km\n🚐 **Mahindra XUV700** – ₹22L, Diesel AT\n\nBoth have ADAS safety features. Which fits your budget?',
  compare:
    'Swift vs Baleno:\n\n| Feature | Swift | Baleno |\n|---|---|---|\n| Price | ₹7.5L | ₹8.5L |\n| Boot | 268L | 318L |\n| Mileage | 23 kmpl | 22 kmpl |\n\nBaleno is more spacious, Swift is sportier. What matters more?',
};

function fallbackReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('suv') || lower.includes('15l')) return FALLBACK_RESPONSES.suv;
  if (lower.includes('electric') || lower.includes('ev')) return FALLBACK_RESPONSES.electric;
  if (lower.includes('family') || lower.includes('7 seat')) return FALLBACK_RESPONSES.family;
  if (lower.includes('compare') || lower.includes('swift') || lower.includes('baleno'))
    return FALLBACK_RESPONSES.compare;
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return "Hello! 👋 What kind of car are you looking for today?";
  return `I'd recommend checking our cars page with filters that match "${msg}". Would you like me to help narrow it down?`;
}

export default function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  function handleAction(action: ChatAction) {
    if (action.type === 'BOOK_TEST_DRIVE' && action.car_id) {
      router.push(`/cars/${action.car_id}?book=true`);
    } else if (action.type === 'VIEW_CAR' && action.car_id) {
      router.push(`/cars/${action.car_id}`);
    }
  }

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    setInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    let streamed = false;
    await streamChat(userMsg, sessionRef.current, {
      onToken: (token) => {
        streamed = true;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + token,
          };
          return next;
        });
      },
      onAction: handleAction,
      onError: () => {
        // chatbot offline — drop the empty placeholder and use local fallback
        const reply = fallbackReply(userMsg);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: reply };
          return next;
        });
      },
      onDone: () => {
        if (!streamed) {
          // service responded but emitted nothing useful — fallback
          const reply = fallbackReply(userMsg);
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: reply };
            return next;
          });
        }
      },
    });
    setStreaming(false);
  }

  const last = messages[messages.length - 1];
  const showTypingDots = streaming && last?.role === 'assistant' && last.content === '';

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
                  <p className="text-blue-200 text-xs">RAG + GPT-4o</p>
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
                      {msg.content || (msg.role === 'assistant' && streaming && i === messages.length - 1 ? '…' : '')}
                    </div>
                  </div>
                ))}
                {showTypingDots && (
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

              {/* Suggestions (only at start) */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
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
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !streaming && sendMessage(input)}
                  placeholder="Ask about any car..."
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || streaming}
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
