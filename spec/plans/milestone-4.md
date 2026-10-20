# תוכנית — Milestone 4: PWA ומשחק מלא ב־Offline

מבוסס על `MILESTONES.md`, ‏`PRD.md` (סעיף PWA ו־Offline), ‏`ARCHITECTURE.md` (סעיפים 6 ו־8, ‏ADR-2, ‏ADR-4) ועל הקוד הקיים מאבן דרך 3.

## מה כבר קיים

- `vite.config.ts` עם `base: '/'` ותצורת Vitest. אין תיקיית `public/`.
- `index.html` בעברית וב־RTL, ללא `theme-color`, ‏favicon או `apple-touch-icon`.
- `src/assets/logo.svg` — סמל העיגול בארבעה רבעים (ADR-4); בסיס לאייקונים.
- Heebo מקומי דרך `@fontsource-variable/heebo`; קובצי `woff2` מועתקים ל־`dist/assets` (ADR-2).
- אין שום בקשת רשת בזמן ריצה: אין CDN, אין קובצי שמע (Web Audio בלבד).
- ה־Remote ב־GitHub הוא `dkzi78/simon-`, ולכן כתובת Project Pages תהיה `https://dkzi78.github.io/simon-/` ו־Base Path הוא `/simon-/`.

## קבצים חדשים

| קובץ | תוכן |
|---|---|
| `pwa-assets.config.ts` | תצורת מחולל האייקונים: מקור `src/assets/logo.svg`, Preset מינימלי, רקע Maskable ו־Apple בצבע הלוח `#0A1422` |
| `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png` | אייקוני PWA רגילים (שקופים מסביב לעיגול) |
| `public/maskable-icon-512x512.png` | אייקון Maskable: העיגול באזור הבטוח, על רקע `#0A1422` מלא |
| `public/apple-touch-icon-180x180.png` | אייקון iOS ‏180×180 על רקע `#0A1422` |
| `public/favicon.ico` | Favicon לכרטיסיית הדפדפן |

האייקונים נוצרים פעם אחת בפקודה `npm run icons` ונשמרים ב־Repository כקבצים רגילים. ה־Build עצמו אינו מייצר אותם ואינו תלוי במחולל.

## קבצים שמשתנים

| קובץ | שינוי |
|---|---|
| `package.json` / `package-lock.json` | Dev Dependencies מקובעות: `vite-plugin-pwa` ‏2.0.0 (לפי ARCHITECTURE) ו־`@vite-pwa/assets-generator` (גרסה יציבה אחרונה, מקובעת בעת ההתקנה). סקריפט `icons` |
| `vite.config.ts` | Base Path ‏`/simon-/` ב־Build וב־Preview; ‏`/` ב־Dev. הוספת `VitePWA` עם Manifest ו־Workbox (פירוט למטה) |
| `index.html` | `<meta name="theme-color">`, ‏favicon ו־`apple-touch-icon` עם `%BASE_URL%` (ללא נתיב קשיח שמתחיל ב־`/`) |
| `.gitignore` | הוספת `dev-dist/` (תיקיית פלט אפשרית של התוסף ב־Dev) |
| `spec/ARCHITECTURE.md` | ADR-6 (Base Path לפי סוג הפקודה) ו־ADR-7 (מחולל אייקונים חד־פעמי) |
| `CLAUDE.md` | עדכון פקודות ההרצה: Preview נפתח ב־`http://localhost:4173/simon-/` |

אין שינוי בקוד המשחק, במסכים או באחסון.

## Base Path

```ts
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/simon-/' : '/',
  ...
}));
```

- `npm run dev` ממשיך להיפתח ב־`http://localhost:5173/` כמו היום.
- `npm run build` ו־`npm run preview` משתמשים ב־`/simon-/` — אותו נתיב שישמש ב־GitHub Pages. כך בדיקת ה־Offline המקומית נעשית בדיוק בתצורת הפריסה (כנדרש ב־DoD), ואבן דרך 5 רק מאמתת אותו מול הכתובת החיה.
- `vite preview` מגיש את `dist/` תחת אותו `base`, כלומר `http://localhost:4173/simon-/`.
- כתובת הלוגו כבר מגיעה מ־`import` של Vite ולכן מקבלת את ה־Base אוטומטית; הגופן מגיע מ־CSS שעובר דרך Vite.

## תצורת `VitePWA`

```ts
VitePWA({
  registerType: 'prompt',
  injectRegister: 'script',        // registers the SW only; no reload, no update UI
  devOptions: { enabled: false },  // SW off in dev
  includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
  manifest: {
    id: '/simon-/',
    name: 'סיימון',
    short_name: 'סיימון',
    lang: 'he',
    dir: 'rtl',
    display: 'standalone',
    start_url: '/simon-/#/',
    scope: '/simon-/',
    background_color: '#070F1C',
    theme_color: '#0D1A2C',
    icons: [64, 192, 512 (purpose any), maskable 512 (purpose maskable)],
  },
  workbox: {
    cacheId: 'simon-',
    globPatterns: ['**/*.{html,js,css,svg,png,ico,woff2,webmanifest}'],
    skipWaiting: false,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigateFallback: 'index.html',
  },
})
```

