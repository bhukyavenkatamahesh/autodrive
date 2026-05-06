'use client';

import { useEffect } from 'react';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatPage() {
  useEffect(() => {
    window.location.replace(CHATBOT_URL);
  }, []);

  return (
    <main className="min-h-[60vh] bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Opening AutoDrive AI...</h1>
        <p className="text-slate-500 mb-5">Taking you to Ashad&apos;s deployed chatbot service.</p>
        <a
          href={CHATBOT_URL}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Open Chatbot
        </a>
      </div>
    </main>
  );
}
