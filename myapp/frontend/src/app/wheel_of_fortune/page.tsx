"use client";

import React, { useState, useEffect } from "react";
import CustomRoulette from "@/components/Wheel/page"; // jetzt deine neue Komponente
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";

export default function WheelPage() {
    const { token } = useAuth();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [result, setResult] = useState<Segment | null>(null);

    useEffect(() => {
        if (!token) return;
        fetch("https://localhost:8443/api/meal", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,   // <<< hier den JWT mitsenden
            },
        }).then(response => {
            if (!response.ok) {
                setSegments([null]);
                if (handleAuthError(response)) return;
            }
            return response.json();
        }).then(data => {
            setSegments(data);
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }, [token]);

    const handleFinished = (winner: Segment) => {
        setResult(winner);
    };

    return (
        <div>
            <Header />
            <Navigation />
            <div style={{ marginLeft: 220, padding: 16, paddingRight: 20 }}>

                {segments.length === 0 && <p>Lade Gerichte …</p>}

                {segments.length > 0 && (
                    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                        {/* Linke Spalte: Rad und darunter Ergebnis-Name */}
                        <div style={{ textAlign: "center", flexShrink: 0, padding: 24 }}>
                            <CustomRoulette
                                segments={segments}
                                onFinished={handleFinished}
                            />
                            {result && (
                                <div style={{ marginTop: 16 }}>
                                    <strong style={{ fontSize: "1.25rem" }}>{result.name}</strong>
                                </div>
                            )}
                        </div>

                        {/* Rechte Spalte: Detail-Box (nimmt restlichen Platz ein) */}
                        <div style={{ flex: 1 }}>
                            {result ? (
                                <>
                                    <h2 style={{ margin: "0 0 8px 0", color: "#ff6600", fontSize: "2rem", fontWeight: "bold" }}>
                                        {result.name}
                                    </h2>
                                    <p style={{ margin: "0 0 12px 0", lineHeight: 1.4 }}>
                                        {result.description}
                                    </p>
                                    <img
                                        src={result.imageUrl}
                                        alt={result.name}
                                        style={{
                                            width: "100%",
                                            borderRadius: 8,
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                                            objectFit: "cover",
                                        }}
                                    />
                                </>
                            ) : (
                                <p style={{ fontStyle: "italic", color: "#aaa" }}>
                                    Drehe das Rad, um dein Gericht zu sehen
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
