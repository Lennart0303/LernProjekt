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
    const { token } = useAuth();
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [successMessage, setSuccesMessage] = useState("");

    useEffect(() => { 
        if(!token) return;
        fetch("https://localhost:8443/api/feedback", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        }).then(response => {
            if (!response.ok) {
                setFeedback([]);
                setSuccesMessage("Fehler bei der Abfrage mit dem Fehlercode " + response.status);
                if (handleAuthError(response)) return [];
            }
            return response.json();
        }).then(data => {
            setFeedback(data);
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }, [token]);

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