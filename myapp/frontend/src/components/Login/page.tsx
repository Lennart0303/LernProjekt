"use client"

import React, { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import "./Login.css";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.status === 401) throw new Error("Benutzername oder Passwort falsch");
      if (res.status === 429) throw new Error("Zu viele Versuche, bitte kurz warten");
      if (!res.ok) throw new Error("Netzwerk- oder Serverfehler, bitte versuche es erneut");
      const { accessToken  } = await res.json();
      login(accessToken );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Wird eingeloggt..." : "Einloggen"}
        </button>
      </form>
    </div>
  );
}
