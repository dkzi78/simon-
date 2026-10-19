// Fixed game configuration from spec/ARCHITECTURE.md.

export const COLORS = ['blue', 'red', 'yellow', 'green'] as const;
export type Color = (typeof COLORS)[number];

export const COLOR_LABELS: Record<Color, string> = {
  blue: 'כחול',
  red: 'אדום',
  yellow: 'צהוב',
  green: 'ירוק',
};

export const COLOR_FREQUENCIES_HZ: Record<Color, number> = {
  blue: 330,
  red: 440,
  yellow: 554,
  green: 659,
};

export const TOTAL_ROUNDS = 10;

export const COLOR_ON_MS = 600;
export const COLOR_GAP_MS = 300;
export const BETWEEN_ROUNDS_MS = 600;

// Light and tone length when the player presses a color (see ADR-3).
export const PRESS_FEEDBACK_MS = 300;

// Short gain ramp at tone start and end to avoid audible clicks.
export const TONE_FADE_SEC = 0.01;
