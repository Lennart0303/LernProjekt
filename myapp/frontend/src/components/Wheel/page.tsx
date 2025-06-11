// src/components/wheel/Wheel.tsx
"use client";

import React, { useState } from "react";
import { Wheel } from "react-custom-roulette";
import "./wheel.css"; // optional, für benutzerdefinierte Stile

interface Segment {
    name: string;
    description: string;
    imageUrl: string;
}

interface WheelProps {
    segments: Segment[];
    onFinished: (winner: Segment) => void;
}

export default function CustomRoulette({ segments, onFinished }: WheelProps) {
    // State, ob gerade gedreht wird
    const [mustSpin, setMustSpin] = useState(false);
    // Der Index des Segments, auf dem das Rad landet
    const [prizeNumber, setPrizeNumber] = useState(0);

    const spin = () => {
        const newPrizeNumber = Math.floor(Math.random() * segments.length);
        setPrizeNumber(newPrizeNumber);
        setMustSpin(true);
    };

    return (
        <div>
            <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={segments.map((s) => ({ option: s.name }))}
                backgroundColors={[
                    "#FFD1A4", // Hellorange
                    "#FFB677", // Mittelorange
                    "#FF924D", // Dunkler
                    "#FF7733", // Satt
                ]}
                textColors={["#000"]}
                spinDuration={0.3}
                onStopSpinning={() => {
                    setMustSpin(false);
                    onFinished(segments[prizeNumber]);
                }}
            />
            <button onClick={spin} className="spin-button">
                Rad drehen
            </button>
        </div>
    );
}
