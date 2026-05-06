import { redirect } from 'next/navigation';

const CHATBOT_URL = 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatPage() {
  redirect(CHATBOT_URL);
}

export function generateMetadata() {
  return {
    alternates: {
      canonical: CHATBOT_URL,
    },
  };
}
