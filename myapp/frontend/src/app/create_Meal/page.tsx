// src/pages/CreateMealPage.tsx
"use client";
import React, { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Header/page";
import Navigation from "@/components/Navigation/page";
import { handleAuthError } from "@/components/utils/page";
import "./create_Meal.css"; // optional, für benutzerdefinierte Stile

export default function CreateMealPage() {
    const { accessToken, login, logout } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description ) {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        if (!accessToken) return;

        fetch("https://localhost:8443/api/meal", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: name,
                description: description
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

        // Reset
        setName("");
        setDescription("");
    };

    return (
        <>
            <Header />
            <Navigation />

            <main className="create-meal-page">
                <h1>Neues Gericht erstellen</h1>
                <form onSubmit={handleSubmit} className="meal-form">
                    <label>
                        Titel:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z. B. Spaghetti Bolognese"
                            required
                        />
                    </label>

                    <label>
                        Beschreibung:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Was macht das Gericht aus?"
                            required
                        />
                    </label>

                    <button type="submit">Gericht speichern</button>
                    <label className="success-message">
                        {successMessage && <span>{successMessage}</span>}
                    </label>
                </form>
            </main>
        </>
    );
}
