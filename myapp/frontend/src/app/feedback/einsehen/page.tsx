"use client"
import React, { useState, useEffect } from "react";

import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import Footer from "@/components/Footer/page";
import "./einsehen.css";


interface Feedback {
    id: number;
    feedback: string;
}

export default function feedback() {
    const [feedback, setFeedback] = useState<Feedback[] >([])
    const [successMessage, setSuccesMessage] = useState("");

    useEffect(() => { // eigentliche fetch anfrage an den server um die Daten zu bekommen
        fetch("http://localhost:8080/api/feedback").then(response => {
            if (!response.ok) {
                setFeedback([]);
                setSuccesMessage("Fehler bei der Abfrage mit dem Fehlercode " + response.status);
                return [];
            }
            return response.json();
        }).then(data => {
            setFeedback(data);
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }, []);

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