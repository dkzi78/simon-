# תוכנית — Milestone 5: פריסה אוטומטית ואימות במכשירים אמיתיים

מבוסס על `MILESTONES.md`, ‏`ARCHITECTURE.md` (סעיפים 7–8, ‏ADR-1, ‏ADR-6) ועל הקוד הקיים מאבן דרך 4.

## מה כבר קיים

- `vite.config.ts` עם `PAGES_BASE = '/simon-/'` ל־Build ול־Preview, ו־Manifest‏ (`id`, ‏`start_url`, ‏`scope`) שנגזרים ממנו (ADR-6). כלומר נתיבי האתר כבר מותאמים לכתובת החיה.
- `package.json` עם הסקריפטים `typecheck`, ‏`test`, ‏`build` (כולל `tsc --noEmit`), ‏`engines.node >=24`, ו־`package-lock.json`.
- ה־Remote הוא `dkzi78/simon-`; ענף `main` מסונכרן עם `origin/main`.
- נבדק ב־20.10.2026: ה־Repository **ציבורי**, ענף ברירת המחדל `main`, ו־GitHub Pages **עדיין לא מופעל** (`https://dkzi78.github.io/simon-/` מחזיר 404).
- אין תיקיית `.github/` ואין `README.md` בשורש.

כתובת האתר החי הצפויה: **`https://dkzi78.github.io/simon-/`** (אודות: `https://dkzi78.github.io/simon-/#/about`).

## קבצים חדשים

| קובץ | תוכן |
|---|---|
| `.github/workflows/deploy.yml` | Workflow הבדיקות והפריסה (פירוט למטה) |
| `README.md` | תיעוד קצר בעברית: מה זה, קישור לאתר החי, הרצה מקומית, איך הפריסה עובדת, ושחזור גרסה |

## קבצים שמשתנים

| קובץ | שינוי |
|---|---|
| `spec/ARCHITECTURE.md` | ADR-8: גרסאות ה־Actions שקובעו ל־Commit SHA ואופן העדכון שלהן |
| `spec/MILESTONES.md` | סימון 🟡 בסיום |

אין שינוי בקוד המשחק, במסכים, בתצורת ה־PWA או ב־Base Path — הם כבר מתאימים לכתובת החיה. אם האימות באתר החי יחשוף בעיית נתיבים, היא תתוקן כחלק מאבן הדרך.

## ה־Workflow — `.github/workflows/deploy.yml`

מבוסס על דוגמת GitHub Pages הרשמית של Vite, מפוצל לשני Jobs כדי שהרשאות הכתיבה יהיו רק בשלב הפריסה:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:          # manual re-run from the Actions tab

permissions:
  contents: read

concurrency:
  group: pages
  cancel-in-progress: false   # never cut a running deployment short

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1         # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1       # v7.1.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d  # v6.0.0
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9  # v5.0.0
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346    # v5.0.1
```

נקודות חשובות:

- **בדיקות לפני פרסום:** כל שלב שנכשל (`npm ci`, Type Checking, Unit Tests, Build) עוצר את ה־Job `build`, ולכן `deploy` לא רץ והגרסה החיה הקודמת נשארת.
- **הרשאות מצומצמות:** ברמת ה־Workflow רק `contents: read`; ‏`pages: write` ו־`id-token: write` רק ב־Job הפריסה. אין Personal Access Token ואין Secrets.
- **Concurrency:** קבוצה אחת `pages` — פריסה חדשה ממתינה לסיום הקודמת ואינה מבטלת אותה.
- **Actions מקובעים ל־Commit SHA** של הגרסה הרשמית האחרונה (נבדק ב־20.10.2026), עם הערת גרסה קריאה. יאומתו שוב בעת הבנייה.
- `workflow_dispatch` מאפשר הרצה ידנית מלשונית Actions (שימושי לפריסה חוזרת ללא Commit).

## בדיקה מקומית לפני הדחיפה (Claude)

1. `npm ci`, ‏`npm run typecheck`, ‏`npm test`, ‏`npm run build` — אותו רצף שה־Workflow מריץ.
2. `npm run preview` ובדיקה ב־`http://localhost:4173/simon-/` בגודל מובייל: הבית, אודות, Back, משחק קצר, ושאין שגיאות בקונסולה — לוודא שהזרימות מאבני הדרך הקודמות עדיין עובדות.
3. בדיקת תקינות קובץ ה־YAML (מבנה ושמות השלבים).

## צעדים שהמשתמש מבצע (בהדרכה צעד אחר צעד)

הסדר חשוב: יש להפעיל את Pages **לפני** הדחיפה הראשונה, אחרת הפריסה הראשונה תיכשל.

1. **אישור נראות ה־Repository:** ה־Repository כבר ציבורי. לאשר שזו הבחירה הרצויה (נדרש ל־Pages חינמי). לא משנים נראות בלי בקשה מפורשת.
2. **הפעלת Pages:** ב־GitHub ‏→ ה־Repository ‏`simon-` ‏→ **Settings** ‏→ **Pages** ‏→ תחת **Build and deployment** ‏→ **Source**: לבחור **GitHub Actions**. אין צורך ב־Custom Domain. (ה־Environment ‏`github-pages` נוצר אוטומטית.)
3. **אישור דחיפה:** לבקש "דחוף שינויים לגיטהאב" — זו גם הגרסה שתפורסם. רק לאחר מכן Claude מבצע Commit ו־Push ל־`main`.
4. **בדיקה בטלפון** (לאחר שהפריסה הצליחה) — ראו רשימת הבדיקות למטה.

