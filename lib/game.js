export const STORAGE_KEY = 'sofia-quest-v1';
export const INITIAL_STATE = { stage: -1, phase: 'start', stars: 0 };

// Keep the original save format so existing tablet progress still works.
export function restoreState(value) {
  if (!value || !Number.isInteger(value.stage) || !Number.isInteger(value.stars)) return INITIAL_STATE;
  const { stage, phase, stars } = value;
  if (stage === -1 && phase === 'start' && stars === 0) return INITIAL_STATE;
  if (stage === 7 && phase === 'won' && stars === 8) return { stage, phase, stars };
  if (stage < 0 || stage > 7) return INITIAL_STATE;
  if (phase === 'challenge' && stars === stage) return { stage, phase, stars };
  if (phase === 'code' && stage >= 1 && stars === (stage === 1 ? 0 : stage)) return { stage, phase, stars };
  if (phase === 'clue' && stage >= 1 && stage <= 6 && stars === stage + 1) return { stage, phase, stars };
  return INITIAL_STATE;
}

export function matchesCode(input, expected) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '') === expected;
}
