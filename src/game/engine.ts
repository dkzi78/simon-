// Pure game rules: no DOM, audio, timers or storage.
import { COLORS, TOTAL_ROUNDS, type Color } from '../config.ts';

export type Phase =
  | 'idle'
  | 'presenting'
  | 'acceptingInput'
  | 'betweenRounds'
  | 'paused'
  | 'lost'
  | 'won';

export interface GameState {
  readonly phase: Phase;
  readonly sequence: readonly Color[];
  readonly completedRounds: number;
  readonly inputIndex: number;
  readonly pausedFrom: Phase | null;
}

export type Random = () => number;

export type InputOutcome = 'ignored' | 'correct' | 'roundComplete' | 'won' | 'lost';

export interface InputResult {
  readonly state: GameState;
  readonly outcome: InputOutcome;
}

const PAUSABLE: readonly Phase[] = ['presenting', 'acceptingInput', 'betweenRounds'];

function randomColor(random: Random): Color {
  return COLORS[Math.floor(random() * COLORS.length)];
}

export function createInitialState(): GameState {
  return { phase: 'idle', sequence: [], completedRounds: 0, inputIndex: 0, pausedFrom: null };
}

export function startGame(random: Random): GameState {
  return {
    phase: 'presenting',
    sequence: [randomColor(random)],
    completedRounds: 0,
    inputIndex: 0,
    pausedFrom: null,
  };
}

export function playbackFinished(state: GameState): GameState {
  if (state.phase !== 'presenting') return state;
  return { ...state, phase: 'acceptingInput', inputIndex: 0 };
}

export function inputColor(state: GameState, color: Color, random: Random): InputResult {
  if (state.phase !== 'acceptingInput') return { state, outcome: 'ignored' };

  if (state.sequence[state.inputIndex] !== color) {
    return { state: { ...state, phase: 'lost' }, outcome: 'lost' };
  }

  const nextIndex = state.inputIndex + 1;
  if (nextIndex < state.sequence.length) {
    return { state: { ...state, inputIndex: nextIndex }, outcome: 'correct' };
  }

  const completedRounds = state.completedRounds + 1;
  if (completedRounds >= TOTAL_ROUNDS) {
    return {
      state: { ...state, phase: 'won', completedRounds, inputIndex: nextIndex },
      outcome: 'won',
    };
  }

  // The next round's sequence is created now, so pausing during the break
  // never triggers another draw.
  return {
    state: {
      ...state,
      phase: 'betweenRounds',
      completedRounds,
      inputIndex: 0,
      sequence: [...state.sequence, randomColor(random)],
    },
    outcome: 'roundComplete',
  };
}

export function nextRoundReady(state: GameState): GameState {
  if (state.phase !== 'betweenRounds') return state;
  return { ...state, phase: 'presenting', inputIndex: 0 };
}

export function pause(state: GameState): GameState {
  if (!PAUSABLE.includes(state.phase)) return state;
  return { ...state, phase: 'paused', pausedFrom: state.phase };
}

export function resume(state: GameState): GameState {
  if (state.phase !== 'paused') return state;
  return { ...state, phase: 'presenting', inputIndex: 0, pausedFrom: null };
}

// Round shown to the player: the one being played, or the last completed one.
export function displayRound(state: GameState): number {
  return state.phase === 'betweenRounds' ? state.completedRounds : state.sequence.length;
}
