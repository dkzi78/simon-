// Score repository: best and last score in one Local Storage entry, with an in-memory fallback.
import { SCORES_STORAGE_KEY, TOTAL_ROUNDS } from '../config.ts';

export interface Scores {
  readonly bestScore: number;
  readonly lastScore: number;
}

export interface ScoreRepository {
  // False once any storage access has failed; scores then live in memory only.
  readonly available: boolean;
  read(): Scores;
  // Saves the active game's completed rounds as the last score; the best score never goes down.
  record(completedRounds: number): Scores;
}

const EMPTY: Scores = { bestScore: 0, lastScore: 0 };

function validScore(value: unknown): number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= TOTAL_ROUNDS
    ? (value as number)
    : 0;
}

export function parseScores(raw: string | null): Scores {
  if (raw === null) return EMPTY;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return EMPTY;
  const record = data as Record<string, unknown>;
  return { bestScore: validScore(record.bestScore), lastScore: validScore(record.lastScore) };
}

export function createScoreRepository(getStorage: () => Storage): ScoreRepository {
  let available = true;
  let memory: Scores = EMPTY;

  function load(): Scores {
    if (!available) return memory;
    try {
      memory = parseScores(getStorage().getItem(SCORES_STORAGE_KEY));
    } catch {
      available = false;
    }
    return memory;
  }

  function save(scores: Scores): void {
    memory = scores;
    if (!available) return;
    try {
      getStorage().setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
    } catch {
      available = false;
    }
  }

  load();

  return {
    get available() {
      return available;
    },

    read: load,

    record(completedRounds) {
      // Re-read first so another tab's higher best score is not overwritten.
      const current = load();
      const lastScore = validScore(completedRounds);
      const next = { bestScore: Math.max(current.bestScore, lastScore), lastScore };
      save(next);
      return next;
    },
  };
}
