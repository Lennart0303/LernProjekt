"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import { AdminGuard } from "@/components/context/AdminGuard";

export default function Register() {
    const { accessToken, login, logout } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessToken) return;

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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ username, password }),
        });

        const aborted = await handleAuthError(res, login, logout);
        if (aborted) return;

        if (res.status === 400) {
            const errors: Record<string, string> = await res.json();
            toast.error(Object.values(errors).join(" • "));
            return;
        }

        if (res.status === 409) {
            toast.error("Benutzername existiert bereits. Bitte einen anderen wählen.");
            return;
        }

        if (!res.ok) {
            toast.error(`Fehler beim Registrieren (Code ${res.status})`);
            return;
        }

        toast.success(`Benutzer "${username}" wurde erfolgreich registriert.`);
        setUsername("");
        setPassword("");
    };

    return (
        <AdminGuard>
            <div className="app-shell">
                <Navigation />
                <main id="main-content" className="app-main">
                    {/* Hero */}
                    <div className="hero">
                        <div>
                            <h1>Neuen Benutzer registrieren</h1>
                            <p>Erstelle einen neuen Account für die Anwendung.</p>
                        </div>
                    </div>

                    <div style={{ maxWidth: '520px' }}>
                        <div className="card">
                            <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
                                Benutzername: 4–50 Zeichen. Passwort: mind. 8 Zeichen mit Groß-, Kleinbuchstaben und Ziffer.
                            </p>

                            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="register-username" className="form-label">
                                        Benutzername
                                    </label>
                                    <input
                                        id="register-username"
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Benutzername (4–50 Zeichen)"
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="register-password" className="form-label">
                                        Passwort
                                    </label>
                                    <input
                                        id="register-password"
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Mindestens 8 Zeichen, Groß-/Kleinbuchstaben, Ziffern"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <button type="submit" className="btn-primary">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                    Benutzer registrieren
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
