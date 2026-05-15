import Link from "next/link";
import "./footer.css";

export default function Footer() {
    return (
        <footer>
            <p>&copy; 2025 Mein Kochbuch. Alle Rechte vorbehalten.</p>
            <p>Kontakt: <a href="mailto:Dreh&Schmatz@t-online.de">Dreh&amp;Schmatz@t-online.de</a></p>
            <p>
                <Link href="/impressum">Impressum</Link>
                {" | "}
                <Link href="/datenschutz">Datenschutz</Link>
            </p>
        </footer>
    );
}
