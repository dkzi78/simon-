// Game controller: source of truth for the active game; runs side effects after each transition.
import { BETWEEN_ROUNDS_MS, PRESS_FEEDBACK_MS, type Color } from '../config.ts';
import type { AudioAdapter } from '../audio/audio.ts';
import * as engine from './engine.ts';
import type { GameState, Random } from './engine.ts';
import type { Scheduler } from './scheduler.ts';

export interface ViewState {
  readonly game: GameState;
  readonly activeColor: Color | null;
  readonly audioAvailable: boolean;
}

export interface Controller {
  start(): void;
  press(color: Color): void;
  pause(): void;
  resume(): void;
  audioChanged(): void;
}

export function createController(
  audio: AudioAdapter,
  scheduler: Scheduler,
  onChange: (view: ViewState) => void,
  random: Random = Math.random,
): Controller {
  let game = engine.createInitialState();
  let activeColor: Color | null = null;
  // Each press gets its own token so an old "light off" never clears a newer press.
  let pressToken = 0;
  let pressTimer: number | undefined;

  function emit(): void {
    onChange({ game, activeColor, audioAvailable: audio.available });
  }

  function setLight(color: Color | null): void {
    activeColor = color;
    emit();
  }

  function clearPressFeedback(): void {
    pressToken += 1;
    window.clearTimeout(pressTimer);
  }

  function present(): void {
    scheduler.play(game.sequence, {
      onLight: setLight,
      onFinished: () => {
        game = engine.playbackFinished(game);
        activeColor = null;
        emit();
      },
    });
  }

  function showPressFeedback(color: Color): void {
    clearPressFeedback();
    const token = pressToken;
    audio.playTone(color, 0, PRESS_FEEDBACK_MS / 1000);
    setLight(color);
    pressTimer = window.setTimeout(() => {
      if (token === pressToken) setLight(null);
    }, PRESS_FEEDBACK_MS);
  }

  emit();

  return {
    start() {
      if (game.phase !== 'idle' && game.phase !== 'lost' && game.phase !== 'won') return;
      audio.unlock();
      scheduler.cancel();
      clearPressFeedback();
      game = engine.startGame(random);
      activeColor = null;
      emit();
      present();
    },

    press(color) {
      // State changes synchronously before any side effect, so rapid taps
      // cannot complete the same round twice.
      const result = engine.inputColor(game, color, random);
      if (result.outcome === 'ignored') return;
      game = result.state;
      audio.unlock();
      showPressFeedback(color);

      if (result.outcome === 'roundComplete') {
        scheduler.delay(BETWEEN_ROUNDS_MS, () => {
          game = engine.nextRoundReady(game);
          clearPressFeedback();
          activeColor = null;
          emit();
          present();
        });
      }
    },

    pause() {
      const paused = engine.pause(game);
      if (paused === game) return;
      game = paused;
      scheduler.cancel();
      clearPressFeedback();
      activeColor = null;
      emit();
    },

    resume() {
      if (game.phase !== 'paused') return;
      audio.unlock();
      game = engine.resume(game);
      activeColor = null;
      emit();
      present();
    },

    audioChanged() {
      emit();
    },
  };
}
