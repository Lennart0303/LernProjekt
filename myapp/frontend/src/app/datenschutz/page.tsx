import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#eee' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 32px' }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#a0a0a0',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '40px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Zurück
        </Link>

        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#ff6600',
          marginBottom: '8px'
        }}>
          Datenschutzerklärung
        </h1>
        <div style={{ width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '40px' }} />

        {[
          {
            title: '1. Verantwortlicher',
            text: '[Betreiber-Platzhalter], [Adresse]',
          },
          {
            title: '2. Erhobene Daten',
            text: 'Beim Erstellen eines Accounts speichern wir: Benutzername (verschlüsseltes Passwort). Mahlzeiten und Feedback, die du erstellst, werden ebenfalls gespeichert.',
          },
          {
            title: '3. Zweck der Verarbeitung',
            text: 'Die Daten werden ausschließlich zur Bereitstellung der App-Funktionalität verwendet.',
          },
          {
            title: '4. Cookies',
            text: 'Diese Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookie für die Authentifizierung). Es werden keine Tracking- oder Werbe-Cookies eingesetzt.',
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ff8c00',
              marginBottom: '10px'
            }}>
              {section.title}
            </h2>
            <p style={{ color: '#ccc', lineHeight: '1.7' }}>{section.text}</p>
          </div>
        ))}

        <div style={{ marginBottom: '10px' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#ff8c00',
            marginBottom: '10px'
          }}>
            5. Deine Rechte
          </h2>
          <p style={{ color: '#ccc', lineHeight: '1.7' }}>
            Du kannst deinen Account und alle gespeicherten Daten jederzeit über die Profil-Seite löschen. Bei Fragen:{" "}
            <a href="mailto:Dreh&Schmatz@t-online.de" style={{ color: '#ff6600', textDecoration: 'none' }}>
              Dreh&amp;Schmatz@t-online.de
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
