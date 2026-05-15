// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import AuthGate from "@/components/context/AuthGate";
import CookieConsent from "@/components/CookieConsent/CookieConsent";

export const metadata: Metadata = {
  title: "Dreh & Schmatz",
  description: "Entdecke deine nächste Lieblingsmahlzeit",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <head>
        <title>Dreh & Schmatz</title>
        {/* Google Fonts: Montserrat + Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
        {/* Material Symbols Outlined */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Zum Inhalt springen
        </a>
        <CookieConsent />
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
