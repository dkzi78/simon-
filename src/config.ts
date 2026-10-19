// Fixed game configuration from spec/ARCHITECTURE.md.

export const COLORS = ['blue', 'red', 'yellow', 'green'] as const;
export type Color = (typeof COLORS)[number];

export const TOTAL_ROUNDS = 10;

export const COLOR_ON_MS = 600;
export const COLOR_GAP_MS = 300;
export const BETWEEN_ROUNDS_MS = 600;
