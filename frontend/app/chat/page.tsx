'use client';
import { Bot, ExternalLink } from 'lucide-react';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white py-5 px-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black">AutoDrive AI</h1>
              <p className="text-blue-200 text-xs">Live inventory • AI price analysis • Voice support</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm ml-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online
            </div>
          </div>
          <a
            href={CHATBOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-100 hover:text-white text-xs transition-colors"
          >
            <ExternalLink size={13} />
            Open full screen
          </a>
        </div>
      </div>

      {/* Chatbot iframe */}
      <iframe
        src={CHATBOT_URL}
        title="AutoDrive AI Chatbot"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 80px)' }}
        allow="microphone"
      />
    </div>
  );
}
