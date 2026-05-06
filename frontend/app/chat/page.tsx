'use client';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-89px)] min-h-[640px] bg-slate-950">
      <iframe
        src={CHATBOT_URL}
        title="AutoDrive AI Chatbot"
        className="h-full w-full border-0"
        allow="microphone"
      />
    </div>
  );
}
