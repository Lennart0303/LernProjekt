"use client"
import React, { useState, useEffect } from "react";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import { handleAuthError } from "@/components/utils/page";
import "./feedback.css";


interface Feedback {
    id: number;
    feedback: string;
}

export default function feedback() {
    const { accessToken, login, logout } = useAuth();
    const [neuesFeedback, setNeuesFeedback] = useState("");
    const [successMessage, setSuccessMessage] = useState("");



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessToken) return;

        fetch("https://localhost:8443/api/feedback", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                feedback: neuesFeedback,
            })
        }).then((res) =>
            handleAuthError(res, login, logout).then((aborted) => {
                if (aborted) {
                    // Token erneuert oder weitergeleitet
                    return Promise.reject("Auth-Abbruch");
                }

                if (res.status === 400) {
                    return res.json().then((errors: Record<string, string>) => {
                        // Nur die Messages aus dem Objekt holen
                        const messages = Object.values(errors);
                        // Zu einer einzigen Nachricht verbinden
                        const message = messages.join(" • ");
                        setSuccessMessage(message);
                        return Promise.reject("Validation-Error");
                    });
                }

                // 2) nach Refresh erneut auf den ursprünglichen Response schauen
                if (!res.ok) {
                    setSuccessMessage(`Fehler beim Erstellen (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                setSuccessMessage(`Erfolg (Code ${res.status})`);
                return res.json();
            })
        ).catch(error => {
            console.error("Fehler:", error.message);
        });
    }

    return (
        <div>
            <Header />
            <Navigation />
            <main>
                <section className="feedback-section">
                    <h2 className="feedback-title">Dein Feedback &amp; Deine Ideen</h2>
                    <p className="feedback-text">
                        Wir arbeiten ständig daran, diese Seite weiterzuentwickeln.
                        Hast du Anregungen zum dunklen Design, zur Orange-Akzentfarbe oder neue Features im Sinn?
                        Teile deine Ideen mit uns!
                    </p>
                    <form id="feedback-form" className="feedback-form" action="#" method="post">
                        <label htmlFor="feedback-textarea" className="feedback-label">Dein Feedback:</label>
                        <textarea
                            id="feedback-textarea"
                            name="feedback"
                            rows={4}
                            placeholder="Schreibe hier deine Ideen oder Anmerkungen..."
                            required
                            className="feedback-input"
                            onChange={e => setNeuesFeedback(e.target.value)}
                        ></textarea>
                        <button type="button" onClick={handleSubmit} className="feedback-button">Absenden</button>
                        <span>{successMessage}</span>
                    </form>
                </section>

            </main>
            <Footer />
        </div>
    );
}