הערות:

- **`id`, ‏`start_url`, ‏`scope`** נגזרים מאותו Base. ‏`start_url` פותח את הבית (`#/`); המשחק תמיד מתחיל במצב „התחל” כי אין שמירת משחק פעיל.
- **צבעים** נלקחים מהטוקנים הקיימים ב־DESIGN: ‏`theme_color` = ראש הרקע המדורג (`#0D1A2C`), ‏`background_color` = תחתית הרקע (`#070F1C`, כמו `html` ב־CSS). אותו `theme-color` נכנס גם ל־`index.html`.
- **Precache:** ‏`globPatterns` מפורש כדי שגם `woff2` (הגופן), ‏PNG ו־ICO ייכללו. כל קובצי Heebo נכללים (כמה תתי־קבוצות קטנות), כך שהעברית תוצג גם Offline.
- **עדכון גרסה:** `registerType: 'prompt'` + ‏`skipWaiting: false` — גרסה חדשה ממתינה עד שכל החלונות של הגרסה הישנה נסגרים. אין קריאה ל־`updateSW`, אין Reload ואין הודעת עדכון או כפתור התקנה. `clientsClaim` מאפשר שליטה בעמוד כבר בביקור הראשון, כפי שמותר בסעיף 6 בארכיטקטורה.
- **Cache ID** ‏`simon-` ייחודי לפרויקט; ה־Service Worker נרשם תחת `/simon-/` בלבד, לא ברמת `dkzi78.github.io`.
- **PWA Registration** (מהטבלה בסעיף 2 בארכיטקטורה) ממומש על ידי `registerSW.js` שהתוסף מייצר — אין צורך במודול TypeScript משלנו כל עוד אין UI לעדכון.

## אייקונים

- `@vite-pwa/assets-generator` עם Preset ‏`minimal-2023` מייצר בדיוק את הגדלים הנדרשים בארכיטקטורה (192, ‏512, ‏Maskable 512, ‏Apple 180) ועוד 64 ו־favicon.
- המקור הוא `src/assets/logo.svg` הקיים — אותו סמל של האודות ושל לוח הבית.
- Maskable ו־Apple מקבלים רקע מלא `#0A1422` ו־Padding, כדי שהעיגול לא ייחתך בצורות האייקון של Android ושלא יוצג רקע לבן ב־iOS.
- לאחר היצירה — בדיקה חזותית של כל קובץ PNG.

## בדיקות

### Unit Tests
אין לוגיקת משחק חדשה, ולכן אין Unit Tests חדשים (ADR-1). כל הבדיקות הקיימות חייבות לעבור.

### בדיקות שאריץ בעצמי
1. `npm run typecheck`, ‏`npm test`, ‏`npm run build` — עוברים.
2. בדיקת `dist/`: קיימים `manifest.webmanifest`, ‏`sw.js`, ‏`registerSW.js` והאייקונים; ב־`sw.js` רשימת ה־Precache כוללת `index.html`, קובצי JS/CSS, הלוגו, כל קובצי ה־`woff2`, האייקונים וה־Manifest; מופיעים `cacheId` ‏`simon-` ואין `skipWaiting()`.
3. חיפוש ב־`dist/` שאין כתובות `http(s)://` חיצוניות לנכסים (CDN / גופן מרוחק).
4. `npm run preview` ופתיחת `http://localhost:4173/simon-/` בדפדפן המובנה: אין שגיאות בקונסולה; ה־Manifest נטען עם הערכים הנכונים; ה־Service Worker פעיל ושולט בעמוד, וה־Cache מכיל את כל הרשימה.
5. **Offline:** עצירת שרת ה־Preview (אין רשת כלל לאתר) ורענון — הבית נטען, אפשר לשחק, הצלילים מנוגנים, מעבר לאודות מציג לוגו ותוצאות, והשמירה מתעדכנת.
6. ב־Dev (`npm run dev`) אין Service Worker רשום.
7. בדיקת רגרסיה בגודל מובייל: משחק עד הפסד, שחק שוב, אודות, Back, רענון — כמו באבני הדרך הקודמות.

### בדיקה שתעשה אתה (אחרי הבנייה, בשלב „הרץ כדי שאבדוק”)
- „ניתן להתקנה”: ב־Chrome במחשב מופיע אייקון ההתקנה בשורת הכתובת; התקנה ופתיחה מהאייקון פותחות את הבית במצב „התחל”.
- Offline: אחרי טעינה מלאה — ניתוק (או עצירת השרת) ופתיחה מחדש.
- התקנה בטלפון אמיתי דורשת HTTPS ולכן תיבדק באבן דרך 5 על האתר החי.

## מחוץ להיקף
- GitHub Actions, הפעלת GitHub Pages ופריסה — אבן דרך 5.
- הודעת „גרסה חדשה זמינה” או כפתור התקנה מותאם — לא מוגדרים ב־spec.
- Runtime Caching — אין נתונים מהרשת.
