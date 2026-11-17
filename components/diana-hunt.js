'use client';

import { useEffect, useRef, useState } from 'react';
import { DIANA_MISSIONS, DIANA_STORAGE_KEY, INITIAL_DIANA_STATE, MUSIC_CODE, acceptsDianaCode, restoreDiana, decodeDiana } from '../lib/diana';

function Puzzle({ mission, music, saveMusic }) {
  const [selected, setSelected] = useState([]);
  const [shift, setShift] = useState(0);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [mirror, setMirror] = useState(false);
  function choose(label, correct) { setMessage(label === correct ? 'Верно! Теперь найдите настоящую карточку с кодом.' : 'Этот след не подходит. Обсудите улики и попробуйте ещё раз.'); }
  function playNote(i) {
    setNotes(value => (value.length < 5 ? value + (i + 1) : value));
    // Sound is optional: the visible keypad works even when audio is unavailable.
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const audio = new Audio();
      const oscillator = audio.createOscillator(); const gain = audio.createGain();
      oscillator.frequency.value = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88][i];
      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.onended = () => { audio.close().catch(() => {}); };
      oscillator.start(); oscillator.stop(audio.currentTime + 0.3);
      audio.resume().catch(() => {});
    } catch { /* Silent browsers still support the puzzle. */ }
  }
  return <div className="diana-lab">
    <p className="diana-label">Лаборатория улик</p>
    {mission.type === 'letters' && <><p>Нажимайте на первые буквы строк.</p><div className="diana-row">{[...'ВАННА'].map((letter, i) => <button key={i} aria-label={`Первая буква строки ${i + 1}`} aria-pressed={selected.includes(i)} onClick={() => setSelected(old => old.includes(i) ? old.filter(n => n !== i) : [...old, i])}>{selected.includes(i) ? letter : i + 1}</button>)}</div><output>{[...'ВАННА'].map((letter, i) => selected.includes(i) ? letter : '·').join(' ')}</output></>}
    {mission.type === 'cipher' && <><p>Поверните шифровальный диск. Нужен один шаг назад.</p><div className="diana-row"><button aria-label="Сдвинуть назад" onClick={() => setShift(s => (s + 32) % 33)}>−1 буква</button><button aria-label="Сдвинуть вперёд" onClick={() => setShift(s => (s + 1) % 33)}>+1 буква</button></div><output>{decodeDiana(shift)}</output></>}
    {mission.type === 'witness' && <div className="diana-row">{['А', 'Б'].map(label => <button key={label} onClick={() => choose(label, 'Б')}>Верим {label}</button>)}</div>}
    {mission.type === 'route' && <div className="diana-row">{['А · Вниз', 'Б · Вверх', 'В · Наружу'].map(label => <button key={label} onClick={() => choose(label, 'Б · Вверх')}>{label}</button>)}</div>}
    {mission.type === 'royal' && <><p>Кому принадлежит тайник?</p><div className="diana-row">{['Диане', 'Алхимику', 'Свидетелю А'].map(label => <button key={label} onClick={() => choose(label, 'Диане')}>{label}</button>)}</div></>}
    {mission.type === 'music' && <><p>Наберите последовательность на клавишах. Звук необязателен.</p><div className="diana-keys">{['ДО', 'РЕ', 'МИ', 'ФА', 'СОЛЬ', 'ЛЯ', 'СИ'].map((note, i) => <button key={note} onClick={() => playNote(i)}>{note}<small>{i + 1}</small></button>)}</div><output aria-live="polite">{notes.padEnd(5, '·')}</output><div className="diana-row"><button onClick={() => { setNotes(''); setMessage(''); }}>Очистить</button><button onClick={() => { if (notes === MUSIC_CODE) { saveMusic(); setMessage('Музыкальный код сохранён в блокноте!'); } else setMessage('Сверьте порядок нот: ФА — ДО — СОЛЬ — МИ — ЛЯ.'); }}>Записать код</button></div>{music && <p>✓ Код уже в блокноте</p>}</>}
    {mission.type === 'plant' && <><p>Кто подходит под все пять признаков?</p><div className="diana-row">{['Кошка', 'Цветок', 'Лампа'].map(label => <button key={label} onClick={() => choose(label, 'Цветок')}>{label}</button>)}</div></>}
    {mission.type === 'mirror' && <><button aria-pressed={mirror} onClick={() => setMirror(!mirror)}>{mirror ? 'Спрятать расшифровку' : 'Повернуть послание'}</button>{mirror && <output>ИЩИ ПОД СТУЛОМ В СТОЛОВОЙ</output>}</>}
    <p role="status">{message}</p>
  </div>;
}

