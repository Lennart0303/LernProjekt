// src/pages/CreateMealPage.tsx
"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/context/AuthContext";
import Navigation from "@/components/Navigation/page";
import { handleAuthError } from "@/components/utils/page";
import "./create_Meal.css";

export default function CreateMealPage() {
    const { accessToken, login, logout } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [calories, setCalories] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description) {
            toast.error("Bitte alle Felder ausfüllen!");
            return;
        }

        if (calories === "" || Number(calories) < 1) {
            toast.error("Bitte gib eine gültige Kalorienzahl (min. 1) ein.");
            return;
        }

        if (!accessToken) return;

        setIsLoading(true);

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                name: name,
                description: description,
                calories: Number(calories)
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
                    toast.error(`Fehler beim Erstellen (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                toast.success("Gericht erfolgreich erstellt!");
                setName("");
                setDescription("");
                setCalories("");
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
                <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/gericht_erstellen.png') center / cover no-repeat" }}>
                    <div>
                        <h1>Gericht erstellen</h1>
                        <p>Füge ein neues Gericht zur Sammlung hinzu.</p>
                    </div>
                </div>

                <div className="create-meal-form-wrapper">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="meal-name" className="form-label">
                                Titel
                            </label>
                            <input
                                id="meal-name"
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="z. B. Spaghetti Bolognese"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="meal-desc" className="form-label">
                                Beschreibung & Zubereitung
                            </label>
                            <textarea
                                id="meal-desc"
                                className="form-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Zutaten, Zubereitung, Besonderheiten… Alles hier eintragen."
                                maxLength={1500}
                                required
                            />
                            <span style={{ fontSize: '0.75rem', color: description.length > 1300 ? '#ff6600' : '#555', textAlign: 'right' }}>
                                {description.length} / 1500
                            </span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="meal-calories" className="form-label">
                                Kalorien (kcal)
                            </label>
                            <input
                                id="meal-calories"
                                type="number"
                                className="form-input"
                                min={1}
                                placeholder="z. B. 650"
                                value={calories}
                                onChange={e => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                            {isLoading ? "Wird erstellt..." : "Gericht erstellen"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
