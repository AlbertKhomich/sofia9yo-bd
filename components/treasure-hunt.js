'use client';

import { useEffect, useRef, useState } from 'react';
import { MISSIONS, MEMORY_WORDS } from '../lib/missions';
import { INITIAL_STATE, STORAGE_KEY, matchesCode, restoreState } from '../lib/game';

function Button({ children, ...props }) {
  return <button className="primary" type="button" {...props}>{children}</button>;
}

function Stars({ count }) {
  return <><div className="stars" aria-label={`${count} von 8 Sternen`}>
    {Array.from({ length: 8 }, (_, i) => <span key={i} aria-hidden="true" className={`star ${i < count ? 'on' : ''}`}>⭐</span>)}
  </div><div className="secondary">{count} von 8 Sternen gesammelt</div></>;
}

function Confirmation({ labels, onDone }) {
  const [checked, setChecked] = useState([]);
  return <>{labels.map((label, i) => <label className="check" key={label}>
    <input type="checkbox" checked={!!checked[i]} onChange={event => setChecked(previous => {
      const next = [...previous]; next[i] = event.target.checked; return next;
    })} />{label}
  </label>)}<Button disabled={!labels.every((_, i) => checked[i])} onClick={onDone}>Stern einsammeln ⭐</Button></>;
}

function TimedChallenge({ memory, onDone }) {
  const duration = memory ? 15 : 10;
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(duration);
  useEffect(() => {
    if (deadline === null) return;
    // Wall-clock time stays accurate if the tablet backgrounds or throttles the tab.
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 200);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [deadline]);
  function start() { setRemaining(duration); setDeadline(Date.now() + duration * 1000); }
  if (deadline === null) return <Button onClick={start}>{memory ? '15-Sekunden-Test starten ⏱️' : '10-Sekunden-Pose starten 📸'}</Button>;
  if (remaining > 0) return <>
    <div className="timer" role="timer" aria-label={`${remaining} Sekunden`}>{remaining}</div>
    {memory ? <><div className="wordgrid">{MEMORY_WORDS.map(word => <span className="word" key={word}>{word}</span>)}</div><p className="secondary">Merkt euch die Wörter gut!</p></> : <p className="lead">Alle vor den Spiegel! Macht eure verrückteste Pose! 🤪</p>}
  </>;
  return <div aria-live="polite">
    <div className="emoji">{memory ? '🙈' : '📸'}</div><h2>{memory ? 'Wörter versteckt!' : 'Was für eine Pose!'}</h2>
    {memory ? <><p className="lead">Nennt gemeinsam mindestens fünf Wörter aus dem Gedächtnis.</p>
      <Confirmation labels={['Wir haben mindestens fünf richtig genannt!']} onDone={onDone} />
      <button className="alt retry" onClick={start}>Noch einmal versuchen</button>
    </> : <Button onClick={onDone}>Letzten Stern einsammeln! 🏆</Button>}
  </div>;
}

function AnswerForm({ code, onSubmit }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);
  function submit(event) {
    event.preventDefault();
    if (onSubmit(value)) return;
    setError(code ? 'Das war noch nicht der richtige Code. Sucht weiter! 🔍' : 'Fast! Denkt an Heu, Gemüse und ein kleines flauschiges Tier. 🐾');
    input.current.focus(); input.current.select();
  }
  return <form onSubmit={submit}>
    <input ref={input} className="input" value={value} onChange={event => { setValue(event.target.value); setError(''); }}
      maxLength={code ? 16 : 80} autoComplete="off" autoCapitalize={code ? 'characters' : 'none'} spellCheck={false}
      placeholder={code ? 'GEHEIMCODE' : 'EURE ANTWORT'} aria-label={code ? 'Geheimcode' : 'Rätselantwort'} aria-invalid={!!error} aria-describedby="answer-error" />
    <p id="answer-error" className="error" role="alert">{error}</p>
    <button className="primary" type="submit">{code ? 'Code prüfen 🔓' : 'Antwort prüfen'}</button>
  </form>;
}

