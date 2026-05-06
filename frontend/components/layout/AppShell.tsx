'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/authContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFloatingChat = pathname === '/chat' || pathname === '/voice';

  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      {!hideFloatingChat && <ChatWidget />}
    </AuthProvider>
  );
}
