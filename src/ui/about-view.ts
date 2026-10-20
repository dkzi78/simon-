// About screen: logo, description, instructions and the two saved scores.
import { ABOUT_DESCRIPTION, ABOUT_INSTRUCTIONS, STORAGE_UNAVAILABLE_TEXT } from '../config.ts';
import type { Scores } from '../storage/scores.ts';
import logoUrl from '../assets/logo.svg';
import { el } from './dom.ts';

export interface AboutView {
  readonly element: HTMLElement;
  render(scores: Scores, storageAvailable: boolean): void;
}

function scoreCard(label: string): { card: HTMLElement; value: HTMLElement } {
  const card = el('div', 'score-card');
  const value = el('span', 'score-card__value', '0');
  card.append(el('span', 'score-card__label', label), value);
  return { card, value };
}

export function createAboutView(root: HTMLElement): AboutView {
  const screen = el('section', 'screen about');

  const header = el('header', 'header');
  header.append(el('h1', 'title', 'אודות'));

  // The mark is an image; the name is HTML text so it uses the page's Heebo font (ADR-4).
  const logo = el('div', 'logo');
  logo.setAttribute('role', 'img');
  logo.setAttribute('aria-label', 'סיימון');
  const mark = el('img', 'logo__mark');
  mark.src = logoUrl;
  mark.alt = '';
  mark.width = 72;
  mark.height = 72;
  const name = el('span', 'logo__name', 'סיימון');
  name.setAttribute('aria-hidden', 'true');
  logo.append(mark, name);

  const description = el('p', 'about__text', ABOUT_DESCRIPTION);

  const howTo = el('h2', 'about__subtitle', 'איך משחקים?');
  const instructions = el('div', 'about__instructions');
  for (const line of ABOUT_INSTRUCTIONS) instructions.append(el('p', 'about__text', line));

  const best = scoreCard('שיא אישי');
  const last = scoreCard('תוצאת המשחק האחרון');
  const cards = el('div', 'score-cards');
  cards.append(best.card, last.card);

  const notice = el('p', 'notice about__notice');

  screen.append(header, logo, description, howTo, instructions, cards, notice);
  root.append(screen);

  return {
    element: screen,
    render(scores, storageAvailable) {
      best.value.textContent = String(scores.bestScore);
      last.value.textContent = String(scores.lastScore);
      notice.textContent = storageAvailable ? '' : STORAGE_UNAVAILABLE_TEXT;
    },
  };
}
