// src/pages/CreateMealPage.tsx
"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header/page";
import Navigation from "@/components/Navigation/page";
import "./create_Meal.css"; // optional, für benutzerdefinierte Stile
import { METHODS } from "http";

export default function CreateMealPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null); // Dateityp für Bild
    const [successMessage, setSuccessMessage] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description || !imageFile) {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        fetch("http://localhost:8080/api/meal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                description: description,
                imageID: 1
            })
        }).then(response => {
            if (!response.ok) {
                setSuccessMessage("Es gab einen Fehler beim erstellen des Gerichtes mit dem Fehlercode: " + response.status);
                return;
            } else {
                setSuccessMessage("Es wurde erfolgreich erstellt " + response.status)
            }
            return response.json();
        }).catch(error => {
            console.error("Fehler:", error.message);
        });

        // Reset
        setName("");
        setDescription("");
        setImageFile(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // erzeugt temporäre URL
        }
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

                    <label>
                        Bild-Datei (png oder jpg):
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>

                    {imageFile && (
                        <div className="image-preview">
                            <p>Vorschau:</p>
                            <img src={previewUrl} alt="Gericht" />
                        </div>
                    )}

                    <button type="submit">Gericht speichern</button>
                    <label className="success-message">
                        {successMessage && <span>{successMessage}</span>}
                    </label>
                </form>
            </main>
        </>
    );
}
