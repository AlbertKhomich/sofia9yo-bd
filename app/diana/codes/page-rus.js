import { DIANA_MISSIONS, MUSIC_CODE } from '../../../lib/diana';
import '../../geheimcodes/print.css';

export const metadata = { title: 'Диана · Карточки для организатора' };
export default function DianaCards() {
  return <main className="print-sheet" lang="ru">
    <nav className="print-actions"><a href="/diana">← К расследованию</a><p>Печать: Ctrl+P / ⌘P</p></nav>
    <h1>Дело № 009 · Подготовка</h1>
    <p className="instructions">Только для организатора. Вырежьте восемь карточек и спрячьте их в указанных местах. Задания дети читают на планшете: код каждой карточки открывает следующую задачу. Карточка № 8 открывает финальный замок. Не нужно включать кофемашину, подниматься на чердак, открывать крышку фортепиано или копать землю. Закрепите карточки в доступных местах. Подарок оставьте у взрослого или в коробке с пятизначным замком {MUSIC_CODE}. После верного музыкального кода игра предложит детям обратиться к хранителю подарка.</p>
    <div className="card-grid">{DIANA_MISSIONS.map((mission, i) => <article className="code-card" key={mission.code}>
      <div className="where">{i + 1}. {mission.place}</div><p>ДЕЛО № 009 · УЛИКА НАЙДЕНА</p><div className="secret-code">{mission.code}</div><div>Введите код на планшете.</div>
    </article>)}</div>
  </main>;
}
