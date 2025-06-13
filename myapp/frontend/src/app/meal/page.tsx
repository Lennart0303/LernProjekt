"use client";

import React, { useState, useEffect } from "react";
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import "./meal.css"; // optional, für benutzerdefinierte Stile

export default function WheelPage() {
    const [search, setSearch] = useState("");
    const [segments, setSegments] = useState<Segment[]>([]);
    const [successMessage, setSuccesMessage] = useState("");

    useEffect(() => { // eigentliche fetch anfrage an den server um die Daten zu bekommen
        fetch("http://localhost:8080/api/meal").then(response => {
            if (!response.ok) {
                setSegments([null]);
                setSuccesMessage("Fehler bei der Abfrage mit dem Fehlercode " + response.status);
                return [];
            }
            return response.json();
        }).then(data => {
            setSegments(data);
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }, []);

    const searchMeal = (query: string) => {
        fetch("http://localhost:8080/api/meal/search" + "?q=" + query).then(response => {
            if (!response.ok) {
                setSegments([]);
                setSuccesMessage("Es gab ein Fehler bei der Abfrage mit dem Fehlercode: " + response.status);
                return;
            }
            return response.json();
        }).then(data => {
            setSegments(data);
            setSuccesMessage("Es wurden " + data.length + " Einträge gefunden, die zu " + query + " passen");
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }

    return (
        <div>
            <Header />
            <Navigation />
            <main className="mealpage">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Nach Gericht suchen…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        className="search-button"
                        onClick={() => searchMeal(search)}
                    >
                        Suchen
                    </button>
                </div>
                <span>{successMessage}</span>
                {segments.length === 0 ? (
                    <p>Gerichte werden geladen …</p>
                ) : (
                    segments.map((segment, index) => (
                        <div key={index} className="mealcard">
                            <img src={segment.imageUrl} alt={segment.name} />
                            <div className="mealinfo">
                                <h1>{segment.name}</h1>
                                <p>{segment.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </main>

        </div>
    );
}
