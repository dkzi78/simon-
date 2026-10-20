// Hash routes: '#/' is home and '#/about' is about; anything else is unknown.
export type Route = 'home' | 'about';

export const ROUTE_HASHES: Record<Route, string> = {
  home: '#/',
  about: '#/about',
};

export function parseRoute(hash: string): Route | null {
  if (hash === '' || hash === '#' || hash === ROUTE_HASHES.home) return 'home';
  if (hash === ROUTE_HASHES.about) return 'about';
  return null;
}
