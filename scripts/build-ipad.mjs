import { writeFileSync } from 'node:fs';
import { INITIAL_STATE, restoreState, matchesCode } from '../lib/game.js';
import { startIpadGame } from '../lib/ipad-game.js';

// Generate before Next's compiler can rename symbols used by serialized functions.
const script = `(function () {\nvar INITIAL_STATE=${JSON.stringify(INITIAL_STATE)};\n(${startIpadGame.toString()})(JSON.parse(document.getElementById('ipad-data').textContent),${restoreState.toString()},${matchesCode.toString()});\n}());\n`;
writeFileSync(new URL('../public/ipad-game.js', import.meta.url), script);
