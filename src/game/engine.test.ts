import { describe, expect, it } from 'vitest';
import { COLORS, TOTAL_ROUNDS, type Color } from '../config.ts';
import {
  createInitialState,
  inputColor,
  nextRoundReady,
  pause,
  playbackFinished,
  resume,
  startGame,
  type GameState,
  type Random,
} from './engine.ts';

// Returns values that select the given color indexes in order, then repeats the last one.
function scripted(indexes: number[]): Random {
  let i = 0;
  return () => {
    const index = indexes[Math.min(i, indexes.length - 1)];
    i += 1;
    return (index + 0.5) / COLORS.length;
  };
}

const failIfCalled: Random = () => {
  throw new Error('random must not be called');
};

function wrongColor(color: Color): Color {
  return COLORS[(COLORS.indexOf(color) + 1) % COLORS.length];
}

// Repeats the current sequence correctly and returns the last input result.
function playRound(state: GameState, random: Random) {
  let current = playbackFinished(state);
  let result = { state: current, outcome: 'ignored' as string };
  for (const color of current.sequence) {
    result = inputColor(current, color, random);
    current = result.state;
  }
  return result;
}

describe('game engine', () => {
  it('starts idle with no sequence', () => {
    const state = createInitialState();
    expect(state.phase).toBe('idle');
    expect(state.sequence).toEqual([]);
    expect(state.completedRounds).toBe(0);
  });

  it('starts round 1 with one color', () => {
    const state = startGame(scripted([2]));
    expect(state.phase).toBe('presenting');
    expect(state.sequence).toEqual(['yellow']);
  });

  it('adds exactly one color without changing the previous ones', () => {
    const random = scripted([1, 3, 0]);
    let state = startGame(random);
    const before = [...state.sequence];
    const result = playRound(state, random);
    expect(result.outcome).toBe('roundComplete');
    state = result.state;
    expect(state.sequence).toHaveLength(2);
    expect(state.sequence.slice(0, 1)).toEqual(before);
    expect(state.sequence).toEqual(['red', 'green']);
  });

  it('allows repeated colors, including consecutive ones', () => {
    const random = scripted([0]);
    let state = startGame(random);
    for (let i = 0; i < 3; i += 1) {
      state = nextRoundReady(playRound(state, random).state);
    }
    expect(state.sequence).toEqual(['blue', 'blue', 'blue', 'blue']);
    expect(state.completedRounds).toBe(3);
  });

  it('scores only fully completed rounds', () => {
    const random = scripted([0, 1, 2]);
    let state = nextRoundReady(playRound(startGame(random), random).state);
    state = playbackFinished(state);
    const partial = inputColor(state, state.sequence[0], random);
    expect(partial.outcome).toBe('correct');
    expect(partial.state.completedRounds).toBe(1);
    const done = inputColor(partial.state, partial.state.sequence[1], random);
    expect(done.outcome).toBe('roundComplete');
    expect(done.state.completedRounds).toBe(2);
  });

  it('loses on the first mistake with score 0 in round 1', () => {
    const state = playbackFinished(startGame(scripted([0])));
    const result = inputColor(state, wrongColor(state.sequence[0]), failIfCalled);
    expect(result.outcome).toBe('lost');
    expect(result.state.phase).toBe('lost');
    expect(result.state.completedRounds).toBe(0);
  });

  it('keeps completed rounds as the score after a later mistake', () => {
    const random = scripted([0, 1, 2]);
    let state = nextRoundReady(playRound(startGame(random), random).state);
    state = nextRoundReady(playRound(state, random).state);
    state = playbackFinished(state);
    const result = inputColor(state, wrongColor(state.sequence[0]), random);
    expect(result.outcome).toBe('lost');
    expect(result.state.completedRounds).toBe(2);
  });

  it('ignores input after losing', () => {
    const state = playbackFinished(startGame(scripted([0])));
    const lost = inputColor(state, 'red', failIfCalled).state;
    const after = inputColor(lost, lost.sequence[0], failIfCalled);
    expect(after.outcome).toBe('ignored');
    expect(after.state).toBe(lost);
  });

  it('completes exactly 10 rounds and never creates round 11', () => {
    const random = scripted([0, 1, 2, 3, 2, 1, 0, 3, 3, 1, 2, 0]);
    let state = startGame(random);
    for (let round = 1; round < TOTAL_ROUNDS; round += 1) {
      const result = playRound(state, random);
      expect(result.outcome).toBe('roundComplete');
      state = nextRoundReady(result.state);
    }
    const final = playRound(state, random);
    expect(final.outcome).toBe('won');
    expect(final.state.phase).toBe('won');
    expect(final.state.completedRounds).toBe(10);
    expect(final.state.sequence).toHaveLength(10);

    expect(nextRoundReady(final.state)).toBe(final.state);
    expect(playbackFinished(final.state)).toBe(final.state);
    expect(inputColor(final.state, 'blue', failIfCalled).outcome).toBe('ignored');
  });

  it('ignores input outside the accepting-input phase', () => {
    const random = scripted([0, 1]);
    const presenting = startGame(random);
    const betweenRounds = playRound(presenting, random).state;
    const paused = pause(presenting);
    for (const state of [createInitialState(), presenting, betweenRounds, paused]) {
      const result = inputColor(state, 'blue', failIfCalled);
      expect(result.outcome).toBe('ignored');
      expect(result.state).toBe(state);
    }
  });

  it('resumes with the same sequence and reset input, without a new draw', () => {
    const random = scripted([0, 1, 2]);
    let state = nextRoundReady(playRound(startGame(random), random).state);
    state = playbackFinished(state);
    state = inputColor(state, state.sequence[0], random).state;
    expect(state.inputIndex).toBe(1);

    const resumed = resume(pause(state));
    expect(resumed.phase).toBe('presenting');
    expect(resumed.inputIndex).toBe(0);
    expect(resumed.sequence).toEqual(state.sequence);
  });

  it('resumes the already drawn next round when paused between rounds', () => {
    const random = scripted([0, 3]);
    const between = playRound(startGame(random), random).state;
    expect(between.phase).toBe('betweenRounds');
    const resumed = resume(pause(between));
    expect(resumed.phase).toBe('presenting');
    expect(resumed.sequence).toEqual(between.sequence);
    expect(resumed.completedRounds).toBe(1);
  });

  it('does not pause or resume a finished or idle game', () => {
    const idle = createInitialState();
    expect(pause(idle)).toBe(idle);
    const lost = inputColor(playbackFinished(startGame(scripted([0]))), 'red', failIfCalled).state;
    expect(pause(lost)).toBe(lost);
    expect(resume(lost)).toBe(lost);
  });
});
