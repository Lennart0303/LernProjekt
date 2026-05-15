"use client"

import React, { useState } from "react";
import Link from "next/link";
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
      const { accessToken } = await res.json();
      login(accessToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left: Branding panel */}
      <div className="login-left" aria-hidden="true">
        <div className="login-brand-line" />
        <h1 className="login-brand-title">Dreh &amp; Schmatz</h1>
        <p className="login-brand-subtitle">
          Entdecke deine nächste Lieblingsmahlzeit — lass das Glücksrad entscheiden.
        </p>
        <div className="login-left-accent" />
      </div>

      {/* Right: Login form */}
      <div className="login-right">
        <div className="login-right-logo">Dreh &amp; Schmatz</div>

        <h2 className="login-headline">Anmelden</h2>
        <p className="login-sub">Melde dich an, um loszulegen.</p>

        <form className="login-form-inner" onSubmit={handleSubmit} noValidate>
          {error && <p className="login-error" role="alert">{error}</p>}

          <div>
            <label htmlFor="login-username" className="login-field-label">
              Benutzername
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder="Benutzername eingeben"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="login-field-label">
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="Passwort eingeben"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>

        <p className="login-footer-text">
          Noch kein Konto?{" "}
          <Link href="/signup" className="login-footer-link">
            Hier registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
