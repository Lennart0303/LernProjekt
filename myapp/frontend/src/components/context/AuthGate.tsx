"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/components/context/AuthContext";
import LoginForm from "@/components/Login/page"; // oder Login/page, je nach Pfad

const PUBLIC_ROUTES = ["/signup", "/impressum", "/datenschutz"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#ededed",
            border: "1px solid #333",
          },
          success: {
            iconTheme: { primary: "#ff6600", secondary: "#ededed" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ededed" },
          },
          duration: 4000,
        }}
      />
      <InnerGate>{children}</InnerGate>
    </AuthProvider>
  );
}

function InnerGate({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const pathname = usePathname();

  // Öffentliche Routen brauchen keinen Login
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Wenn kein Token, zeige Login, sonst den Content
  return accessToken ? <>{children}</> : <LoginForm />;
}
