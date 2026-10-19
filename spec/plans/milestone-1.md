# תוכנית — Milestone 1: פרויקט ניתן להרצה ולבדיקה

מבוסס על `MILESTONES.md` (Milestone 1), `ARCHITECTURE.md` (סעיף 1, ‏8 ו־ADR-1) ו־`PRD.md` (סעיף 5). אבן דרך טכנית בלבד: אין בה משחק, ניווט, שמע, PWA או פרסום.

## 0. תנאי מקדים — Node.js 24 LTS

Node.js ו־npm אינם מותקנים כרגע במחשב (נבדק). בלעדיהם אי אפשר להתקין או לבנות את הפרויקט.

- התקנה באמצעות `winget install OpenJS.NodeJS.LTS`, לאחר אישור המשתמש. אם ה־LTS שמותקן אינו מגרסה 24, מתקינים במפורש גרסת 24.x.
- אימות: `node --version` מחזיר `v24.x` ו־`npm --version` עובד. ייתכן שיידרש לפתוח מחדש את הסשן כדי שה־PATH יתעדכן.
- אם ההתקנה דורשת פעולה של המשתמש (אישור הרשאות מנהל ב־Windows) — עוצרים ומדריכים אותו.

## 1. קבצים ליצור

| קובץ | תוכן |
|---|---|
| `package.json` | שם `simon`, ‏`"private": true`, ‏`"type": "module"`, ‏`engines.node: ">=24"`, הסקריפטים בסעיף 3 ו־devDependencies בגרסאות מדויקות (ללא `^`) |
| `package-lock.json` | נוצר מ־`npm install` ונשמר ב־Git |
| `.npmrc` | `save-exact=true`, כדי שכל חבילה שתתווסף בהמשך תקובע לגרסה מדויקת |
| `tsconfig.json` | תצורת `vanilla-ts` של Vite, עם `"strict": true`, ‏`"noEmit": true` ו־`"types": ["vite/client"]` |
| `vite.config.ts` | תצורה מינימלית: `base: '/'` והגדרת `test` של Vitest (סביבת `node`, קבצי `src/**/*.test.ts`) |
| `index.html` | `<html lang="he" dir="rtl">`, ‏`<meta charset="UTF-8">`, ‏Viewport למובייל, `<title>סיימון</title>`, טעינת `src/main.ts` |
| `src/main.ts` | מייבא את `style.css` ומציג בתוך `#app` כותרת **„סיימון”** וכותרת משנה **„משחק זיכרון עם אורות וצלילים”** באמצעות `textContent` (לא `innerHTML`) |
| `src/style.css` | ה־Color Tokens של DESIGN כ־CSS Custom Properties (`--blue`, ‏`--red`, ‏`--yellow`, ‏`--green`, ‏`--ink`, ‏`--silver`, ‏`--canvas`, ‏`--muted`), רקע Canvas, טקסט Ink, עמודה אחת ממורכזת, ללא גלילה אופקית. גופן זמני: `Arial, sans-serif` (Heebo המקומי נוסף ב־Milestone 2) |
| `src/config.ts` | קבועי המשחק מ־ARCHITECTURE: ארבעת הצבעים לפי הסדר `blue`, ‏`red`, ‏`yellow`, ‏`green`; ‏10 שלבים; ‏600 ms לצבע; ‏300 ms בין צבעים; ‏600 ms בין שלבים. רק קבועים, ללא לוגיקה |
| `src/config.test.ts` | בדיקת Vitest לדוגמה: 4 צבעים שונים, 10 שלבים, ערכי התזמון. מאמתת שהתשתית עובדת ומשמשת בסיס לבדיקות החוקים ב־Milestone 2 |
| `.claude/launch.json` | הגדרת `dev` (`npm run dev`, פורט 5173) ו־`preview` (`npm run preview`, פורט 4173) להרצה בדפדפן המובנה |

