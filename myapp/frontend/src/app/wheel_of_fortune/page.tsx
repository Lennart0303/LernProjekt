"use client";

import React, { useState, useEffect } from "react";
import CustomRoulette from "@/components/Wheel/page";
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";

export default function WheelPage() {
    const { accessToken, login, logout } = useAuth();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [result, setResult] = useState<Segment | null>(null);

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
                    setSegments([]);
                    console.log(`Fehler bei der Abfrage (Code ${res.status})`);
                    return Promise.reject("API-Fehler");
                }
                return res.json() as Promise<Segment[]>;
            })
        )
            .then(data => setSegments(data))
            .catch(err => {
                if (err === "Auth-Abbruch" || err === "API-Fehler") return;
                console.error("Unbekannter Fehler:", err);
            });
    }, [accessToken, login, logout]);

    const handleFinished = (winner: Segment) => {
        setResult(winner);
    };

    return (
        <div className="app-shell">
            <Navigation />
            <main id="main-content" className="app-main">
                {/* Hero */}
                <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/gl%C3%BCcksrad.png') center 20% / cover no-repeat" }}>
                    <div>
                        <h1>Glücksrad</h1>
                        <p>Drehe das Rad und lass das Schicksal entscheiden.</p>
                    </div>
                </div>

                {segments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
                            casino
                        </span>
                        <p>Lade Gerichte…</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Wheel column */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <CustomRoulette
                                segments={segments}
                                onFinished={handleFinished}
                            />
                            {result && (
                                <div style={{ marginTop: '16px' }}>
                                    <strong style={{ fontSize: '1.1rem', color: '#ff6600', fontFamily: 'Montserrat, sans-serif' }}>
                                        {result.name}
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* Result detail card */}
                        <div style={{ flex: 1, minWidth: '260px' }}>
                            {result ? (
                                <div className="card">
                                    <div style={{ marginBottom: '8px' }}>
                                        <span className="pill">Ausgewählt</span>
                                    </div>
                                    <h2 style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontSize: '1.8rem',
                                        fontWeight: 800,
                                        color: '#ff6600',
                                        marginBottom: '12px',
                                        lineHeight: 1.2
                                    }}>
                                        {result.name}
                                    </h2>
                                    <p style={{ color: '#a0a0a0', lineHeight: '1.6', marginBottom: '16px' }}>
                                        {result.description}
                                    </p>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        background: 'rgba(255,102,0,0.1)',
                                        border: '1px solid rgba(255,102,0,0.25)',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        color: '#ff8c00'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_fire_department</span>
                                        {result.calories} kcal
                                    </div>
                                </div>
                            ) : (
                                <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#333', display: 'block', marginBottom: '12px' }}>
                                        touch_app
                                    </span>
                                    <p style={{ color: '#555', fontStyle: 'italic' }}>
                                        Drehe das Rad, um dein Gericht zu sehen
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
