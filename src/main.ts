import './style.css';

// Minimal placeholder screen for Milestone 1; the game UI arrives in Milestone 2.
const app = document.querySelector<HTMLElement>('#app');

if (app) {
  const title = document.createElement('h1');
  title.textContent = 'סיימון';

  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'משחק זיכרון עם אורות וצלילים';

  app.append(title, subtitle);
}
