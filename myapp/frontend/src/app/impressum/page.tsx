import Link from "next/link";

export default function ImpressumPage() {
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
          Impressum
        </h1>
        <div style={{ width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '32px' }} />

        <p style={{ marginBottom: '8px', color: '#666', fontSize: '0.875rem' }}>Angaben gemäß § 5 TMG</p>

        <p style={{ lineHeight: '1.8', marginBottom: '24px', color: '#ccc' }}>
          [Betreiber-Platzhalter]<br />
          Musterstraße 1<br />
          12345 Musterstadt
        </p>

        <div style={{ marginBottom: '8px', fontWeight: 700, color: '#ff8c00', fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem' }}>
          Kontakt
        </div>
        <p style={{ marginBottom: '32px', color: '#ccc' }}>
          E-Mail:{" "}
          <a href="mailto:Dreh&Schmatz@t-online.de" style={{ color: '#ff6600', textDecoration: 'none' }}>
            Dreh&amp;Schmatz@t-online.de
          </a>
        </p>

        <div style={{ marginBottom: '8px', fontWeight: 700, color: '#ff8c00', fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem' }}>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </div>
        <p style={{ color: '#ccc' }}>[Name Platzhalter]</p>
      </div>
    </div>
  );
}
