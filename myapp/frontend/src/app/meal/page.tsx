"use client";

import React, { useState, useEffect } from "react";
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import "./meal.css"; // optional, für benutzerdefinierte Stile

export default function WheelPage() {
    const [segments, setSegments] = useState<Segment[]>([]);

    useEffect(() => { // eigentliche fetch anfrage an den server um die Daten zu bekommen
        fetch("http://localhost:8080/api/meal").then(response => {
            if(!response.ok){
                setSegments([null]);
                return;
            }
            return response.json();
        }).then(data => {
            setSegments(data);
        }).catch(error => {
            console.error("Fehler:", error.message);
        })
    }, []);

    return (
        <div>
            <Header />
            <Navigation />
            <main className="mealpage">
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
