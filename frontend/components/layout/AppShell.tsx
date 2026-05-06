'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssistantPage = pathname === '/chat' || pathname === '/voice';

  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
      {!isAssistantPage && <Footer />}
      {!isAssistantPage && <ChatWidget />}
    </AuthProvider>
  );
}
