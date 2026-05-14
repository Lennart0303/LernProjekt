// src/pages/CreateMealPage.tsx
"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/context/AuthContext";
import Header from "@/components/Header/page";
import Navigation from "@/components/Navigation/page";
import { handleAuthError } from "@/components/utils/page";
import "./create_Meal.css";

export default function CreateMealPage() {
    const { accessToken, login, logout } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [calories, setCalories] = useState<number | "">("");

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
            console.error("Fehler:", error.message);
        });
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
                            placeholder="z. B. Spaghetti Bolognese"
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

                    <label>
                        Kalorien:
                        <input
                            type="number"
                            min={1}
                            placeholder="Kalorien (min. 1)"
                            value={calories}
                            onChange={e => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                            required
                        />
                    </label>

                    <button type="submit">Gericht speichern</button>
                </form>
            </main>
        </>
    );
}
