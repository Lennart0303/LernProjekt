"use client"

import React, { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import "./Login.css";

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://localhost:8443/api/auth/login", {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Login fehlgeschlagen " + res.status);
      const { accessToken  } = await res.json();
      login(accessToken );
    } catch (err: any) {
      setError(err.message || "Fehler beim Login");
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

        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
}
