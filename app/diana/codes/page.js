import { DIANA_MISSIONS, MUSIC_CODE } from "../../../lib/diana";
import "../../geheimcodes/print.css";

export const metadata = {
  title: "Diana · Karten für die Spielleitung",
};

export default function DianaCards() {
  return (
    <main className="print-sheet" lang="de">
      <nav className="print-actions">
        <a href="/diana">← Zurück zur Ermittlung</a>
        <p>Drucken: Strg+P / ⌘P</p>
      </nav>

      <h1>Fall Nr. 009 · Vorbereitung</h1>

      <p className="instructions">
        Nur für die Spielleitung. Schneidet die acht Karten aus und versteckt
        sie an den angegebenen Orten. Die Kinder lesen die Aufgaben auf dem
        Tablet. Mit dem Code auf jeder Karte wird die nächste Aufgabe
        freigeschaltet. Karte Nr. 8 öffnet das letzte Schloss. Die
        Kaffeemaschine muss nicht eingeschaltet werden. Niemand muss auf den
        Dachboden steigen, den Klavierdeckel öffnen oder in der Erde graben.
        Befestigt die Karten an gut erreichbaren Stellen. Bewahrt das Geschenk
        bei einem Erwachsenen auf oder legt es in eine Box mit einem
        fünfstelligen Zahlenschloss (Code: {MUSIC_CODE}). Nach der richtigen
        Eingabe des musikalischen Codes werden die Kinder aufgefordert, sich an
        die Person zu wenden, die das Geschenk aufbewahrt.
      </p>

      <div className="card-grid">
        {DIANA_MISSIONS.map((mission, i) => (
          <article className="code-card" key={mission.code}>
            <div className="where">
              {i + 1}. {mission.place}
            </div>
            <p>FALL NR. 009 · HINWEIS GEFUNDEN</p>
            <div className="secret-code">{mission.code}</div>
            <div>Gebt den Code auf dem Tablet ein.</div>
          </article>
        ))}
      </div>
    </main>
  );
}
