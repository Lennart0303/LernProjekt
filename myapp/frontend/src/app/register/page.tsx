"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import { handleAuthError } from "@/components/utils/page";
import { AdminGuard } from "@/components/context/AdminGuard";
import "../feedback/feedback.css";

export default function Register() {
    const { accessToken, login, logout } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessToken) return;

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
            <div>
                <Header />
                <Navigation />
                <main id="main-content">
                    <section className="feedback-section">
                        <h2 className="feedback-title">Neuen Benutzer registrieren</h2>
                        <p className="feedback-text">
                            Erstelle hier einen neuen Benutzeraccount. Bitte beachte die folgenden Anforderungen:
                            Username 4–50 Zeichen, Passwort mindestens 8 Zeichen mit Groß- und Kleinbuchstaben sowie Ziffern.
                        </p>
                        <form className="feedback-form" onSubmit={handleSubmit}>
                            <label htmlFor="register-username" className="feedback-label">Benutzername:</label>
                            <input
                                id="register-username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Benutzername (4–50 Zeichen)"
                                required
                                className="feedback-input"
                            />
                            <label htmlFor="register-password" className="feedback-label">Passwort:</label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mindestens 8 Zeichen, Groß-/Kleinbuchstaben, Ziffern"
                                required
                                className="feedback-input"
                            />
                            <button type="submit" className="feedback-button">Registrieren</button>
                        </form>
                    </section>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
