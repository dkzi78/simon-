import '@fontsource-variable/heebo';
import './style.css';
import { createAudio } from './audio/audio.ts';
import { ROUTE_HASHES, parseRoute } from './app/routes.ts';
import { createController, type Controller } from './game/controller.ts';
import { createScheduler } from './game/scheduler.ts';
import { createScoreRepository } from './storage/scores.ts';
import { createAboutView } from './ui/about-view.ts';
import { createBottomNav } from './ui/bottom-nav.ts';
import { createHomeView } from './ui/home-view.ts';

const app = document.querySelector<HTMLElement>('#app');

if (app) {
  const content = document.createElement('div');
  content.className = 'content';
  app.append(content);

  // The view and audio call into the controller, which is created right after them.
  let controller: Controller | undefined;
  const scores = createScoreRepository(() => window.localStorage);
  const home = createHomeView(content, {
    onStart: () => controller?.start(),
    onPress: (color) => controller?.press(color),
  });
  const about = createAboutView(content);
  const audio = createAudio(() => controller?.audioChanged());
  const nav = createBottomNav(app, () => audio.unlock());
  controller = createController(audio, createScheduler(audio), scores, (state) =>
    home.render(state),
  );

  function showRoute(): void {
    const route = parseRoute(window.location.hash);
    if (route === null) {
      // Unknown hashes are normalized to home without adding a history entry.
      window.location.replace(ROUTE_HASHES.home);
      return;
    }
    home.element.hidden = route !== 'home';
    about.element.hidden = route !== 'about';
    nav.setActive(route);
    if (route === 'about') about.render(scores.read(), scores.available);
    controller?.setScreen(route);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', showRoute);
  showRoute();

  // Hidden documents throttle timers, so an active game pauses and replays its round on return.
  document.addEventListener('visibilitychange', () => {
    controller?.setDocumentHidden(document.hidden);
  });
}
