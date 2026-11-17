import test from 'node:test';
import assert from 'node:assert/strict';
import { DIANA_MISSIONS, MUSIC_CODE, INITIAL_DIANA_STATE, DIANA_STORAGE_KEY, restoreDiana, acceptsDianaCode, decodeDiana } from '../lib/diana.js';
import { STORAGE_KEY } from '../lib/game.js';

test('Diana progresses through eight distinct physical cards then the musical lock', () => {
  assert.equal(DIANA_MISSIONS.length, 8);
  assert.equal(new Set(DIANA_MISSIONS.map(m => m.code)).size, 8);
  DIANA_MISSIONS.forEach((mission, stage) => {
    assert.match(mission.code, /^\d{4}$/);
    assert.ok(acceptsDianaCode(stage, mission.code));
    assert.ok(acceptsDianaCode(stage, ` ${mission.code} `));
    assert.equal(acceptsDianaCode(stage, DIANA_MISSIONS[(stage + 1) % 8].code), false);
    assert.equal(acceptsDianaCode(stage, MUSIC_CODE), false);
    assert.equal(acceptsDianaCode(stage, `x${mission.code}`), false);
  });
  assert.ok(acceptsDianaCode(8, MUSIC_CODE));
  assert.equal(acceptsDianaCode(8, DIANA_MISSIONS[7].code), false);
  assert.equal(acceptsDianaCode(9, MUSIC_CODE), false);
});
test('saved progress is isolated, validated and preserves the notebook and finish time', () => {
  assert.notEqual(DIANA_STORAGE_KEY, STORAGE_KEY);
  const startedAt = Date.now() - 10000;
  for (let stage = 0; stage <= 9; stage++) {
    const state = { stage, startedAt, finishedAt: stage === 9 ? startedAt + 9000 : null, music: MUSIC_CODE };
    assert.deepEqual(restoreDiana(state), state);
  }
  for (const value of [null, {}, { stage: 12 }, { stage: 1.5 }, { stage: 3, startedAt: 'yesterday' }, { stage: 9, startedAt, finishedAt: null }, { stage: 0, startedAt: Date.now() + 100000 }]) assert.deepEqual(restoreDiana(value), INITIAL_DIANA_STATE);
  assert.equal(restoreDiana({ stage: 4, startedAt, music: 'wrong' }).music, '');
});
test('Russian cipher includes Ё and decodes correctly', () => {
  assert.equal(decodeDiana(0), 'ЛПХЁНБЩЙОБ');
  assert.equal(decodeDiana(32), 'КОФЕМАШИНА');
});
