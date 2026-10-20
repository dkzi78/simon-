import { describe, expect, it } from 'vitest';
import { parseRoute } from './routes.ts';

describe('parseRoute', () => {
  it('maps an empty hash and #/ to home', () => {
    expect(parseRoute('')).toBe('home');
    expect(parseRoute('#')).toBe('home');
    expect(parseRoute('#/')).toBe('home');
  });

  it('maps #/about to about', () => {
    expect(parseRoute('#/about')).toBe('about');
  });

  it('returns null for unknown hashes', () => {
    expect(parseRoute('#/xyz')).toBeNull();
    expect(parseRoute('#about')).toBeNull();
    expect(parseRoute('#/about/')).toBeNull();
  });
});
