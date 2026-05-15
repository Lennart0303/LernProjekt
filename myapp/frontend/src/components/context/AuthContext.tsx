// src/components/context/AuthContext.tsx
"use client";

import React, {
  createContext, useContext, useState, ReactNode, useCallback, useEffect
} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
}

function getRoleFromToken(token: string): string | null {
  try {
    const payload = jwtDecode<{ roles: string[] }>(token);
    return payload.roles?.[0] ?? null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const login = useCallback((token: string) => {
    setAccessToken(token);
    setRole(getRoleFromToken(token));
  }, []);

  const logout = useCallback(async () => {
    setAccessToken(null);
    setRole(null);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  }, []);

  // in AuthContext.tsx
  useEffect(() => {
    // läuft nur beim ersten Mount
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(({ accessToken: newToken }) => {
        setAccessToken(newToken);
        setRole(getRoleFromToken(newToken));
      })
      .catch(() => {
        // kein gültiges Cookie / Refresh gescheitert → bleibe ausgeloggt
      });
  }, []);  // leerer Dependency-Array: nur einmal beim Start


  return (
    <AuthContext.Provider value={{ accessToken, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

