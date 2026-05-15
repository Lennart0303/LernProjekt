"use client"
import React, { useState } from "react";
import toast from "react-hot-toast";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import "./feedback.css";

export default function FeedbackPage() {
    const { accessToken, login, logout } = useAuth();
    const [neuesFeedback, setNeuesFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!accessToken) return;

        setIsLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
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
                if (aborted) return Promise.reject("Auth-Abbruch");

                if (res.status === 400) {
                    return res.json().then((errors: Record<string, string>) => {
                        const message = Object.values(errors).join(" • ");
                        toast.error(message);
                        return Promise.reject("Validation-Error");
                    });
                }

                if (!res.ok) {
                    toast.error(`Fehler beim Senden (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                toast.success("Feedback erfolgreich gesendet!");
                setNeuesFeedback("");
                return res.json();
            })
        ).catch(error => {
            if (error !== "Auth-Abbruch" && error !== "Validation-Error" && error !== "API-Fehler") {
                console.error("Fehler:", error);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="app-shell">
            <Navigation />
            <main id="main-content" className="app-main">
                {/* Hero */}
                <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/feedback.png') center 80% / cover no-repeat" }}>
                    <div>
                        <h1>Feedback</h1>
                        <p>Teile deine Ideen und Anregungen mit uns.</p>
                    </div>
                </div>

                <div className="feedback-wrapper">
                    <div className="feedback-section">
                        <h2 className="feedback-title">Dein Feedback &amp; Deine Ideen</h2>
                        <p className="feedback-text">
                            Wir arbeiten ständig daran, diese Seite weiterzuentwickeln.
                            Hast du Anregungen zum Design, neue Features im Sinn oder sonstige Ideen?
                            Teile sie mit uns!
                        </p>
                        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label htmlFor="feedback-textarea" className="feedback-label">
                                    Dein Feedback
                                </label>
                                <textarea
                                    id="feedback-textarea"
                                    name="feedback"
                                    rows={5}
                                    placeholder="Schreibe hier deine Ideen oder Anmerkungen..."
                                    required
                                    className="feedback-input"
                                    value={neuesFeedback}
                                    onChange={e => setNeuesFeedback(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="feedback-button"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                                {isLoading ? "Wird gesendet..." : "Feedback senden"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
