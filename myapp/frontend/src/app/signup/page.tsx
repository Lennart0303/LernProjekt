"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import "@/components/Login/Login.css";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.length < 4 || username.length > 50) {
      toast.error("Benutzername muss 4–50 Zeichen lang sein.");
      return;
    }
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Passwort muss Groß- und Kleinbuchstaben sowie eine Ziffer enthalten.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (res.status === 409) {
        toast.error("Benutzername ist bereits vergeben.");
        return;
      }

      if (res.status === 400) {
        const errors: Record<string, string> = await res.json();
        const message = Object.values(errors).join(" • ");
        toast.error(message);
        return;
      }

      if (!res.ok) {
        toast.error(`Registrierung fehlgeschlagen (Code ${res.status})`);
        return;
      }

      toast.success("Registrierung erfolgreich! Bitte melde dich an.");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      toast.error("Netzwerkfehler – bitte versuche es erneut.");
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
          Erstelle deinen Account und lass das Glücksrad entscheiden, was heute auf den Tisch kommt.
        </p>
        <div className="login-left-accent" />
      </div>

      {/* Right: Registration form */}
      <div className="login-right">
        <div className="login-right-logo">Dreh &amp; Schmatz</div>

        <h2 className="login-headline">Registrieren</h2>
        <p className="login-sub">
          Erstelle einen neuen Account. Passwort: mind. 8 Zeichen, Groß-/Kleinbuchstaben und Ziffer.
        </p>

        <form className="login-form-inner" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="signup-username" className="login-field-label">
              Benutzername
            </label>
            <input
              id="signup-username"
              type="text"
              className="login-input"
              placeholder="Benutzername (4–50 Zeichen)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="login-field-label">
              Passwort
            </label>
            <input
              id="signup-password"
              type="password"
              className="login-input"
              placeholder="Mindestens 8 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Wird registriert..." : "Account erstellen"}
          </button>
        </form>

        <p className="login-footer-text">
          Bereits ein Konto?{" "}
          <Link href="/" className="login-footer-link">
            Hier anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
