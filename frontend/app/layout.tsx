import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export const metadata: Metadata = {
  title: 'AutoDrive — AI-Powered Car Marketplace',
  description: 'Find your perfect car with AI-powered search, fair price predictions, and instant test drive booking. 10,000+ verified cars across India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
