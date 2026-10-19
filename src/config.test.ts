import { describe, expect, it } from 'vitest';
import { BETWEEN_ROUNDS_MS, COLORS, COLOR_GAP_MS, COLOR_ON_MS, TOTAL_ROUNDS } from './config.ts';

describe('game config', () => {
  it('has four distinct colors', () => {
    expect(COLORS).toHaveLength(4);
    expect(new Set(COLORS).size).toBe(4);
  });

  it('has exactly 10 rounds', () => {
    expect(TOTAL_ROUNDS).toBe(10);
  });

  it('uses the fixed playback timing', () => {
    expect(COLOR_ON_MS).toBe(600);
    expect(COLOR_GAP_MS).toBe(300);
    expect(BETWEEN_ROUNDS_MS).toBe(600);
  });
});
