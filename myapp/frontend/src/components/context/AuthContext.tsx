"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type Decoded = { exp: number };
interface AuthContextType {
  token: string | null | undefined;
  login: (jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getValidToken(): string | null {
  const raw = localStorage.getItem("jwt");
  if (!raw) return null;
  try {
    const { exp } = jwtDecode<Decoded>(raw);
    if (Date.now() / 1000 < exp) return raw;
    // abgelaufen:
    localStorage.removeItem("jwt");
    return null;
  } catch {
    localStorage.removeItem("jwt");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);


  // Lädt den Token NUR im Browser nach Mount
  useEffect(() => {
    const valid = getValidToken();
    setToken(valid);
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("jwt", newToken);
    setToken(getValidToken());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
