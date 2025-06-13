"use client"
import React, { useState, useEffect } from "react";

import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import "./feedback.css";


interface Feedback {
    id: number;
    feedback: string;
}

export default function feedback() {
    const [neuesFeedback, setNeuesFeedback] = useState("");
    const [successMessage, setSuccessMessage] = useState("");



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        fetch("http://localhost:8080/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                feedback: neuesFeedback,
            })
        }).then(response => {
            if (!response.ok) {
                setSuccessMessage("Es gab einen Fehler beim erstellen des Feedbacks mit dem Fehlercode: " + response.status);
                return;
            } else {
                setSuccessMessage("Es wurde erfolgreich erstellt " + response.status)
            }
            return response.json();
        }).catch(error => {
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
                            onChange={e =>setNeuesFeedback(e.target.value) }
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