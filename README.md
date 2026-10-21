# סיימון

משחק זיכרון של צבעים וצלילים, בעברית, שעובד גם בלי אינטרנט ואפשר להתקין אותו בטלפון.

**לשחק:** https://dkzi78.github.io/simon-/

## הרצה מקומית

דרוש Node.js 24.

```bash
npm ci            # install exact versions from the lockfile
npm run dev       # http://localhost:5173
npm test          # unit tests
npm run build     # type checking + build into dist/
npm run preview   # http://localhost:4173/simon-/ (PWA and offline check)
```

ה־Service Worker פעיל רק ב־Build וב־Preview, לא ב־Dev.

## פריסה

- כל Push לענף `main` מפעיל את ה־Workflow ‏`.github/workflows/deploy.yml`: התקנה, Type Checking, ‏Unit Tests ו־Build.
- רק אם הכול הצליח, `dist/` מתפרסם ל־GitHub Pages. כשל משאיר את הגרסה החיה הקודמת.
- מעקב: לשונית **Actions** ב־GitHub. הרצה ידנית: **Actions ← Deploy to GitHub Pages ← Run workflow**.
- הגדרה חד־פעמית: **Settings ← Pages ← Source: GitHub Actions**.

## שחזור גרסה

```bash
git revert <commit>
git push
```

ה־Push מפעיל פריסה חוזרת של הגרסה המשוחזרת. מי שהתקין את האפליקציה יקבל אותה בפתיחה הבאה עם אינטרנט (העדכון ממתין ואינו מרענן באמצע משחק).

## הערות

- שינוי שם ה־Repository מחייב לעדכן את `PAGES_BASE` ב־`vite.config.ts`.
- שינוי בלוגו: `npm run icons`, ושמירת האייקונים שנוצרו ב־`public/`.
