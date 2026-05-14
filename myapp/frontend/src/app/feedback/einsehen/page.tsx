"use client"
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
                if (aborted) {
                    return Promise.reject("Auth-Abbruch");
                }
                if (!res.ok) {
                    setFeedback([]);
                    toast.error(`Fehler bei der Abfrage (Code ${res.status})`);
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
                    return;
                }
                console.error("Unbekannter Fehler:", err);
                toast.error("Unbekannter Fehler beim Laden der Feedbacks");
            });
    }, [accessToken, login, logout]);

    return (
        <div>
            <Header />
            <Navigation />
            <main className="feedbackPage">
                {feedback.length === 0 ? (
                    <p>Keine Feedbacks vorhanden.</p>
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
            </main>
            <Footer />
        </div>
    );
}
