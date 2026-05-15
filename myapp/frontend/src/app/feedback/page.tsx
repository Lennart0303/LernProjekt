"use client"
import React, { useState } from "react";
import toast from "react-hot-toast";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
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
                if (aborted) {
                    return Promise.reject("Auth-Abbruch");
                }

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
                return res.json();
            })
        ).catch(error => {
            console.error("Fehler:", error.message);
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div>
            <Header />
            <Navigation />
            <main id="main-content">
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
                        <button type="button" onClick={handleSubmit} disabled={isLoading} className="feedback-button">
                            {isLoading ? "Wird gesendet..." : "Feedback senden"}
                        </button>
                    </form>
                </section>
            </main>
            <Footer />
        </div>
    );
}
