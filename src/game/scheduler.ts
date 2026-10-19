// Playback scheduler: shows a sequence on an absolute timeline and can be cancelled.
import { COLOR_GAP_MS, COLOR_ON_MS, type Color } from '../config.ts';
import type { AudioAdapter } from '../audio/audio.ts';

export interface PlaybackCallbacks {
  onLight(color: Color | null): void;
  onFinished(): void;
}

export interface Scheduler {
  play(sequence: readonly Color[], callbacks: PlaybackCallbacks): void;
  delay(ms: number, callback: () => void): void;
  cancel(): void;
}

export function createScheduler(audio: AudioAdapter): Scheduler {
  // Bumped on every cancel; callbacks from an older generation do nothing.
  let generation = 0;
  const timers = new Set<number>();

  // Fires at an absolute time so timer drift does not accumulate.
  function at(target: number, gen: number, callback: () => void): void {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (gen === generation) callback();
    }, Math.max(0, target - performance.now()));
    timers.add(id);
  }

  return {
    play(sequence, callbacks) {
      const gen = generation;
      const step = COLOR_ON_MS + COLOR_GAP_MS;
      const t0 = performance.now();
      sequence.forEach((color, i) => {
        const start = t0 + i * step;
        audio.playTone(color, (i * step) / 1000, COLOR_ON_MS / 1000);
        at(start, gen, () => callbacks.onLight(color));
        at(start + COLOR_ON_MS, gen, () => callbacks.onLight(null));
      });
      const lastOff = t0 + (sequence.length - 1) * step + COLOR_ON_MS;
      at(lastOff, gen, () => callbacks.onFinished());
    },

    delay(ms, callback) {
      at(performance.now() + ms, generation, callback);
    },

    cancel() {
      generation += 1;
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
      audio.stopAll();
    },
  };
}
