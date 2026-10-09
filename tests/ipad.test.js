import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { MISSIONS, MEMORY_WORDS } from '../lib/missions.js';
import { INITIAL_STATE, STORAGE_KEY } from '../lib/game.js';

const script = readFileSync(new URL('../public/ipad-game.js', import.meta.url), 'utf8');
function game({ saved = null, blocked = false } = {}) {
  let now = 0, tick;
  const elements = {};
  const element = id => elements[id] ||= { innerHTML: '', textContent: '', value: '', focus() {}, select() {}, querySelectorAll() { return []; } };
  element('ipad-data').textContent = JSON.stringify({ missions: MISSIONS, words: MEMORY_WORDS, initial: INITIAL_STATE, key: STORAGE_KEY });
  vm.runInNewContext(script, {
    document: { getElementById: element }, window: { confirm: () => true },
    Date: { now: () => now }, setInterval: fn => { tick = fn; return 1; }, clearInterval() {},
    localStorage: { getItem: () => saved, setItem: (_, value) => { if (blocked) throw Error('blocked'); saved = value; } },
  });
  return {
    element, state: () => JSON.parse(saved),
    click: action => element('ipad-game').onclick({ target: { getAttribute: () => action } }),
    answer: value => { element('answer').value = value; element('answer-form').onsubmit({ preventDefault() {} }); },
    advance: seconds => { now += seconds * 1000; tick(); },
  };
}

test('compatibility runtime completes all missions, rejects wrong answers, and runs timers', () => {
  const g = game();
  g.click('start'); g.click('first');
  g.answer('wrong'); assert.equal(g.state().phase, 'code');
  for (let stage = 1; stage <= 7; stage++) {
    g.answer(MISSIONS[stage - 1].code.toLowerCase());
    assert.equal(g.state().stage, stage);
    assert.equal(g.state().phase, 'challenge');
    if (stage === 2 || stage === 7) {
      g.click('timer');
      g.advance(stage === 2 ? 14 : 9);
      assert.equal(g.element('count').textContent, 1);
      g.advance(1);
      assert.match(g.element('timed').innerHTML, stage === 2 ? /Wörter versteckt/ : /Was für eine Pose/);
    }
    if (stage === 5) {
      g.answer('Katze'); assert.equal(g.state().phase, 'challenge');
      g.answer('Meerschweinchen');
    } else g.click('done');
    if (stage < 7) g.click('search');
  }
  assert.deepEqual(g.state(), { stage: 7, phase: 'won', stars: 8 });
  g.element('reset').onclick();
  assert.deepEqual(g.state(), INITIAL_STATE);
});

test('compatibility runtime restores progress and survives damaged or blocked storage', () => {
  const state = { stage: 4, phase: 'challenge', stars: 4 };
  assert.deepEqual(game({ saved: JSON.stringify(state) }).state(), state);
  assert.deepEqual(game({ saved: '{broken' }).state(), INITIAL_STATE);
  const g = game({ blocked: true });
  g.click('start');
  assert.match(g.element('ipad-game').innerHTML, /Die Eiszone/);
  assert.equal(g.element('save-warning').hidden, false);
});
