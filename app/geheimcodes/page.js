import Link from 'next/link';
import { MISSIONS } from '../../lib/missions';
import PrintButton from '../../components/print-button';
import './print.css';

export const metadata = { title: 'Geheimcodes zum Ausschneiden' };
const icons = ['❄️', '🛋️', '🐴', '🪟', '🍽️', '🐹', '🪞'];

export default function CodeCards() {
  return <main className="print-sheet">
    <nav className="print-actions"><Link href="/">← Zum Spiel</Link><PrintButton /></nav>
    <h1>🔐 Geheime Codekarten</h1>
    <p className="instructions">Ausschneiden und an den genannten Orten verstecken. Die Ortsbezeichnungen stehen klein auf der Karte, damit du beim Verteilen weißt, wohin sie gehört. Die Karte beim Meerschweinchen bitte außen am Käfig anbringen.</p>
    <div className="card-grid">{MISSIONS.slice(0, 7).map((mission, i) => <article className="code-card" key={mission.code}>
      <div className="icon">{icons[i]}</div><div className="where">{i === 5 ? 'Außen am Meerschweinchenkäfig' : mission.place}</div>
      <p>Geheimcode</p><div className="secret-code">{mission.code}</div><div>🔓 Gebt mich im Spiel ein!</div>
    </article>)}</div>
  </main>;
}
