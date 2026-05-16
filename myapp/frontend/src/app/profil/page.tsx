"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navigation from "@/components/Navigation/page";
import { useAuth } from "@/components/context/AuthContext";
import { handleAuthError } from "@/components/utils/page";

interface UserProfile {
  username: string;
  mealCount: number;
}

export default function ProfilPage() {
  const router = useRouter();
  const { accessToken, login, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) =>
        handleAuthError(res, login, logout).then((aborted) => {
          if (aborted) return Promise.reject("Auth-Abbruch");
          if (!res.ok) {
            toast.error(`Fehler beim Laden des Profils (Code ${res.status})`);
            return Promise.reject("API-Fehler");
          }
          return res.json() as Promise<UserProfile>;
        })
      )
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err === "Auth-Abbruch" || err === "API-Fehler") return;
        console.error("Unbekannter Fehler:", err);
        toast.error("Fehler beim Laden des Profils.");
      });
  }, [accessToken, login, logout]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Account und alle Gerichte wirklich löschen?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const aborted = await handleAuthError(res, login, logout);
      if (aborted) return;

      if (res.status === 204) {
        await logout();
        toast.success("Account gelöscht.");
        router.push("/");
        return;
      }

      toast.error(`Fehler beim Löschen (Code ${res.status})`);
    } catch {
      toast.error("Netzwerkfehler – bitte versuche es erneut.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-shell">
      <Navigation />
      <main id="main-content" className="app-main">
        {/* Hero */}
        <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/profil.png') center 70% / cover no-repeat" }}>
          <div>
            <h1>Mein Profil</h1>
            <p>Deine persönlichen Daten und Account-Einstellungen.</p>
          </div>
        </div>

        {profile ? (
          <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Profile card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(255,102,0,0.15)',
                  border: '2px solid rgba(255,102,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ff6600' }}>
                    person
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                    {profile.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '2px' }}>Eingeloggter Benutzer</div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: 'rgba(255,102,0,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255,102,0,0.15)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#ff6600' }}>
                  restaurant_menu
                </span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Erstellte Gerichte
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff6600', fontFamily: 'Montserrat, sans-serif' }}>
                    {profile.mealCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ borderColor: 'rgba(231,76,60,0.2)' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#e74c3c', marginBottom: '6px' }}>
                  Gefahrenzone
                </div>
                <p style={{ color: '#a0a0a0', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Das Löschen deines Accounts ist dauerhaft. Alle deine Gerichte werden ebenfalls entfernt.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="btn-danger"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_forever</span>
                {isDeleting ? "Wird gelöscht..." : "Account löschen"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="skeleton-line" style={{ width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton-line" style={{ height: '18px', width: '55%' }} />
                  <div className="skeleton-line" style={{ height: '11px', width: '35%' }} />
                </div>
              </div>
              <div className="skeleton-line" style={{ height: '58px', borderRadius: '8px' }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
