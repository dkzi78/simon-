// Web Audio adapter: one AudioContext, one tone per color, no audio files.
import { COLOR_FREQUENCIES_HZ, TONE_FADE_SEC, type Color } from '../config.ts';

export interface AudioAdapter {
  readonly available: boolean;
  unlock(): void;
  playTone(color: Color, delaySec: number, durationSec: number): void;
  stopAll(): void;
}

export function createAudio(onAvailabilityChange: (available: boolean) => void): AudioAdapter {
  let context: AudioContext | null = null;
  let available = true;
  const active = new Set<OscillatorNode>();

  function setAvailable(value: boolean): void {
    if (available === value) return;
    available = value;
    onAvailabilityChange(value);
  }

  function markFailed(): void {
    setAvailable(false);
  }

  return {
    get available() {
      return available;
    },

    // Must be called from a user gesture so mobile browsers allow sound.
    unlock() {
      try {
        if (!context) {
          const Ctor = window.AudioContext;
          if (!Ctor) {
            markFailed();
            return;
          }
          context = new Ctor();
        }
        if (context.state !== 'running') {
          const ctx = context;
          ctx.resume().then(
            () => setAvailable(ctx.state === 'running'),
            markFailed,
          );
        } else {
          setAvailable(true);
        }
      } catch {
        markFailed();
      }
    },

    playTone(color, delaySec, durationSec) {
      // A suspended context may still be resuming from unlock(); its tones play once it runs.
      if (!context || context.state === 'closed') return;
      try {
        const start = context.currentTime + Math.max(0, delaySec);
        const end = start + durationSec;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = COLOR_FREQUENCIES_HZ[color];
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + TONE_FADE_SEC);
        gain.gain.setValueAtTime(0.3, end - TONE_FADE_SEC);
        gain.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(gain).connect(context.destination);
        oscillator.onended = () => {
          active.delete(oscillator);
          gain.disconnect();
        };
        active.add(oscillator);
        oscillator.start(start);
        oscillator.stop(end);
      } catch {
        markFailed();
      }
    },

    stopAll() {
      for (const oscillator of active) {
        try {
          oscillator.onended = null;
          oscillator.stop();
          oscillator.disconnect();
        } catch {
          // Already stopped; nothing to do.
        }
      }
      active.clear();
    },
  };
}
