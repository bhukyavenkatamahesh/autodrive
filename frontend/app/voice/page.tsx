'use client';

import { VoicePage } from '@/components/VoicePage';

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL ?? 'https://autodrive-chatbot.azurewebsites.net';

export default function Voice() {
  return <VoicePage apiUrl={CHATBOT_URL} />;
}
