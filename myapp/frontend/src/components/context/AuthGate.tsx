"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/components/context/AuthContext";
import LoginForm from "@/components/Login/page"; // oder Login/page, je nach Pfad

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InnerGate>{children}</InnerGate>
    </AuthProvider>
  );
}

function InnerGate({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  // Wenn kein Token, zeige Login, sonst den Content
  return accessToken ? <>{children}</> : <LoginForm />;
}
