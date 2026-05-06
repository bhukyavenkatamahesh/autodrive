'use client';

import { useRouter } from 'next/navigation';
import { ChatWidget as AutoDriveChatWidget } from '@/components/ChatWidget';

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ?? 'https://autodrive-chatbot.azurewebsites.net';

export default function ChatWidget() {
  const router = useRouter();

  return (
    <AutoDriveChatWidget
      apiUrl={CHATBOT_URL}
      title="AutoDrive AI"
      voiceEnabled
      onCarMentioned={(carId) => router.push(`/cars/${carId}`)}
    />
  );
}
