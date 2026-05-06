'use client';
import { useState } from 'react';
import { Bot, X, Minimize2, ChevronDown, ExternalLink } from 'lucide-react';

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ?? 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
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

      {open && (
        <div
          className={`fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden transition-all duration-200 ${
            minimized ? 'h-12' : 'h-[600px]'
          }`}
        >
          {/* Slim control bar — no title (iframe has its own header) */}
          <div className="flex items-center justify-end gap-1 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-violet-600 flex-shrink-0">
            <a
              href={CHATBOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              title="Open full screen"
            >
              <ExternalLink size={14} className="text-white" />
            </a>
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              title={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized
                ? <ChevronDown size={15} className="text-white" />
                : <Minimize2 size={14} className="text-white" />}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              title="Close"
            >
              <X size={15} className="text-white" />
            </button>
          </div>

          {!minimized && (
            <iframe
              src={CHATBOT_URL}
              title="AutoDrive AI Chatbot"
              className="flex-1 w-full border-0"
              allow="microphone"
            />
          )}
        </div>
      )}
    </>
  );
}
