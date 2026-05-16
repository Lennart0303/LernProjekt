"use client"
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import { AdminGuard } from "@/components/context/AdminGuard";
import "./einsehen.css";

interface Feedback {
    id: number;
    feedback: string;
}

export default function FeedbackEinsehen() {
    const { accessToken, login, logout } = useAuth();
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!accessToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setFeedback([]);
                    toast.error(`Fehler bei der Abfrage (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Feedback[]>;
            })
        )
            .then(data => { setFeedback(data); setLoading(false); })
            .catch(err => {
                setLoading(false);
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
                toast.error("Unbekannter Fehler beim Laden der Feedbacks");
            });
    }, [accessToken, login, logout]);

    return (
        <AdminGuard>
            <div className="app-shell">
                <Navigation />
                <main id="main-content" className="app-main">
                    {/* Hero */}
                    <div className="hero">
                        <div>
                            <h1>Feedback einsehen</h1>
                            <p>Alle eingereichten Rückmeldungen auf einen Blick.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="feedback-list">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="feedbackcard-skeleton">
                                    <div className="feedbackcard-accent" />
                                    <div className="sk-fbody">
                                        <div className="skeleton-line sk-id" />
                                        <div className="skeleton-line sk-fb-1" />
                                        <div className="skeleton-line sk-fb-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : feedback.length === 0 ? (
                        <div className="feedback-empty">
                            <span className="material-symbols-outlined">rate_review</span>
                            <p>Noch keine Feedbacks vorhanden.</p>
                        </div>
                    ) : (
                        <div className="feedback-list">
                            {feedback.map((item, index) => (
                                <div key={index} className="feedbackcard">
                                    <div className="feedbackcard-accent" />
                                    <div className="feedbackinfo">
                                        <div className="feedbackinfo-id">Feedback #{item.id}</div>
                                        <p>{item.feedback}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </AdminGuard>
    );
}
