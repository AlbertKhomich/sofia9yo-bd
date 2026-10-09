export const STORAGE_KEY = 'sofia-quest-v1';
export const INITIAL_STATE = { stage: -1, phase: 'start', stars: 0 };

// Keep the original save format so existing tablet progress still works.
export function restoreState(value) {
  if (!value || typeof value.stage !== 'number' || value.stage % 1 !== 0 || typeof value.stars !== 'number' || value.stars % 1 !== 0) return INITIAL_STATE;
  var stage = value.stage, phase = value.phase, stars = value.stars;
  if (stage === -1 && phase === 'start' && stars === 0) return INITIAL_STATE;
  if (stage === 7 && phase === 'won' && stars === 8) return { stage: stage, phase: phase, stars: stars };
  if (stage < 0 || stage > 7) return INITIAL_STATE;
  if (phase === 'challenge' && stars === stage) return { stage: stage, phase: phase, stars: stars };
  if (phase === 'code' && stage >= 1 && stars === (stage === 1 ? 0 : stage)) return { stage: stage, phase: phase, stars: stars };
  if (phase === 'clue' && stage >= 1 && stage <= 6 && stars === stage + 1) return { stage: stage, phase: phase, stars: stars };
  return INITIAL_STATE;
}

export function matchesCode(input, expected) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '') === expected;
}
