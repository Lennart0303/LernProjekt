"use client"
import React, { useState, useEffect } from "react";

import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import { useAuth } from "@/components/context/AuthContext";
import Footer from "@/components/Footer/page";
import { handleAuthError } from "@/components/utils/page";
import "./einsehen.css";


interface Feedback {
    id: number;
    feedback: string;
}

export default function feedback() {
    const { accessToken, login, logout } = useAuth();
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [successMessage, setSuccesMessage] = useState("");

    useEffect(() => {
        if (!accessToken) return;
        fetch("https://localhost:8443/api/feedback", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) {
                    // Refresh fehlgeschlagen oder Weiterleitung
                    return Promise.reject("Auth-Abbruch");
                }
                if (!res.ok) {
                    setFeedback([]);
                    setSuccesMessage(`Fehler bei der Abfrage (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Feedback[]>;
            })
        )
            .then(data => {
                setFeedback(data);
            })
            .catch(err => {
                if (err === "Auth-Abbruch" || err === "API-Fehler") {
                    // Bereits behandelt
                    return;
                }
                console.error("Unbekannter Fehler:", err);
                setSuccesMessage("Unbekannter Fehler beim Laden der Feedbacks");
            });
    }, [accessToken, login, logout]);

    return (
        <div>
            <Header />
            <Navigation />
            <main className="feedbackPage">
                {successMessage}
                {feedback.length === 0 ? (
                    <p>Gerichte werden geladen …</p>
                ) : (
                    feedback.map((feedback, index) => (
                        <div key={index} className="feedbackcard">
                            <div className="feedbackinfo">
                                <h1>{feedback.id}</h1>
                                <p>{feedback.feedback}</p>
                            </div>
                        </div>
                    ))
                )}

                <label></label>
            </main>
            <Footer />
        </div>
    );
}