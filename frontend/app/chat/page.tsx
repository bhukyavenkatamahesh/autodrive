'use client';
import { ExternalLink } from 'lucide-react';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Slim top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 flex justify-end flex-shrink-0">
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

      {/* Ashad's RAG-based chatbot embedded */}
      <iframe
        src={CHATBOT_URL}
        title="AutoDrive AI Chatbot"
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 40px)' }}
        allow="microphone"
      />
    </div>
  );
}
