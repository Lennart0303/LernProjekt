"use client";

import React, { useEffect, useState } from "react";
import styles from "./CookieConsent.module.css";

type ConsentState = "accepted" | "declined" | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    const stored = localStorage.getItem("cookieConsent");
    if (stored === "accepted") {
      setConsent("accepted");
    } else if (stored === "declined") {
      setConsent("declined");
    } else {
      setConsent(null);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setConsent("accepted");
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setConsent("declined");
  };

  // During SSR / first hydration, render nothing to avoid mismatch
  if (consent === "loading" || consent === "accepted") {
    return null;
  }

  if (consent === "declined") {
    return (
      <div className={styles.warningBox}>
        <p>
          Diese Seite benötigt technisch notwendige Cookies für die Anmeldung.
          Ohne Cookies ist kein Zugriff möglich.
        </p>
        <button className={styles.acceptButton} onClick={handleAccept}>
          Akzeptieren
        </button>
      </div>
    );
  }

  // consent === null: show full banner
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h2>Diese Website verwendet Cookies</h2>
        <p>
          Wir verwenden ausschließlich technisch notwendige Cookies für die
          Authentifizierung. Es werden keine Tracking- oder Werbe-Cookies
          eingesetzt.
        </p>
        <div className={styles.buttons}>
          <button className={styles.acceptButton} onClick={handleAccept}>
            Akzeptieren
          </button>
          <button className={styles.declineButton} onClick={handleDecline}>
            Ablehnen
          </button>
        </div>
      </div>
    </div>
  );
}
