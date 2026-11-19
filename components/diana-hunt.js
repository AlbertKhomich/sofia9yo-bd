"use client";

import { useEffect, useRef, useState } from "react";

import {
  DIANA_MISSIONS,
  DIANA_STORAGE_KEY,
  INITIAL_DIANA_STATE,
  MUSIC_CODE,
  acceptsDianaCode,
  restoreDiana,
  ALPHABET,
  DIANA_CIPHER,
  DIANA_MIRROR,
  shiftDianaLetter,
} from "../lib/diana";

function Puzzle({ mission, music, saveMusic }) {
  const [letters, setLetters] = useState(() =>
    [...DIANA_CIPHER].map(
      () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    ),
  );

  const [selected, setSelected] = useState([]);

  const [message, setMessage] = useState("");

  const [notes, setNotes] = useState("");

  function playNote(i) {
    setNotes((value) => (value.length < 5 ? value + (i + 1) : value));

    // Der Ton ist optional: Die Tasten funktionieren auch ohne Audio.

    try {
      const Audio = window.AudioContext || window.webkitAudioContext;

      if (!Audio) return;

      const audio = new Audio();

      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.frequency.value = [
        261.63, 293.66, 329.63, 349.23, 392, 440, 493.88,
      ][i];

      gain.gain.setValueAtTime(0.12, audio.currentTime);

      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3);

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.onended = () => {
        audio.close().catch(() => {});
      };

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.3);

      audio.resume().catch(() => {});
    } catch {
      /* Auch ohne Ton funktioniert das Rätsel. */
    }
  }

  if (!["cipher", "music", "mirror"].includes(mission.type)) return null;

  return (
    <div className="diana-lab">
      <p className="diana-label">Spurenlabor</p>

      {mission.type === "cipher" && (
        <>
          <p>
            Entschlüsselt die Nachricht oben! Auf den Buchstabenrädern könnt ihr
            jeden Buchstaben einzeln verändern. Geht im Alphabet jeweils einen
            Schritt zurück.
          </p>
          <p className="diana-alphabet">{ALPHABET}</p>
          <div className="diana-letter-grid">
            {letters.map((letter, i) => (
              <div className="diana-letter" key={i}>
                <button
                  aria-label={`Buchstabe ${i + 1}: zurück`}
                  onClick={() =>
                    setLetters((old) =>
                      old.map((value, index) =>
                        index === i ? shiftDianaLetter(value, -1) : value,
                      ),
                    )
                  }
                >
                  −
                </button>
                <output aria-label={`Buchstabe ${i + 1}`}>{letter}</output>
                <button
                  aria-label={`Buchstabe ${i + 1}: vorwärts`}
                  onClick={() =>
                    setLetters((old) =>
                      old.map((value, index) =>
                        index === i ? shiftDianaLetter(value, 1) : value,
                      ),
                    )
                  }
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {mission.type === "music" && (
        <>
          <p>
            Tippt die richtige Notenfolge auf den Tasten ein. Der Ton ist
            optional.
          </p>
          <div className="diana-keys">
            {["DO", "RE", "MI", "FA", "SOL", "LA", "SI"].map((note, i) => (
              <button key={note} onClick={() => playNote(i)}>
                {note}
                <small>{i + 1}</small>
              </button>
            ))}
          </div>
          <output aria-live="polite">{notes.padEnd(5, "·")}</output>
          <div className="diana-row">
            <button
              onClick={() => {
                setNotes("");
                setMessage("");
              }}
            >
              Löschen
            </button>
            <button
              onClick={() => {
                if (notes === MUSIC_CODE) {
                  saveMusic();
                  setMessage("Der Musikcode wurde im Notizbuch gespeichert!");
                } else
                  setMessage("Prüft die Reihenfolge: FA – DO – SOL – MI – LA.");
              }}
            >
              Code notieren
            </button>
          </div>
          {music && <p>✓ Der Code steht bereits im Notizbuch</p>}
        </>
      )}

      {mission.type === "mirror" && (
        <>
          <p>
            Setzt die Nachricht zusammen: Wählt die Zeichen in der richtigen
            Reihenfolge. Das Symbol ␣ steht für ein Leerzeichen.
          </p>
          <div className="diana-row">
            {[...DIANA_MIRROR].map((letter, i) => (
              <button
                key={i}
                disabled={selected.includes(i)}
                aria-label={`${letter === " " ? "Leerzeichen" : letter}, Position ${i + 1}`}
                onClick={() => setSelected((old) => [...old, i])}
              >
                {letter === " " ? "␣" : letter}
              </button>
            ))}
          </div>
          <output className="diana-assembled" aria-live="polite">
            {selected.length
              ? selected.map((i) => DIANA_MIRROR[i]).join("")
              : "…"}
          </output>
          <div className="diana-row">
            <button
              disabled={!selected.length}
              onClick={() => setSelected((old) => old.slice(0, -1))}
            >
              Letztes Zeichen entfernen
            </button>
            <button disabled={!selected.length} onClick={() => setSelected([])}>
              Neu beginnen
            </button>
          </div>
        </>
      )}

      <p role="status">{message}</p>
    </div>
  );
}

function CodeForm({ stage, music = "", onUnlock }) {
  const [value, setValue] = useState("");

  const [error, setError] = useState("");

  const input = useRef(null);

  return (
    <form
      className="diana-code"
      onSubmit={(event) => {
        event.preventDefault();

        if (acceptsDianaCode(stage, value, music)) onUnlock();
        else {
          setError(
            "Dieser Code passt nicht zum Hinweis. Prüft eure Karte und versucht es noch einmal.",
          );
          input.current?.focus();
        }
      }}
    >
      {stage === 5 && music !== MUSIC_CODE && (
        <p role="status">
          Löst zuerst das Musikrätsel und schreibt den richtigen Code in euer
          Notizbuch.
        </p>
      )}

      <label htmlFor="diana-code">
        {stage === 8
          ? "Fünf Ziffern des Musikcodes"
          : "Vier Ziffern von der gefundenen Karte"}
      </label>

      <div className="diana-code-row">
        <input
          ref={input}
          id="diana-code"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          inputMode="numeric"
          autoComplete="off"
          maxLength={stage === 8 ? 5 : 4}
          placeholder={stage === 8 ? "·····" : "····"}
          aria-invalid={!!error}
          aria-describedby="diana-code-error"
        />
        <button
          className="diana-primary"
          type="submit"
          disabled={stage === 5 && music !== MUSIC_CODE}
        >
          {stage === 8 ? "Geschenk öffnen" : "Nächsten Hinweis öffnen"} →
        </button>
      </div>

      <p id="diana-code-error" role="alert">
        {error}
      </p>
    </form>
  );
}

export default function DianaHunt() {
  const [state, setState] = useState(INITIAL_DIANA_STATE);

  const [ready, setReady] = useState(false);

  const [warning, setWarning] = useState(false);

  const [now, setNow] = useState(null);

  const panel = useRef(null);

  useEffect(() => {
    try {
      setState(
        restoreDiana(JSON.parse(localStorage.getItem(DIANA_STORAGE_KEY))),
      );
    } catch {
      setWarning(true);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(DIANA_STORAGE_KEY, JSON.stringify(state));
      setWarning(false);
    } catch {
      setWarning(true);
    }
  }, [ready, state]);

  useEffect(() => {
    setNow(Date.now());

    if (state.stage < 0 || state.stage === 9) return;

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [state.stage]);

  useEffect(() => {
    if (ready) panel.current?.focus();
  }, [ready, state.stage]);

  const mission = DIANA_MISSIONS[state.stage];

  const found = Math.max(0, Math.min(8, state.stage));

  const seconds =
    state.startedAt && now
      ? Math.max(
          0,
          Math.floor(((state.finishedAt || now) - state.startedAt) / 1000),
        )
      : 0;

  const remaining = Math.max(0, 45 * 60 - seconds);

  return (
    <div className="diana-world" lang="de">
      <main className="diana-main">
        <header className="diana-header">
          <a href="/">← Andere Schatzsuche</a>
          <span>DIANA / FALL 009</span>
          <button
            disabled={!ready}
            onClick={() => {
              if (
                window.confirm(
                  "Die Ermittlung neu starten? Alle gefundenen Hinweise werden zurückgesetzt.",
                )
              )
                setState({ ...INITIAL_DIANA_STATE });
            }}
          >
            ↺ Neustart
          </button>
        </header>

        {warning && (
          <p className="diana-warning" role="status">
            Das Spiel konnte nicht gespeichert werden. Lasst diese Seite bis zum
            Ende der Ermittlung geöffnet.
          </p>
        )}

        {ready && state.stage >= 0 && (
          <div className="diana-dashboard">
            <div>
              <span className="diana-label">Gefundene Hinweise</span>
              <strong>{found} / 8</strong>
              <progress value={found} max={8} aria-label="Gefundene Hinweise" />
            </div>
            <div>
              <span className="diana-label">
                {state.stage === 9 ? "Ermittlungszeit" : "Verbleibende Zeit"}
              </span>
              <strong role="timer">
                {Math.floor((state.stage === 9 ? seconds : remaining) / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {((state.stage === 9 ? seconds : remaining) % 60)
                  .toString()
                  .padStart(2, "0")}
              </strong>
              {remaining === 0 && state.stage !== 9 && (
                <small>
                  Die Zeit ist um – macht weiter, das Geschenk wartet!
                </small>
              )}
            </div>
          </div>
        )}

        <section
          className="diana-file"
          ref={panel}
          tabIndex={-1}
          key={ready ? state.stage : "loading"}
        >
          {!ready ? (
            <p role="status">Fallakte wird geöffnet …</p>
          ) : state.stage === -1 ? (
            <>
              <span className="diana-stamp">Streng geheim</span>
              <p className="diana-label">
                Dianas Geburtstag · 9–13 Jahre · ein Team
              </p>

              <h1>
                Der Fall des verschwundenen Geschenks<span>№ 009</span>
              </h1>
              <p className="diana-intro">
                Heute um 07:43 Uhr hat eine unbekannte Person das
                Geburtstagsgeschenk gestohlen. Acht Hinweise. Geheime Codes.
                Eure Chance, echte Detektive zu werden.
              </p>

              <blockquote>
                „Ihr wollt das Geschenk zurück? Dann beweist, dass ihr echte
                Detektive seid. Aber seid vorsichtig: Nicht jedem Hinweis könnt
                ihr trauen.“<cite>— Unbekannt</cite>
              </blockquote>

              <p>
                Achtet auf Details. Überprüft die Aussagen. Arbeitet zusammen.
                Findet den gesuchten Ort, entdeckt dort die Karte und gebt ihren
                Code ein, um das nächste Rätsel zu öffnen.
              </p>
              <p>
                Für den Fall habt ihr 45 Minuten Zeit. Aber auch danach dürft
                ihr weiterermitteln.
              </p>

              <button
                className="diana-primary"
                onClick={() =>
                  setState({
                    ...INITIAL_DIANA_STATE,
                    stage: 0,
                    startedAt: Date.now(),
                  })
                }
              >
                Fall übernehmen →
              </button>
            </>
          ) : state.stage === 9 ? (
            <>
              <span className="diana-stamp">Fall abgeschlossen</span>
              <div className="diana-celebrate" aria-hidden="true">
                ✦ 🎁 ✦
              </div>
              <h1>Fall gelöst!</h1>
              <p className="diana-intro">Alles Gute zum Geburtstag, Diana!</p>
              <p>
                Alle acht Hinweise sind gefunden, alle Codes geknackt und das
                Geschenk ist gerettet. Ihr seid ein echtes Detektivteam!
              </p>
              <blockquote>
                Ruft laut: „FALL GELÖST!“
                <br />
                Zeigt diesen Bildschirm einem Erwachsenen, der das Geschenk
                aufbewahrt, und holt euch eure Belohnung.
              </blockquote>
            </>
          ) : state.stage === 8 ? (
            <>
              <p className="diana-label">Letzter Umschlag / 009</p>
              <h1>Das letzte Schloss</h1>
              <p className="diana-intro">
                Ihr habt alle Hinweise. Nur eine Kleinigkeit fehlt noch …
              </p>
              <p>
                Erinnert ihr euch an den Musikcode aus der sechsten Aufgabe?
                Gebt die fünf Ziffern ein, um das Geschenk zurückzubekommen.
              </p>
              <CodeForm
                stage={8}
                onUnlock={() =>
                  setState((old) => ({
                    ...old,
                    stage: 9,
                    finishedAt: Date.now(),
                  }))
                }
              />
            </>
          ) : (
            <>
              <p className="diana-label">Hinweis {state.stage + 1} / 08</p>
              <h1>{mission.title}</h1>
              <p className="diana-clue">{mission.text}</p>

              <Puzzle
                mission={mission}
                music={state.music}
                saveMusic={() =>
                  setState((old) => ({ ...old, music: MUSIC_CODE }))
                }
              />

              <CodeForm
                stage={state.stage}
                music={state.music}
                onUnlock={() =>
                  setState((old) =>
                    old.stage === 5 && old.music !== MUSIC_CODE
                      ? old
                      : { ...old, stage: old.stage + 1 },
                  )
                }
              />
            </>
          )}
        </section>

        {ready && state.stage >= 0 && (
          <details className="diana-notebook">
            <summary>✎ Detektivnotizbuch · {found} Hinweise</summary>
            {!found && <p>Hier erscheinen eure gefundenen Hinweise.</p>}
            <ol>
              {DIANA_MISSIONS.slice(0, found).map((item) => (
                <li key={item.code}>
                  <strong>{item.title}</strong>
                  <span>{item.place}</span>
                </li>
              ))}
            </ol>
            {state.music && (
              <p>
                ♫ Musikcode: <strong>{state.music}</strong>
              </p>
            )}
          </details>
        )}

        <footer className="diana-footer">
          Büro für Geburtstagsgeheimnisse · Für Diana, mit Liebe
        </footer>
      </main>
    </div>
  );
}
