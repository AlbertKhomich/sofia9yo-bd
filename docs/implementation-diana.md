# Diana’s birthday game — implementation

Implemented a separate Russian-language detective quest based on `docs/scenario-diana.md`.

## Pages

- `/diana`: **Дело № 009 — Дело об исчезнувшем подарке**.
- `/diana/codes`: eight printable organizer cards and setup instructions (browser Print / Ctrl+P / ⌘P).
- Sofia’s page links to Diana’s game in its footer. Diana’s header links back.

## Game flow

Start the investigation, read a puzzle, work out the physical location, find its card, and enter its four-digit code. Only the current card advances the investigation. Wrong codes leave progress intact. Physical card codes gate progression. At task 6, the team must also solve and save the correct musical sequence before its card can unlock task 7.

| Puzzle | Hide card at | Card code | Opens |
| --- | --- | --- | --- |
| 1. Дождь без облаков | Bathroom, beside toothbrushes | 2741 | Alchemist puzzle |
| 2. Загадка алхимика | Beside coffee machine | 6832 | Witness puzzle |
| 3. Ложный след | Between sofa cushions | 9514 | Route puzzle |
| 4. Три маршрута | Beside bottom attic stair | 3268 | Royal puzzle |
| 5. Королевская тайна | Under Diana’s bed | 8073 | Musical puzzle |
| 6. Музыкальный код | Beside piano sheet music | 5629 | Plant puzzle |
| 7. Живой свидетель | Attached behind plant pot | 1496 | Reversed message |
| 8. Последнее послание | Envelope under a dining chair | 7305 | Final musical lock |

The final lock accepts **41536** (ФА — ДО — СОЛЬ — МИ — ЛЯ). It shows a birthday celebration and asks the children to announce «ДЕЛО РАСКРЫТО!» and collect the gift from an adult. A real five-digit lock can use the same code.

## Interactive features

- Task 1 presents only the acrostic riddle; there are no numbered answer-reveal buttons.
- Task 2 has a separate pair of alphabet controls for every encrypted letter, including Ё. The controls start seven alphabet positions ahead of the printed cipher (eight steps from each solution letter), so players must set each answer letter individually. The coffee-related introduction is removed; only the cipher and its rule remain. There is no whole-word decoder.
- Tasks 3, 4, 5, and 7 present their riddles without multiple-choice buttons. Task 4 uses the neutral title «Три маршрута».
- Task 6 has seven numbered piano keys with optional synthesized sound. The correct five-note sequence must be saved to the notebook before the physical card code can advance the game. This requirement survives reloads.
- Task 8 requires selecting individual characters from the reversed message to assemble the decoded sentence. Each character can be used once; undo and reset allow corrections. There is no one-click reveal.
- All expandable hints, the final musical reminder, and the explicit stair-location hint have been removed from the game. Organizer placement instructions remain on the print page.
- Destination-themed icons are omitted from the puzzle headings to avoid extra visual hints.
- Track eight collected clues in a persistent detective notebook.
- A 45-minute countdown creates atmosphere without blocking play when time runs out. It uses elapsed wall-clock time, including time away from the page. Completion freezes the elapsed investigation time.
- Responsive case-file styling, keyboard-accessible controls, numeric code input, focus on each new stage, and reduced-motion support.

## Persistence and scope

Diana uses `diana-case-009-v1` in localStorage, independently of Sofia. Stage, start/finish timestamps, and the saved musical code survive reloads. Temporary widget selections reset on reload. Invalid saves return to the introduction. If storage is unavailable, a notice asks players to keep the page open. Restart requires confirmation and resets only Diana’s game.

This is a local, client-side party game, not a secure lock: codes exist in the client bundle and the organizer page is not password-protected. There is no cross-device sync or offline mode. `/ipad` remains Sofia’s existing compatibility version; Diana uses the main Next.js runtime.

The optional secret-letter bonus was omitted: «ПОБЕДИЛИ» has seven letters, although the source suggests eight letter cards. The notebook provides the collection mechanic without adding an inconsistent puzzle.

## Before the party

1. Open `/diana/codes`, print and cut out all eight cards, and hide them according to the table.
2. Keep every card reachable: no attic climb, coffee-machine operation, piano-lid lifting, or digging in soil is needed.
3. Prepare the gift with an adult keeper or a five-digit lock set to 41536.
4. Walk through the game on the intended tablet, including sound, reload/resume, and printing. Then choose **Заново**.

## Files and validation

- `lib/diana.js`: scenario data, card codes, save validation, final code, cipher alphabet.
- `components/diana-hunt.js`: interactive game, timer, notebook, storage, and optional audio.
- `app/diana/page.js`, `app/diana/diana.css`: route, metadata, scoped visual styling.
- `app/diana/codes/page.js`: printable cards using the existing print stylesheet.
- `tests/diana.test.js`: progression gates, wrong/out-of-order codes, final lock, save isolation/validation, the mandatory musical gate (including after restoring a save), and individual cipher-letter wrapping.

Validation completed:

- `npm test`: all **9 tests passed**, including existing Sofia and iPad regression tests.
- `npm run build` with installed **Node 22.23.3**: passed; `/diana` and `/diana/codes` generated successfully.
- The default shell selected Node 18, so the build was run with the installed Node 22 binary on PATH. No dependency changes were needed.
- Visual/browser interaction checks could not run because the browser access host was unavailable. Tablet rendering, audio, and physical printed output still need a manual check.
