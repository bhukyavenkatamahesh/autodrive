'use client';
import { useState } from 'react';
import { Bot, X, Minimize2, ChevronDown, ExternalLink } from 'lucide-react';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

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
          className={`fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-200 ${
            minimized ? 'h-16' : 'h-[580px]'
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
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-blue-200 text-xs">RAG + GPT-4o • Voice enabled</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={CHATBOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Open full screen"
              >
                <ExternalLink size={15} className="text-white" />
              </a>
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {minimized
                  ? <ChevronDown size={16} className="text-white" />
                  : <Minimize2 size={16} className="text-white" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Iframe */}
          {!minimized && (
            <iframe
              src={CHATBOT_URL}
              title="AutoDrive AI Chatbot"
              className="flex-1 w-full rounded-b-2xl border-0"
              allow="microphone"
            />
          )}
        </div>
      )}
    </>
  );
}
