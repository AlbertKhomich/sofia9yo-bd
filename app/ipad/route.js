import { MISSIONS, MEMORY_WORDS } from '../../lib/missions';
import { INITIAL_STATE, STORAGE_KEY } from '../../lib/game';

export const dynamic = 'force-static';

export function GET() {
  const data = JSON.stringify({ missions: MISSIONS, words: MEMORY_WORDS, initial: INITIAL_STATE, key: STORAGE_KEY })
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  // A raw HTML response deliberately avoids React hydration and all Next.js client chunks.
  return new Response(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Sofias Geburtstagsschatzsuche</title><link rel="stylesheet" href="/ipad.css"></head><body><main><header><strong>✨ SOFIA · GEBURTSTAGSABENTEUER</strong><button id="reset">↻ Neustart</button></header><p id="save-warning" hidden>Der Spielstand kann nicht gespeichert werden. Lasst diese Seite während des Spiels geöffnet.</p><section id="ipad-game" tabindex="-1"><h1>Die geheime Geburtstagsschatzsuche</h1><noscript>Bitte aktiviert JavaScript, um das Abenteuer zu spielen.</noscript></section><footer>Eine magische Schatzsuche für echte Entdeckerinnen 💜</footer></main><script type="application/json" id="ipad-data">${data}</script><script src="/ipad-game.js"></script></body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
