import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STATE, matchesCode, restoreState } from '../lib/game.js';
import { MISSIONS } from '../lib/missions.js';

test('all seven cards unlock the next mission with unique codes', () => {
  const cards = MISSIONS.slice(0, 7);
  assert.equal(new Set(cards.map(card => card.code)).size, 7);
  for (const card of cards) {
    assert.ok(matchesCode(` ${card.code.toLowerCase()} `, card.code));
    assert.equal(matchesCode('WRONG', card.code), false);
  }
});

test('every saved step in a complete eight-star game can be restored', () => {
  const states = [INITIAL_STATE, { stage: 0, phase: 'challenge', stars: 0 }];
  for (let stage = 1; stage <= 7; stage++) {
    states.push({ stage, phase: 'code', stars: stage === 1 ? 0 : stage });
    states.push({ stage, phase: 'challenge', stars: stage });
    states.push({ stage, phase: stage === 7 ? 'won' : 'clue', stars: stage + 1 });
  }
  for (const state of states) assert.deepEqual(restoreState(JSON.parse(JSON.stringify(state))), state);
});

test('malformed or impossible saves safely return to the start', () => {
  for (const value of [null, {}, [], { stage: 99, phase: 'challenge', stars: 0 },
    { stage: 1, phase: 'won', stars: 8 }, { stage: 0, phase: 'code', stars: 0 },
    { stage: 3, phase: 'challenge', stars: -1 }, { stage: 7, phase: 'clue', stars: 8 }]) {
    assert.deepEqual(restoreState(value), INITIAL_STATE);
  }
});
