"use client";
import Navigation from '@/components/Navigation/page';

export default function Home() {
  return (
    <div className="app-shell">
      <Navigation />
      <main id="main-content" className="app-main">
        {/* Hero */}
        <div className="hero" style={{ background: "linear-gradient(135deg, rgba(20,5,0,0.60) 0%, rgba(40,12,0,0.48) 40%, rgba(0,0,0,0.35) 100%), url('/essensrad/bilder/dashboard.png') center / cover no-repeat" }}>
          <div>
            <h1>Willkommen bei Dreh &amp; Schmatz</h1>
            <p>Lass das Glücksrad entscheiden, was heute auf den Tisch kommt.</p>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: '#ff6600' }}
              >
                casino
              </span>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>
                Worum geht es hier?
              </h2>
            </div>
            <p style={{ color: '#a0a0a0', lineHeight: '1.7', fontSize: '0.95rem' }}>
              „Dreh &amp; Schmatz" hilft dir bei der täglichen Frage „Was koche ich heute?".
              Drehe unser digitales Glücksrad und lass es ein gespeichertes Gericht für dich auswählen.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: '#ff6600' }}
              >
                checklist
              </span>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>
                Was macht man hier?
              </h2>
            </div>
            <ul className="content-list" style={{ color: '#a0a0a0', lineHeight: '1.9', fontSize: '0.95rem' }}>
              <li>Klicke auf „Glücksrad" und lass das Rad drehen.</li>
              <li>Das Rad wählt ein zufälliges Gericht aus.</li>
              <li>Unter „Gericht erstellen" kannst du neue Einträge hinzufügen.</li>
              <li>Alle Gerichte werden lokal in einer SQLite-Datenbank gespeichert.</li>
            </ul>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '28px', color: '#ff6600' }}
              >
                auto_awesome
              </span>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>
                Warum gibt es das?
              </h2>
            </div>
            <p style={{ color: '#a0a0a0', lineHeight: '1.7', fontSize: '0.95rem' }}>
              Oft fehlt die Inspiration oder die Zeit, nach Rezeptideen zu suchen.
              Das Zufallsrad fördert spontane Entscheidungen und bringt Abwechslung auf den Teller.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#ff6600' }}>
            Viel Spaß beim Kochen!
          </p>
        </div>
      </main>
    </div>
  );
}