**קבצים קיימים:** `.gitignore` כבר כולל `node_modules/` ו־`dist/`, ולכן אין צורך לשנות אותו. מסמכי `spec/` אינם משתנים, מלבד סימון ה־🟡 ב־`MILESTONES.md` בסיום. `CLAUDE.md` מתעדכן רק בסעיף **פקודות הרצה** (סעיף 5).

## 2. חבילות

devDependencies בלבד; אין dependencies של Runtime.

- `vite` ‏8.3.4
- `vitest` ‏5.0.5
- `typescript` — הגרסה היציבה האחרונה בעת ההתקנה, מקובעת מדויק

לפני ההתקנה בודקים ב־npm שהגרסאות האלה קיימות ושה־peer dependencies של Vitest מתאימים ל־Vite 8. אם יש אי־התאמה — עוצרים ומדווחים, בלי לבחור גרסה אחרת על דעת עצמנו. `vite-plugin-pwa` **לא** מותקן באבן דרך זו (Milestone 4).

הפרויקט נכתב ידנית במקום להריץ `npm create vite`, כי תיקיית הפרויקט אינה ריקה, והכלי היה יוצר קבצי דוגמה מיותרים (מונה, לוגו של Vite) שצריך למחוק.

## 3. סקריפטים ב־`package.json`

| סקריפט | פקודה | שימוש |
|---|---|---|
| `dev` | `vite` | שרת פיתוח מקומי |
| `typecheck` | `tsc --noEmit` | בדיקת טיפוסים |
| `test` | `vitest run` | הרצת ה־Unit Tests פעם אחת |
| `build` | `tsc --noEmit && vite build` | בדיקת טיפוסים ואז יצירת `dist/` |
| `preview` | `vite preview` | הגשת `dist/` מקומית לבדיקה |

## 4. בדיקה עצמית (לפני סימון 🟡)

לפי ה־Definition of Done של Milestone 1:

1. **התקנה עקבית:** מוחקים את `node_modules/` ומריצים `npm ci` — ההתקנה מצליחה מה־Lockfile.
2. **Type Checking ו־Build:** ‏`npm run typecheck` ו־`npm run build` עוברים, ו־`dist/` נוצר עם `index.html` ונכסים.
3. **Unit Tests:** ‏`npm test` — בדיקת `config.test.ts` עוברת.
4. **Dev:** מריצים `npm run dev`, פותחים בדפדפן המובנה בגודל מובייל (375×812), ומוודאים שהכותרת וכותרת המשנה מוצגות בעברית תקינה ומיושרות כראוי, ש־`document.documentElement.lang === "he"` ו־`dir === "rtl"`, שאין שגיאות בקונסולה ושאין גלילה אופקית.
5. **Preview:** אותה בדיקה מול `npm run preview` (תוצר ה־Build).
6. **ללא שרת ומסד נתונים:** אין בקשות רשת מלבד הנכסים המקומיים.
7. סוגרים את שרתי ה־dev וה־preview בסיום.

## 5. עדכונים בסיום

- `CLAUDE.md`, בסעיף **פקודות הרצה**: הרצה (dev) — `npm run dev`; בדיקות (test) — `npm test`.
- `MILESTONES.md`: סימון 🟡 ליד הכותרת של Milestone 1.
- אין commit ואין push.

## 6. מחוץ לטווח של אבן דרך זו

לוח המשחק, כפתורים, Heebo, שמע, ניווט ומסך אודות, Local Storage, PWA ו־Service Worker, GitHub Actions ופרסום ל־Pages, וקביעת ה־`base` הסופי לפי שם ה־Repository (נדחה ל־Milestone 4/5).

## 7. נקודות פתוחות

- **התקנת Node.js** — דורשת את אישור המשתמש בתחילת הבנייה (סעיף 0).
- **`spec/wireframes.zip`** — עותק כפול של קבצי ה־spec. אינו נוגע לאבן הדרך; נמחק רק באישור המשתמש.
