// src/components/context/AuthContext.tsx
"use client";

import React, {
  createContext, useContext, useState, ReactNode, useCallback, useEffect
} from "react";

interface AuthContextType {
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = useCallback((token: string) => {
    setAccessToken(token);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    // Cookie löschen lassen
    fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  }, []);

  // in AuthContext.tsx
  useEffect(() => {
    // läuft nur beim ersten Mount
    fetch("https://localhost:8443/api/auth/refresh", {
      method: "POST",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(({ accessToken: newToken }) => {
        setAccessToken(newToken);
      })
      .catch(() => {
        // kein gültiges Cookie / Refresh gescheitert → bleibe ausgeloggt
      });
  }, []);  // leerer Dependency-Array: nur einmal beim Start


  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export function getAccessToken() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("getAccessToken must be inside AuthProvider");
  return ctx.accessToken;
}
