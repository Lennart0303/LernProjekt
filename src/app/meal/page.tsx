"use client";

import React, { useState, useEffect } from "react";
import { Segment } from "next/dist/server/app-render/types";
import Navigation from "@/components/Navigation/page";
import Header from "@/components/Header/page";
import "./meal.css"; // optional, für benutzerdefinierte Stile

export default function WheelPage() {
    const [segments, setSegments] = useState<Segment[]>([]);

    useEffect(() => { // eigentliche fetch anfrage an den server um die Daten zu bekommen
        setSegments([
            {
                name: "Pizza",
                description: "Klassische Margherita mit Tomate und Käse",
                imageUrl: "/images/pizza.jpg",
            },
            {
                name: "Salat",
                description: "Frischer Gartensalat mit Vinaigrette",
                imageUrl: "/images/salat.jpg",
            },
            {
                name: "Sushi",
                description: "Lachs- und Avocado-Rollen",
                imageUrl: "/images/sushi.jpg",
            },
            {
                name: "Pasta",
                description: "Spaghetti Aglio e Olio",
                imageUrl: "/images/pasta.jpg",
            },
            {
                name: "Curry",
                description: "Indisches Gemüse-Curry mit Kokosmilch",
                imageUrl: "/images/curry.jpg",
            },
        ]);
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
