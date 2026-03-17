import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoDrive",
  description: "Marketplace and intelligent assistant platform for car buyers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

