// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Direkt importieren – es ist eine Client‑Komponente, markiert mit "use client"
import AuthGate from "@/components/context/AuthGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meine App",
  description: "Login-geschützte Webanwendung",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <head>
        <title>Was Essen?</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* AuthGate ist eine Client‑Komponente (mit "use client") */}
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
