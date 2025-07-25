"use client";

import React, { useState, useEffect } from "react";
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import "./meal.css"; // optional, für benutzerdefinierte Stile

export default function WheelPage() {
    const { accessToken, login, logout } = useAuth();
    const [search, setSearch] = useState("");
    const [segments, setSegments] = useState<Segment[]>([]);
    const [successMessage, setSuccesMessage] = useState("");

    useEffect(() => {
        if (!accessToken) return;
        fetch("https://localhost:8443/api/meal", {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,   // <<< hier den JWT mitsenden
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setSegments([]);
                    setSuccesMessage(`Fehler bei der Abfrage (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Segment[]>;
            })
        )
            .then(data => {
                setSegments(data);
            })
            .catch(err => {
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
                setSuccesMessage("Unbekannter Fehler beim Laden der Gerichte");
            });
    }, [accessToken, login, logout]);

    const searchMeal = (query: string) => {
        if (!accessToken) return;
        fetch("https://localhost:8443/api/meal/search" + "?q=" + query, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,   // <<< hier den JWT mitsenden
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setSegments([]);
                    setSuccesMessage(
                        `Fehler bei der Suche (Code ${res.status})`
                    );
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Segment[]>;
            })
        )
            .then(data => {
                setSegments(data);
                setSuccesMessage(
                    `Es wurden ${data.length} Gerichte gefunden, die zu „${query}“ passen`
                );
            })
            .catch(err => {
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
                setSuccesMessage("Unbekannter Fehler bei der Suche");
            });
    };

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
