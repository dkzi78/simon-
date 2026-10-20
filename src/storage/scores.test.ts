import { describe, expect, it } from 'vitest';
import { COLORS, SCORES_STORAGE_KEY, type Color } from '../config.ts';
import {
  inputColor,
  nextRoundReady,
  playbackFinished,
  startGame,
  type GameState,
  type Random,
} from '../game/engine.ts';
import { createScoreRepository, parseScores, type ScoreRepository } from './scores.ts';

// Minimal Storage stand-in backed by a Map.
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  } as Storage;
}

function saved(best: number, last: number): Record<string, string> {
  return { [SCORES_STORAGE_KEY]: JSON.stringify({ bestScore: best, lastScore: last }) };
}

const alwaysBlue: Random = () => 0;

function wrongColor(color: Color): Color {
  return COLORS[(COLORS.indexOf(color) + 1) % COLORS.length];
}

// Plays one round correctly and records the score the way the controller does.
function completeRound(state: GameState, scores: ScoreRepository): GameState {
  let current = playbackFinished(state);
  for (const color of current.sequence) {
    const result = inputColor(current, color, alwaysBlue);
    current = result.state;
    if (result.outcome === 'roundComplete' || result.outcome === 'won') {
      scores.record(current.completedRounds);
    }
  }
  return nextRoundReady(current);
}

function loseRound(state: GameState, scores: ScoreRepository): GameState {
  const current = playbackFinished(state);
  const result = inputColor(current, wrongColor(current.sequence[0]), alwaysBlue);
  expect(result.outcome).toBe('lost');
  scores.record(result.state.completedRounds);
  return result.state;
}

describe('score scenario with saved bestScore=7 and lastScore=5', () => {
  function setup() {
    const storage = memoryStorage(saved(7, 5));
    const scores = createScoreRepository(() => storage);
    return { storage, scores };
  }

  it('starting a game keeps both saved values', () => {
    const { storage, scores } = setup();
    startGame(alwaysBlue);
    expect(scores.read()).toEqual({ bestScore: 7, lastScore: 5 });
    expect(parseScores(storage.getItem(SCORES_STORAGE_KEY))).toEqual({ bestScore: 7, lastScore: 5 });
  });

  it('completing round 1 sets last to 1 and keeps best 7', () => {
    const { storage, scores } = setup();
    completeRound(startGame(alwaysBlue), scores);
    expect(parseScores(storage.getItem(SCORES_STORAGE_KEY))).toEqual({ bestScore: 7, lastScore: 1 });
  });

  it('completing round 8 raises best to 8', () => {
    const { scores } = setup();
    let state = startGame(alwaysBlue);
    for (let round = 1; round <= 7; round += 1) state = completeRound(state, scores);
    expect(scores.read()).toEqual({ bestScore: 7, lastScore: 7 });
    completeRound(state, scores);
    expect(scores.read()).toEqual({ bestScore: 8, lastScore: 8 });
  });

  it('losing before the first success saves 0 and keeps the best score', () => {
    const { scores } = setup();
    loseRound(startGame(alwaysBlue), scores);
    expect(scores.read()).toEqual({ bestScore: 7, lastScore: 0 });
  });

  it('losing later keeps the rounds already completed', () => {
    const { scores } = setup();
    let state = startGame(alwaysBlue);
    for (let round = 1; round <= 3; round += 1) state = completeRound(state, scores);
    loseRound(state, scores);
    expect(scores.read()).toEqual({ bestScore: 7, lastScore: 3 });
  });

  it('completing the whole game saves 10', () => {
    const { scores } = setup();
    let state = startGame(alwaysBlue);
    for (let round = 1; round <= 10; round += 1) state = completeRound(state, scores);
    expect(state.phase).toBe('won');
    expect(scores.read()).toEqual({ bestScore: 10, lastScore: 10 });
  });
});

describe('parseScores', () => {
  it('returns zeros for missing data', () => {
    expect(parseScores(null)).toEqual({ bestScore: 0, lastScore: 0 });
  });

  it.each(['not json', '{', 'null', '[]', '[7, 5]', '"7"', '7'])(
    'returns zeros for malformed JSON %s',
    (raw) => {
      expect(parseScores(raw)).toEqual({ bestScore: 0, lastScore: 0 });
    },
  );

  it.each([['"7"'], ['3.5'], ['-1'], ['11'], ['null'], ['true'], ['"abc"']])(
    'shows an invalid field %s as 0 and keeps the valid one',
    (bad) => {
      expect(parseScores(`{"bestScore":${bad},"lastScore":4}`)).toEqual({
        bestScore: 0,
        lastScore: 4,
      });
      expect(parseScores(`{"bestScore":6,"lastScore":${bad}}`)).toEqual({
        bestScore: 6,
        lastScore: 0,
      });
    },
  );

  it('treats a missing field as 0', () => {
    expect(parseScores('{"bestScore":9}')).toEqual({ bestScore: 9, lastScore: 0 });
  });

  it('accepts the 0 and 10 boundaries', () => {
    expect(parseScores('{"bestScore":10,"lastScore":0}')).toEqual({ bestScore: 10, lastScore: 0 });
  });
});

describe('storage failures', () => {
  it('falls back to memory when storage cannot be accessed', () => {
    const scores = createScoreRepository(() => {
      throw new Error('SecurityError');
    });
    expect(scores.available).toBe(false);
    expect(scores.read()).toEqual({ bestScore: 0, lastScore: 0 });
    expect(scores.record(3)).toEqual({ bestScore: 3, lastScore: 3 });
    expect(scores.read()).toEqual({ bestScore: 3, lastScore: 3 });
  });

  it('falls back to memory when reading throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('read failed');
      },
      setItem: () => {},
    } as unknown as Storage;
    const scores = createScoreRepository(() => storage);
    expect(scores.available).toBe(false);
    expect(scores.record(2)).toEqual({ bestScore: 2, lastScore: 2 });
  });

  it('keeps scores in memory when writing throws', () => {
    const storage = {
      getItem: () => JSON.stringify({ bestScore: 7, lastScore: 5 }),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as unknown as Storage;
    const scores = createScoreRepository(() => storage);
    expect(scores.available).toBe(true);
    expect(scores.record(1)).toEqual({ bestScore: 7, lastScore: 1 });
    expect(scores.available).toBe(false);
    expect(scores.record(8)).toEqual({ bestScore: 8, lastScore: 8 });
    expect(scores.read()).toEqual({ bestScore: 8, lastScore: 8 });
  });
});
