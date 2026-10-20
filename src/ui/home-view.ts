// Home screen: builds the DOM once and updates text and classes from state.
import {
  AUDIO_UNAVAILABLE_TEXT,
  COLORS,
  COLOR_LABELS,
  STORAGE_UNAVAILABLE_TEXT,
  TOTAL_ROUNDS,
  type Color,
} from '../config.ts';
import { displayRound } from '../game/engine.ts';
import type { ViewState } from '../game/controller.ts';
import { el } from './dom.ts';

export interface HomeViewHandlers {
  onStart(): void;
  onPress(color: Color): void;
}

export interface HomeView {
  readonly element: HTMLElement;
  render(view: ViewState): void;
}

export function createHomeView(root: HTMLElement, handlers: HomeViewHandlers): HomeView {
  const screen = el('section', 'screen home');

  const header = el('header', 'header');
  header.append(el('h1', 'title', 'סיימון'));

  const board = el('div', 'board');
  const pads = new Map<Color, HTMLButtonElement>();
  for (const color of COLORS) {
    const pad = el('button', `pad pad--${color}`);
    pad.type = 'button';
    pad.setAttribute('aria-label', COLOR_LABELS[color]);
    pad.append(el('span', 'pad__label', COLOR_LABELS[color]));
    pad.addEventListener('click', () => handlers.onPress(color));
    pads.set(color, pad);
    board.append(pad);
  }
  // Decorative center hub; it also absorbs taps in the middle of the board.
  const hub = el('div', 'board__hub');
  hub.setAttribute('aria-hidden', 'true');
  board.append(hub);

  const status = el('div', 'status');
  status.setAttribute('aria-live', 'polite');
  const statusMain = el('p', 'status__main');
  const statusDetail = el('p', 'status__detail');
  status.append(statusMain, statusDetail);

  const notice = el('p', 'notice');

  const action = el('button', 'action');
  action.type = 'button';
  action.addEventListener('click', () => handlers.onStart());

  screen.append(header, status, board, notice, action);
  root.append(screen);

  return {
    element: screen,
    render({ game, activeColor, audioAvailable, storageAvailable }) {
      const accepting = game.phase === 'acceptingInput';
      for (const [color, pad] of pads) {
        pad.classList.toggle('is-active', color === activeColor);
        pad.setAttribute('aria-disabled', String(!accepting));
      }

      const round = `שלב ${displayRound(game)} מתוך ${TOTAL_ROUNDS}`;
      let main = '';
      let detail = '';
      switch (game.phase) {
        case 'presenting':
          main = `${round} · צפה ברצף`;
          break;
        case 'acceptingInput':
          main = `${round} · תורך`;
          break;
        case 'betweenRounds':
        case 'paused':
          main = round;
          break;
        case 'lost':
          main = 'המשחק הסתיים';
          detail =
            game.completedRounds === 0
              ? 'לא הושלמו שלבים'
              : game.completedRounds === 1
                ? 'השלמת שלב אחד'
                : `השלמת ${game.completedRounds} שלבים`;
          break;
        case 'won':
          main = 'כל הכבוד! השלמת את כל 10 השלבים';
          detail = `תוצאה: ${game.completedRounds}`;
          break;
        default:
          // Idle shows the round the game starts at, as in the reference image.
          main = `שלב 1 מתוך ${TOTAL_ROUNDS}`;
          break;
      }
      statusMain.textContent = main;
      statusDetail.textContent = detail;
      status.classList.toggle('status--end', game.phase === 'lost' || game.phase === 'won');

      const notices: string[] = [];
      if (!audioAvailable) notices.push(AUDIO_UNAVAILABLE_TEXT);
      if (!storageAvailable) notices.push(STORAGE_UNAVAILABLE_TEXT);
      notice.textContent = notices.join('\n');

      const finished = game.phase === 'lost' || game.phase === 'won';
      const showAction = finished || game.phase === 'idle';
      action.textContent = finished ? 'שחק שוב' : 'התחל';
      action.classList.toggle('action--secondary', finished);
      action.classList.toggle('is-hidden', !showAction);
      action.tabIndex = showAction ? 0 : -1;
      action.setAttribute('aria-hidden', String(!showAction));
    },
  };
}