הערה: לפי `CLAUDE.md`, ה־Push מבוצע רק באישור המשתמש. לכן בסיום שלב הבנייה אבן הדרך תסומן 🟡 כשה־Workflow מוכן ונבדק מקומית, אבל סעיפי DoD שתלויים באתר החי יסומנו "לא נבדק עדיין" עד אחרי הדחיפה. ✅ יסומן רק לאחר שכל הסעיפים אומתו.

## אימות לאחר הדחיפה (Claude)

1. מעקב אחרי הרצת ה־Workflow בלשונית Actions (דרך הדפדפן המובנה, קריאה בלבד) — וידוא ש־`build` ו־`deploy` הצליחו.
2. באתר החי, בדפדפן בגודל מובייל:
   - `https://dkzi78.github.io/simon-/` ו־`.../simon-/#/about` נפתחים ישירות; רענון בכל אחד מהם — ללא 404 וללא נכסים חסרים (בדיקת Network).
   - הכתובת ב־HTTPS; Manifest ו־Service Worker נטענים מתחת ל־`/simon-/`; האתר מזוהה כניתן להתקנה.
   - משחק קצר וניווט בין המסכים.
3. **בדיקת "כשל עוצר פרסום":** אימות על בסיס מבנה ה־Workflow (`deploy` תלוי ב־`build` דרך `needs`). בדיקה בפועל של כשל מכוון דורשת Commit נוסף ל־`main` — תבוצע רק אם המשתמש יבקש זאת במפורש (למשל ב־Commit זמני שמכשיל בדיקה, ואחריו Revert).

## בדיקות בטלפון של המשתמש

Claude ינחה צעד אחר צעד (Android ‏Chrome: תפריט ← "התקנת אפליקציה"; iPhone ‏Safari: שיתוף ← "הוספה למסך הבית"):

1. פתיחת הקישור, התקנה, ופתיחה מהאייקון — נפתח מסך הבית במצב התחלתי.
2. משחק: ארבעת הצלילים שונים ונשמעים; לחיצות מהירות נקלטות לפי הסדר.
3. מעבר לאפליקציה אחרת באמצע רצף וחזרה — הרצף מוצג מחדש.
4. קריאות עברית ו־RTL בשני המסכים; ניווט בית/אודות.
5. מצב טיסה ← סגירה ופתיחה מחדש מהאייקון — המשחק, הצלילים, אודות והתוצאות השמורות פועלים.

## README.md — תוכן התיעוד הקצר

- שורת תיאור + קישור לאתר החי.
- **הרצה מקומית:** `npm ci`, ‏`npm run dev`, ‏`npm test`, ‏`npm run build` + `npm run preview` (בדיקת Offline ב־`http://localhost:4173/simon-/`).
- **פריסה:** כל Push ל־`main` מריץ בדיקות ו־Build ומפרסם רק בהצלחה; מעקב בלשונית Actions; הרצה ידנית דרך "Run workflow".
- **שחזור גרסה:** `git revert <commit>` ו־Push ל־`main` ← פריסה חוזרת אוטומטית. משתמשים שהתקינו יקבלו את הגרסה בפתיחה הבאה עם רשת (ה־Service Worker ממתין, ללא Reload באמצע משחק).
- הערה: שינוי שם ה־Repository מחייב לעדכן את `PAGES_BASE` ב־`vite.config.ts`.

## ADR-8 (יתווסף ל־ARCHITECTURE.md)

**ADR-8: Workflow פרסום בשני Jobs עם Actions מקובעים ל־SHA** — הקשר: ARCHITECTURE דורש הרשאות מצומצמות וקיבוע Actions. החלטה: Job ‏`build` עם הרשאת קריאה בלבד ו־Job ‏`deploy` עם `pages`/`id-token`; כל Action מקובע ל־Commit SHA עם הערת גרסה. השלכות: עדכון Action נעשה ידנית (החלפת SHA); אין Dependabot בשלב זה.

## Definition of Done — איך כל סעיף ייבדק

| סעיף | אימות |
|---|---|
| קישור לאתר החי ולקוד; נראות תואמת לבחירה | הקישורים בסיכום; אישור מפורש של המשתמש שהציבוריות רצויה |
| Push מפעיל בדיקות ופריסה; כשל עוצר פרסום | ריצה ירוקה ב־Actions; `needs: build` במבנה ה־Workflow (בדיקת כשל בפועל רק לבקשת המשתמש) |
| HTTPS, כניסה ישירה ורענון בבית ובאודות ללא 404 | בדיקה בדפדפן המובנה + Network |
| בטלפון: התקנה, צלילים, לחיצות מהירות, רקע, RTL, Offline | בדיקה של המשתמש לפי ההנחיות; Claude ממתין לתוצאה |
| תיעוד הפעלה, פריסה ושחזור | `README.md` קיים ב־Repository |
| (כלל 5) Type Checking, ‏Unit Tests, ‏Build והזרימות הקודמות | הרצה מקומית ובדיקת Preview בגודל מובייל |

## מחוץ להיקף

- דומיין מותאם, Workflow ל־PR, בדיקות דפדפן אוטומטיות, Dependabot.
- שינוי נראות ה־Repository, שינוי כללי המשחק או הוספת מסכים.
