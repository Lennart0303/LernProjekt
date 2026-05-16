"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";
import "./meal.css";

interface Meal {
    id: number;
    name: string;
    description: string;
    calories: number;
    userId: number;
}

export default function MealPage() {
    const { accessToken, login, logout } = useAuth();
    const [search, setSearch] = useState("");
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        if (!accessToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setMeals([]);
                    setStatusMessage(`Fehler bei der Abfrage (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Meal[]>;
            })
        )
            .then(data => { setMeals(data); setLoading(false); })
            .catch(err => {
                setLoading(false);
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
                setStatusMessage("Unbekannter Fehler beim Laden der Gerichte");
            });
    }, [accessToken, login, logout]);

    const searchMeal = (query: string) => {
        if (!accessToken) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal/search?q=${encodeURIComponent(query)}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setMeals([]);
                    setStatusMessage(`Fehler bei der Suche (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Meal[]>;
            })
        )
            .then(data => {
                setMeals(data);
                setStatusMessage(
                    `${data.length} Gericht${data.length !== 1 ? 'e' : ''} gefunden für „${query}"`
                );
            })
            .catch(err => {
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
                setStatusMessage("Unbekannter Fehler bei der Suche");
            });
    };

    const deleteMeal = (id: number) => {
        if (!accessToken) return;
        if (!window.confirm("Gericht wirklich löschen?")) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Authorization": `Bearer ${accessToken}` },
        }).then(res =>
            handleAuthError(res, login, logout).then(aborted => {
                if (aborted) return Promise.reject("Auth-Abbruch");
                if (!res.ok) {
                    setStatusMessage(`Fehler beim Löschen (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                setMeals(prev => prev.filter(m => m.id !== id));
            })
        ).catch(err => {
            if (err === "Auth-Abbruch" || err === "API-Fehler") return;
            console.error("Fehler beim Löschen:", err);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') searchMeal(search);
    };

    const PREVIEW_LENGTH = 200;

    return (
        <div className="app-shell">
            <Navigation />
            <main id="main-content" className="app-main">
                {/* Hero */}
                <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/gerichte.png') center / cover no-repeat" }}>
                    <div>
                        <h1>Gerichte</h1>
                        <p>Alle gespeicherten Gerichte auf einen Blick.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Nach Gericht suchen…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="search-button" onClick={() => searchMeal(search)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '4px' }}>search</span>
                        Suchen
                    </button>
                </div>

                {statusMessage && (
                    <p className="meal-status-msg">{statusMessage}</p>
                )}

                {/* Cards */}
                {loading ? (
                    <div className="meal-grid">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="mealcard-skeleton">
                                <div className="mealcard-accent" />
                                <div className="sk-body">
                                    <div className="skeleton-line sk-pill" />
                                    <div className="skeleton-line sk-title" />
                                    <div className="skeleton-line sk-text" />
                                    <div className="skeleton-line sk-text-short" />
                                    <div className="skeleton-line sk-kcal" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : meals.length === 0 ? (
                    <div className="meal-empty">
                        <span className="material-symbols-outlined">restaurant_menu</span>
                        <p>Keine Gerichte gefunden.</p>
                    </div>
                ) : (
                    <div className="meal-grid">
                        {meals.map((meal) => {
                            const isExpanded = expandedId === meal.id;
                            const isLong = meal.description && meal.description.length > PREVIEW_LENGTH;
                            const displayText = isExpanded || !isLong
                                ? meal.description
                                : meal.description.slice(0, PREVIEW_LENGTH) + "…";

                            return (
                                <div key={meal.id} className="mealcard">
                                    <div className="mealcard-accent" />
                                    <div className="mealinfo">
                                        <div className="mealcard-header">
                                            <span className="meal-category-pill">Gericht</span>
                                            <button
                                                className="meal-delete-btn"
                                                onClick={() => deleteMeal(meal.id)}
                                                title="Löschen"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        <h2>{meal.name}</h2>
                                        {meal.description && (
                                            <>
                                                <p className="mealinfo-desc">{displayText}</p>
                                                {isLong && (
                                                    <button
                                                        className="meal-toggle-btn"
                                                        onClick={() => setExpandedId(isExpanded ? null : meal.id)}
                                                    >
                                                        {isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                            {isExpanded ? "expand_less" : "expand_more"}
                                                        </span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <div className="mealinfo-meta">
                                            {meal.calories} kcal
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