function CodeForm({ stage, onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);
  return <form className="diana-code" onSubmit={event => {
    event.preventDefault();
    if (acceptsDianaCode(stage, value)) onUnlock();
    else { setError('Код не подходит к этой улике. Проверьте карточку и попробуйте ещё раз.'); input.current?.focus(); }
  }}>
    <label htmlFor="diana-code">{stage === 8 ? 'Пять цифр музыкального кода' : 'Четыре цифры с найденной карточки'}</label>
    <div className="diana-code-row"><input ref={input} id="diana-code" value={value} onChange={event => { setValue(event.target.value); setError(''); }} inputMode="numeric" autoComplete="off" maxLength={stage === 8 ? 5 : 4} placeholder={stage === 8 ? '·····' : '····'} aria-invalid={!!error} aria-describedby="diana-code-error" /><button className="diana-primary" type="submit">{stage === 8 ? 'Открыть подарок' : 'Открыть следующую улику'} →</button></div>
    <p id="diana-code-error" role="alert">{error}</p>
  </form>;
}

export default function DianaHunt() {
  const [state, setState] = useState(INITIAL_DIANA_STATE);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState(false);
  const [now, setNow] = useState(null);
  const panel = useRef(null);
  useEffect(() => {
    try { setState(restoreDiana(JSON.parse(localStorage.getItem(DIANA_STORAGE_KEY)))); } catch { setWarning(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(DIANA_STORAGE_KEY, JSON.stringify(state)); setWarning(false); } catch { setWarning(true); }
  }, [ready, state]);
  useEffect(() => {
    setNow(Date.now());
    if (state.stage < 0 || state.stage === 9) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.stage]);
  useEffect(() => { if (ready) panel.current?.focus(); }, [ready, state.stage]);
  const mission = DIANA_MISSIONS[state.stage];
  const found = Math.max(0, Math.min(8, state.stage));
  const seconds = state.startedAt && now ? Math.max(0, Math.floor(((state.finishedAt || now) - state.startedAt) / 1000)) : 0;
  const remaining = Math.max(0, 45 * 60 - seconds);
  return <div className="diana-world" lang="ru"><main className="diana-main">
    <header className="diana-header"><a href="/">← Другой квест</a><span>ДИАНА / ДЕЛО 009</span><button disabled={!ready} onClick={() => { if (window.confirm('Начать расследование заново? Все найденные улики будут сброшены.')) setState({ ...INITIAL_DIANA_STATE }); }}>↺ Заново</button></header>
    {warning && <p className="diana-warning" role="status">Не удалось сохранить игру. Оставьте эту страницу открытой до конца расследования.</p>}
    {ready && state.stage >= 0 && <div className="diana-dashboard"><div><span className="diana-label">Собрано улик</span><strong>{found} / 8</strong><progress value={found} max={8} aria-label="Собрано улик" /></div><div><span className="diana-label">{state.stage === 9 ? 'Время расследования' : 'До 45 минут'}</span><strong role="timer">{Math.floor((state.stage === 9 ? seconds : remaining) / 60).toString().padStart(2, '0')}:{((state.stage === 9 ? seconds : remaining) % 60).toString().padStart(2, '0')}</strong>{remaining === 0 && state.stage !== 9 && <small>Время вышло — продолжайте, подарок ждёт!</small>}</div></div>}
    <section className="diana-file" ref={panel} tabIndex={-1} key={ready ? state.stage : 'loading'}>
      {!ready ? <p role="status">Открываем дело…</p> : state.stage === -1 ? <>
        <span className="diana-stamp">Совершенно секретно</span><p className="diana-label">День рождения Дианы · 9–13 лет · одна команда</p>
        <h1>Дело об исчезнувшем подарке<span>№ 009</span></h1><p className="diana-intro">Сегодня в 07:43 неизвестный похитил праздничный подарок. Восемь улик. Тайные шифры. Один шанс стать настоящими детективами.</p>
        <blockquote>«Хотите вернуть пропажу? Докажите, что достойны называться детективами. Но будьте осторожны: не каждой подсказке можно доверять».<cite>— Неизвестный</cite></blockquote>
        <p>Замечайте детали. Проверяйте показания. Работайте вместе. Разгадайте место, найдите там карточку и введите её код, чтобы открыть следующую задачу.</p><p>На дело отведено 45 минут, но расследование можно продолжить и после сигнала.</p>
        <button className="diana-primary" onClick={() => setState({ ...INITIAL_DIANA_STATE, stage: 0, startedAt: Date.now() })}>Принять дело →</button>
      </> : state.stage === 9 ? <>
        <span className="diana-stamp">Дело закрыто</span><div className="diana-celebrate" aria-hidden="true">✦ 🎁 ✦</div><h1>Дело раскрыто!</h1><p className="diana-intro">С днём рождения, Диана!</p><p>Все восемь улик найдены, шифры разгаданы, подарок спасён. Вы — настоящая команда детективов!</p><blockquote>Громко объявите: «ДЕЛО РАСКРЫТО!»<br />Покажите этот экран взрослому — хранителю подарка — и получите награду.</blockquote>
      </> : state.stage === 8 ? <>
        <p className="diana-label">Финальный конверт / 009</p><h1>Последний замок</h1><p className="diana-intro">Все улики у вас. Осталась одна маленькая деталь…</p><p>Помните музыкальный код из шестого испытания? Введите пять цифр, чтобы вернуть подарок.</p><details><summary>Вспомнить музыкальную улику</summary><p>ФА — ДО — СОЛЬ — МИ — ЛЯ. ДО = 1, РЕ = 2, МИ = 3, ФА = 4, СОЛЬ = 5, ЛЯ = 6, СИ = 7.</p></details><CodeForm stage={8} onUnlock={() => setState(old => ({ ...old, stage: 9, finishedAt: Date.now() }))} />
      </> : <>
        <p className="diana-label">Улика {state.stage + 1} / 08 <span aria-hidden="true">{mission.icon}</span></p><h1>{mission.title}</h1><p className="diana-clue">{mission.text}</p>
        <Puzzle mission={mission} music={state.music} saveMusic={() => setState(old => ({ ...old, music: MUSIC_CODE }))} />
        <details><summary>Нужна подсказка?</summary><p>{mission.hint}</p></details>
        {state.stage === 3 && <p className="diana-safety">Карточка внизу у лестницы. Подниматься на чердак не нужно.</p>}
        <CodeForm stage={state.stage} onUnlock={() => setState(old => ({ ...old, stage: old.stage + 1 }))} />
      </>}
    </section>
    {ready && state.stage >= 0 && <details className="diana-notebook"><summary>✎ Блокнот детективов · {found} улик</summary>{!found && <p>Здесь появятся найденные улики.</p>}<ol>{DIANA_MISSIONS.slice(0, found).map(item => <li key={item.code}><strong>{item.title}</strong><span>{item.place}</span></li>)}</ol>{state.music && <p>♫ Музыкальный код: <strong>{state.music}</strong></p>}</details>}
    <footer className="diana-footer">Бюро праздничных расследований · Для Дианы с любовью</footer>
  </main></div>;
}
