"use client";
import Navigation from '@/components/Navigation/page';
import Footer from '@/components/Footer/page';
import Header from '@/components/Header/page';



export default function Home() {
  return (
    <div >
      <Header />
      <Navigation />
      <main>
        <section>
          <h2>Worum geht es hier?</h2>
          <p>
            „DrehZumGenuss“ ist eine kleine Webanwendung, die dir bei der täglichen Frage
            „Was koche ich heute?“ hilft. Anstatt lange zu überlegen oder Rezepte
            durchzuscrollen, drehst du einfach unser digitales Glücksrad. Das Rad zeigt
            deine gespeicherten Gerichte an und wählt per Zufall eines aus.
          </p>
        </section>
        <br></br>

        <section>
          <h2>Was macht man hier?</h2>
          <ul >
            <li>Du klickst auf „Glücksrad“ und lässt das Rad drehen.</li>
            <li>Das Rad landet auf einem Gericht und zeigt dir direkt, was du kochen kannst.</li>
            <li>Unter „Gericht erstellen“ kannst du neue Einträge hinzufügen (Name, Beschreibung etc.).</li>
            <li>Alle Gerichte werden lokal in einer SQLite-Datenbank gespeichert, damit du sie jederzeit ändern oder löschen kannst.</li>
          </ul>
        </section>
        <br></br>

        <section>
          <h2>Warum gibt es das?</h2>
          <p>
            Oft fehlt die Inspiration oder die Zeit, lange nach Rezeptideen zu suchen.
            Dieses Zufallsrad soll spontane Entscheidungen fördern und dir dabei helfen,
            regelmäßig Abwechslung auf den Teller zu bringen. Außerdem macht die Interaktion
            mit dem Glücksrad einfach Spaß!
          </p>
        </section>
        <br></br>

        <h2>Viel Spaß beim Kochen</h2> 
      </main>

      <Footer />
    </div>
  );
}