export default function TreasureHunt() {
  const [state, setState] = useState(INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const panel = useRef(null);
  useEffect(() => {
    try { setState(restoreState(JSON.parse(localStorage.getItem(STORAGE_KEY)))); }
    catch { /* A damaged or unavailable save should never block the game. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
  }, [ready, state]);
  useEffect(() => {
    if (ready) panel.current?.focus({ preventScroll: true });
  }, [ready, state.stage, state.phase]);
  const { stage, phase, stars } = state;
  const mission = MISSIONS[stage];
  function go(nextStage, nextPhase, nextStars = stars) { setState({ stage: nextStage, phase: nextPhase, stars: nextStars }); }
  function done() { go(stage, stage === 7 ? 'won' : 'clue', stage + 1); }
  function reset() {
    if (window.confirm('Möchtet ihr wirklich alle Sterne löschen und neu anfangen?')) setState({ ...INITIAL_STATE });
  }
  let content;
  if (!ready) content = <><p className="lead" role="status">Euer Abenteuer wird geladen …</p><p><a href="/ipad">Lädt nicht? Hier auf einem älteren iPad spielen →</a></p></>;
  else if (phase === 'start') content = <>
    <div className="emoji">🗝️🌟</div><div className="eyebrow">Das Geburtstagsabenteuer beginnt</div>
    <h1>Die geheime Geburtstagsschatzsuche</h1><p className="lead">Sieben geheimnisvolle Orte. Acht magische Sterne. Ein versteckter Schatz!</p>
    <div className="note">Spielt gemeinsam auf einem Tablet. Findet an jedem Ort eine Codekarte, gebt den Code ein und löst die Aufgabe. Nach der letzten Mission wartet eine Überraschung in der echten Welt!</div>
    <Button onClick={() => go(0, 'challenge')}>Abenteuer starten ✨</Button>
  </>;
  else if (phase === 'won') content = <>
    <div className="confetti">🎊✨🎉✨🎊</div><h1>Ihr habt es geschafft!</h1><Stars count={stars} />
    <div className="emoji">🎁🏆🎁</div><p className="lead">Alle Missionen bestanden! Ihr seid echte Schatzsucherinnen!</p>
    <div className="note"><strong>🎉 Der Schatz gehört euch! 🎉</strong><br />Sucht jetzt eure Geburtstagstüten!</div>
    <p className="secondary">Herzlichen Glückwunsch und viel Spaß beim Feiern!</p>
  </>;
  else if (phase === 'code') content = <>
    <div className="eyebrow">Geheime Fundstelle {stage} von 7</div><div className="emoji">🔐</div><h2>Geheimcode gefunden?</h2>
    <Stars count={stars} /><p className="lead">Sucht die Codekarte am richtigen Ort und gebt den Code ein.</p>
    <button className="alt" type="button" onClick={() => go(stage - 1, stage === 1 ? 'challenge' : 'clue')}>↩ Hinweis noch einmal lesen</button>
    <AnswerForm code onSubmit={value => {
      if (!matchesCode(value, MISSIONS[stage - 1].code)) return false;
      go(stage, 'challenge', stage); return true;
    }} />
    <p className="secondary">Tipp: Die Karte liegt {stage === 5 ? 'unter einem Teller' : stage === 6 ? 'am Meerschweinchenkäfig' : 'am zuvor gesuchten Ort'}.</p>
  </>;
  else if (phase === 'clue') content = <>
    <div className="emoji">🌟</div><h2>Stern verdient!</h2><Stars count={stars} />
    <div className="note"><strong>Der nächste Hinweis:</strong><p className="lead">{mission.clue}</p></div>
    <Button onClick={() => go(stage + 1, 'code')}>Code suchen 🔎</Button>
  </>;
  else content = <>
    <div className="eyebrow">{stage === 7 ? 'Das große Finale' : `Mission ${stage + 1} von 7`}</div>
    <div className="emoji">{mission.emoji}</div><h2>{mission.title}</h2><Stars count={stars} />
    <p className="lead">{mission.intro}</p><div className="note"><strong>🎯 Eure Aufgabe</strong><p className="lead">{mission.task}</p></div>
    {mission.type === 'code' && <Button onClick={() => go(1, 'code')}>Auf zum Gefrierschrank! ❄️</Button>}
    {(mission.type === 'memory' || mission.type === 'final') && <TimedChallenge memory={mission.type === 'memory'} onDone={done} />}
    {mission.type === 'check' && <Confirmation labels={['Etwas Grünes 🌿', 'Etwas, das sich bewegt 🦋', 'Etwas, das weiter als 10 Meter entfernt ist 🔭']} onDone={done} />}
    {mission.type === 'confirm' && <Confirmation labels={['Wir haben die Aufgabe gemeinsam geschafft!']} onDone={done} />}
    {mission.type === 'riddle' && <AnswerForm onSubmit={value => {
      if (!value.toLowerCase().replace(/[^a-zäöüß]/g, '').includes('meerschweinchen')) return false;
      done(); return true;
    }} />}
  </>;
  return <main><header className="top"><div className="brand">✨ SOFIA · GEBURTSTAGSABENTEUER</div>
    <button className="reset" onClick={reset} disabled={!ready}>↻ Neustart</button></header>
    {storageWarning && <p className="note" role="status">Euer Browser kann den Spielstand gerade nicht speichern. Lasst diese Seite während des Spiels geöffnet.</p>}
    <section className="panel" ref={panel} tabIndex={-1} key={`${stage}-${phase}-${ready}`}>{content}</section>
    <footer className="foot">Eine magische Schatzsuche für echte Entdeckerinnen 💜</footer>
  </main>;
}
