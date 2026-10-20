// Bottom navigation: "home" on the right and "about" on the left (RTL), with outline icons.
import { ROUTE_HASHES, type Route } from '../app/routes.ts';
import { el } from './dom.ts';

export interface BottomNav {
  setActive(route: Route): void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// Outline icons drawn with a 2px stroke, as in the style guide.
const ICONS: Record<Route, readonly { tag: 'path' | 'circle'; attrs: Record<string, string> }[]> = {
  home: [{ tag: 'path', attrs: { d: 'M4 11 12 4l8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5' } }],
  about: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
    { tag: 'path', attrs: { d: 'M12 11v6M12 7.5v.01' } },
  ],
};

function icon(route: Route): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'nav__icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  for (const { tag, attrs } of ICONS[route]) {
    const shape = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, value);
    svg.append(shape);
  }
  return svg;
}

export function createBottomNav(root: HTMLElement, onHomeClick: () => void): BottomNav {
  const nav = el('nav', 'nav');
  nav.setAttribute('aria-label', 'ניווט ראשי');

  const labels: Record<Route, string> = { home: 'בית', about: 'אודות' };
  const links = new Map<Route, HTMLAnchorElement>();
  // DOM order home, about: in RTL "home" lands on the right.
  for (const route of ['home', 'about'] as const) {
    const link = el('a', 'nav__item');
    link.href = ROUTE_HASHES[route];
    link.append(icon(route), el('span', 'nav__label', labels[route]));
    links.set(route, link);
    nav.append(link);
  }
  // Returning home is a user gesture, so audio can be unlocked here.
  links.get('home')?.addEventListener('click', onHomeClick);

  root.append(nav);

  return {
    setActive(route) {
      for (const [key, link] of links) {
        if (key === route) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    },
  };
}
