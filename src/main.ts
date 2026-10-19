import '@fontsource-variable/heebo';
import './style.css';
import { createAudio } from './audio/audio.ts';
import { createController, type Controller } from './game/controller.ts';
import { createScheduler } from './game/scheduler.ts';
import { createHomeView } from './ui/home-view.ts';

const app = document.querySelector<HTMLElement>('#app');

if (app) {
  // The view and audio call into the controller, which is created right after them.
  let controller: Controller | undefined;
  const view = createHomeView(app, {
    onStart: () => controller?.start(),
    onPress: (color) => controller?.press(color),
  });
  const audio = createAudio(() => controller?.audioChanged());
  controller = createController(audio, createScheduler(audio), (state) => view.render(state));

  // Hidden documents throttle timers, so an active game pauses and replays its round on return.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controller?.pause();
    else controller?.resume();
  });
}
