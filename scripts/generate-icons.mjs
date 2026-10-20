// One-time generator for the install icons (ADR-7). Run with `npm run icons`;
// the PNG/ICO output in public/ is committed, so the build never runs this.
import { readFile } from 'node:fs/promises';
import { instructions } from '@vite-pwa/assets-generator/api/instructions';
import { generateAssets } from '@vite-pwa/assets-generator/api/generate-assets';
import { minimal2023Preset } from '@vite-pwa/assets-generator/presets/minimal-2023';

// Board color from spec/DESIGN.md, so maskable and Apple icons have no white edge.
const BOARD = '#0A1422';
const filled = { padding: 0.3, resizeOptions: { background: BOARD, fit: 'contain' } };

const result = await instructions({
  imageResolver: () => readFile('src/assets/logo.svg'),
  imageName: 'logo.svg',
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, ...filled },
    apple: { ...minimal2023Preset.apple, ...filled },
  },
  faviconPreset: '2023',
  htmlLinks: { xhtml: false, includeId: false },
  basePath: '/',
  resolveSvgName: (name) => name,
});

await generateAssets(result, true, 'public');
