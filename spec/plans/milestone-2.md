# תוכנית — Milestone 2: משחק שלם במסך הבית

מבוסס על `MILESTONES.md` (Milestone 2), `PRD.md` (סעיפים 3–4), `ARCHITECTURE.md` (סעיפים 2–5) ו־`DESIGN.md` (סעיפים 1.1, ‏2) עם `mockups.png`, ‏`wireframes.png` ו־`style-guide.png`.

**בהיקף:** מסך בית מעוצב, משחק מלא של 10 שלבים, צלילים, הדגשות, הודעות סיום, השהיה בהסתרת המסמך.
**מחוץ להיקף (Milestone 3 ואילך):** מסך אודות, Bottom Navigation, Hash Navigation, ‏Score Repository ו־Local Storage, לוגו, PWA.

## 0. נקודת מוצא

- קיים: Vite + TypeScript ‏`strict`, ‏Vitest, ‏`src/config.ts` (צבעים, 10 שלבים, 600/300/600 ms), ‏`src/style.css` עם ה־Color Tokens, ‏`src/main.ts` עם מסך Placeholder.
- `.npmrc` כולל `save-exact=true`, כך שכל חבילה חדשה מקובעת לגרסה מדויקת.

## 1. החלטות מימוש לאבן דרך זו

1. **Bottom Navigation לא מוצג ב־Milestone 2.** ה־Mockup מציג אותו, אבל MILESTONES אוסר להציג ניווט לאודות כפעיל לפני שהוא ממומש, ו־Milestone 3 מגדיר במפורש את בנייתו. משאירים מקום בתחתית לפי ה־Safe Area בלבד; הניווט נוסף ב־Milestone 3.
2. **Heebo מקומי** באמצעות החבילה `@fontsource-variable/heebo` (קובץ גופן אחד משתנה, תת־קבוצות `hebrew` ו־`latin`). Vite מעתיק את קובצי הגופן ל־`dist/` — אין טעינה מ־CDN או מ־Google Fonts. מתועד כ־ADR.
3. **מיקום מצבי המשחק** (לא מצוירים ב־Mockup, ולכן ללא Layout חדש): שורת סטטוס אחת בין הלוח לכפתור הפעולה, באותה טיפוגרפיה (Label/Body):
   - `idle`: ריקה (המסך נראה כמו ה־Mockup).
   - `presenting`: **„שלב N מתוך 10 · צפה ברצף”**.
   - `acceptingInput`: **„שלב N מתוך 10 · תורך”**.
   - `betweenRounds`: **„שלב N מתוך 10”** (N = השלב שהושלם) — ללא „תורך”.
   - `lost`: **„המשחק הסתיים”** ומתחתיה **„השלמת N שלבים”** (או **„לא הושלמו שלבים”** כש־N=0).
   - `won`: **„כל הכבוד! השלמת את כל 10 השלבים”** ומתחתיה **„תוצאה: 10”**.
   לשורה גובה מינימלי קבוע כדי שהלוח והכפתור לא יקפצו בין מצבים. אזור הסטטוס הוא `aria-live="polite"`.
4. **כפתור הפעולה:** ב־`idle` — **„התחל”** (כפתור ראשי כהה). ב־`lost`/`won` — **„שחק שוב”** (כפתור משני Silver לפי ה־Style Guide). בזמן משחק הכפתור מוסתר עם `visibility: hidden` (שומר על המקום ולא גורם לקפיצה).
5. **משוב על לחיצת שחקן:** אור וצליל באורך 300 ms (חצי ממשך הצגת צבע ברצף), כך שלחיצות מהירות לא "נבלעות" בתוך משוב ארוך. לחיצה חוזרת על אותו צבע מפעילה את המשוב מחדש. ערך מימוש בלבד; מתועד כ־ADR. לחיצה שגויה מקבלת את אותו משוב של הצבע שנלחץ, ואז מוצגת הודעת ההפסד (בלי צליל "שגיאה" נוסף — לא הוגדר ב־spec).
6. **מיקום הצבעים בלוח** נקבע במפורש באמצעות `grid-template-areas` ("אדום כחול" / "ירוק צהוב" כשהלוח בכיווניות `ltr`), כך ש־RTL לא יהפוך אותם: כחול למעלה מימין, אדום למעלה משמאל, צהוב למטה מימין, ירוק למטה משמאל.
7. **אין שמירת הישגים** באבן דרך זו. ה־Engine כבר מחזיר תוצאה עסקית ("שלב הושלם" / "הפסד" / "ניצחון"), וה־Controller יחבר אליה את השמירה ב־Milestone 3.

## 2. קבצים ליצור / לשנות

| קובץ | פעולה | תוכן |
|---|---|---|
| `package.json`, ‏`package-lock.json` | שינוי | הוספת `@fontsource-variable/heebo` כ־dependency (גרסה מדויקת) |
| `src/config.ts` | שינוי | הוספת: תוויות הצבעים בעברית (`כחול`, `אדום`, `צהוב`, `ירוק`), תדרים (330/440/554/659 Hz), ‏`PRESS_FEEDBACK_MS = 300`, משך Fade של הצליל (כ־10 ms) |
| `src/game/engine.ts` | חדש | Game Engine טהור — ללא DOM, שמע, Timers או אחסון (סעיף 3) |
| `src/game/engine.test.ts` | חדש | Unit Tests לפי ה־DoD (סעיף 7) |
| `src/game/scheduler.ts` | חדש | Playback Scheduler (סעיף 4) |
| `src/audio/audio.ts` | חדש | Audio Adapter על Web Audio (סעיף 5) |
| `src/game/controller.ts` | חדש | Game Controller — מקור האמת למצב הפעיל (סעיף 6) |
| `src/ui/home-view.ts` | חדש | בניית ה־DOM של מסך הבית פעם אחת ו־`render(state)` שמעדכן טקסטים ומחלקות בלבד |
| `src/main.ts` | שינוי | ייבוא הגופן וה־CSS, יצירת Audio, ‏Scheduler, ‏Controller ו־Home View וחיבורם; האזנה ל־`visibilitychange` |
| `src/style.css` | שינוי | עיצוב מסך הבית לפי DESIGN (סעיף 8) |
| `src/config.test.ts` | ללא שינוי | ממשיך לעבור |
| `spec/ARCHITECTURE.md` | הוספה | ADR-2 (Heebo דרך Fontsource), ‏ADR-3 (משוב לחיצה 300 ms ושורת סטטוס בין הלוח לכפתור) |
| `spec/MILESTONES.md` | סימון | 🟡 ליד כותרת Milestone 2 בסיום הבנייה |

## 3. Game Engine — `src/game/engine.ts`

טיפוסים:

```ts
type Phase = 'idle' | 'presenting' | 'acceptingInput' | 'betweenRounds' | 'paused' | 'lost' | 'won';
interface GameState {
  phase: Phase;
  sequence: Color[];          // length 0–10
  completedRounds: number;    // 0–10, the score
  inputIndex: number;
  pausedFrom: Phase | null;   // phase to resume from when paused
}
type Random = () => number;   // injected; defaults to Math.random
```

פונקציות טהורות (מחזירות מצב חדש ותוצאה; לא משנות את הקלט):

| פונקציה | התנהגות |
|---|---|
| `createInitialState()` | `idle`, רצף ריק, ‏0 שלבים |
| `startGame(random)` | רצף חדש עם צבע אחד, `presenting` (משמש גם ל„שחק שוב”) |
| `playbackFinished(state)` | רק מ־`presenting`: ‏`acceptingInput`, ‏`inputIndex = 0`; אחרת ללא שינוי |
| `inputColor(state, color, random)` | רק ב־`acceptingInput`, אחרת `{ outcome: 'ignored' }` ללא שינוי. צבע שגוי ← `lost` (‏`completedRounds` נשאר), ‏`outcome: 'lost'`. נכון באמצע ← קידום `inputIndex`, ‏`'correct'`. נכון בסוף ← `completedRounds + 1`; אם 10 ← `won`, ‏`'won'`; אחרת מוסיף מיד צבע אחד לסוף הרצף (בלי לשנות קודמים) ← `betweenRounds`, ‏`'roundComplete'` |
| `nextRoundReady(state)` | רק מ־`betweenRounds`: ‏`presenting` |
| `pause(state)` | מ־`presenting` / `acceptingInput` / `betweenRounds` ← `paused` עם `pausedFrom`; אחרת ללא שינוי |
| `resume(state)` | רק מ־`paused`: ‏`presenting`, ‏`inputIndex = 0`, אותו רצף (גם אם הושהה ב־`betweenRounds` — הרצף של השלב הבא כבר נוצר, ואין הגרלה נוספת) |

הגרלה: `COLORS[Math.floor(random() * 4)]`. אין יצירה של שלב 11.

## 4. Playback Scheduler — `src/game/scheduler.ts`

- `play(sequence, generation, callbacks)`: מחשב לכל פריט i מועד התחלה מוחלט `t0 + i × (600 + 300)` לפי `performance.now()` בתחילת ההצגה. לכל פריט: `onLight(color)` במועד ההתחלה ו־`onLight(null)` אחרי 600 ms; השמע מתוזמן מראש דרך ה־Audio Adapter על שעון ה־AudioContext באותם היסטים. אחרי כיבוי הפריט האחרון — `onFinished()`.
- כל Timeout מחושב מחדש מול השעון המוחלט (`target - performance.now()`), כך ששגיאות לא מצטברות.
- `cancel()`: מנקה את כל ה־Timers, מבקש מה־Audio לעצור צלילים שתוזמנו, ומכבה אור. כל Callback בודק שה־`generation` שלו הוא עדיין הפעיל, ואם לא — לא עושה דבר.
- `delay(ms, generation, cb)`: הפסקה בין שלבים (600 ms) עם אותו מנגנון ביטול.

## 5. Audio Adapter — `src/audio/audio.ts`

- `unlock()`: נקרא מתוך הלחיצה על „התחל”/„שחק שוב” (וגם בכל לחיצה על צבע, ליתר ביטחון). יוצר `AudioContext` יחיד בפעם הראשונה ומפעיל `resume()`. אם אין תמיכה, נזרקת שגיאה או ה־Context לא עובר ל־`running` — מסמן `available = false`.
- `playTone(color, startOffsetSec, durationSec)`: Oscillator (גל `sine`) בתדר הצבע ← Gain עם עלייה וירידה של כ־10 ms (מונע קליקים) ← יציאה. שומר הפניה לכל Oscillator פעיל.
- `stopAll()`: עוצר ומנתק את כל ה־Oscillators הפעילים והעתידיים.
- כל קריאה עטופה ב־`try/catch`; כשל לא זורק החוצה, רק מעדכן `available = false` ומודיע ל־Controller. המשחק החזותי ממשיך תמיד.

## 6. Game Controller — `src/game/controller.ts`

- מחזיק את `GameState`, ‏`activeColor`, ‏`generation` (מספר עולה) ו־`audioAvailable`. אחרי כל שינוי קורא ל־`onChange(viewState)` שמעביר ל־View.
- **מעבר סינכרוני לפני Side Effects:** כל אירוע מחשב את המצב החדש דרך ה־Engine, שומר אותו, ורק אז מפעיל אור/צליל/Timers. כך שתי לחיצות מהירות לא ישלימו את אותו שלב פעמיים.
- פעולות:
  - `start()` (גם „שחק שוב”): `unlock()` לשמע, ‏`cancel()` והעלאת `generation`, ‏`startGame`, ‏`play`.
  - `press(color)`: אם המצב אינו `acceptingInput` — מתעלמים לגמרי (בלי משוב). אחרת: `inputColor` ← משוב 300 ms (אור + צליל). Timer הכיבוי של המשוב שומר מזהה משלו, כדי שכיבוי ישן לא יכבה משוב חדש. לפי ה־outcome: `roundComplete` ← `delay(600)` ואז `nextRoundReady` ו־`play`; ‏`lost`/`won` ← סיום (ביטול Timers של Playback; המשוב של הלחיצה האחרונה מסתיים בטבעיות).
  - `pause()` / `resume()`: ביטול כל ה־Timers והצלילים, העלאת `generation`; בחזרה — `resume` של ה־Engine ו־`play` מחדש של כל הרצף. ממצב `idle`/`lost`/`won` אין חידוש משחק.
- `main.ts`: ‏`document.hidden` ← `pause()`; חזרה לגלוי ← `resume()`. רענון יוצר Controller חדש ב־`idle` (אין שחזור).
- הודעת שמע: כש־`audioAvailable` הוא `false` מוצגת **„הצלילים אינם זמינים כעת”** בשורת הודעה קטנה (טקסט Muted) מתחת לשורת הסטטוס.

## 7. Unit Tests — `src/game/engine.test.ts`

עם `random` מוזרק (פונקציה שמחזירה ערכים קבועים מראש):

1. השלמת שלב מוסיפה בדיוק צבע אחד, והצבעים הקודמים זהים לחלוטין.
2. חזרות מותרות: `random` שמחזיר תמיד 0 נותן רצף `blue, blue, …`, והמשחק מקבל אותו.
3. ניקוד: `completedRounds` גדל רק בהשלמת הרצף המלא; לחיצה נכונה באמצע לא משנה אותו.
4. הפסד בטעות הראשונה: צבע שגוי ← `lost`, הניקוד = מספר השלבים שהושלמו לפני כן (כולל 0 בשלב 1); לחיצה נוספת אחרי ההפסד מחזירה `ignored`.
5. משחק מלא באקראיות נשלטת: השלמת 10 שלבים ← `won`, ניקוד 10, אורך רצף 10; אין שלב 11 (`nextRoundReady` ולחיצות אחרי `won` לא משנים דבר).
6. לחיצה ב־`presenting`, ‏`betweenRounds`, ‏`paused` ו־`idle` מחזירה `ignored` ללא שינוי מצב.
7. השהיה וחזרה: הרצף לא משתנה, ‏`inputIndex` מתאפס, ואין קריאה ל־`random` בזמן החזרה (גם כשההשהיה הייתה ב־`betweenRounds`).

`config.test.ts` הקיים ממשיך לרוץ.

## 8. עיצוב מסך הבית — `src/style.css` ו־`home-view.ts`

מבנה ה־DOM (מלמעלה למטה), עמודה אחת ממורכזת עם רוחב תוכן מרבי מתאים לטלפון:

1. `h1` **„סיימון”** — 32/40/800.
2. כותרת משנה **„משחק זיכרון עם אורות וצלילים”** — Body.
3. לוח: מסגרת Housing ‏`#11131B`, Stroke של 6 px, פינות מעוגלות, Gap כהה. ריבוע (`aspect-ratio: 1`) שרוחבו נגזר מרוחב המסך (עם הגבלה לגובה כדי שהכל ייכנס במסך טלפון). ארבעה `<button>` אמיתיים, כל אחד בצבעו מה־Tokens, עם התווית בעברית במרכז בטקסט Ink כבד וגדול, ‏`aria-label` עם שם הצבע.
   - מראה פלסטיק: קו מתאר כהה, הדגשה פנימית (`inset` box-shadow בהיר בחלק העליון וכהה בתחתון), Radius של 16 px.
   - **Active** (`.is-active`, בזמן הצגה ובמשוב לחיצה): הבהרה (`filter: brightness`) והילה/שפה פנימית בהירה שעוקבת אחר צורת הכפתור, בהשראת „Pad states” ב־Style Guide. התווית והגוון נשמרים.
   - כשהקלט סגור — `aria-disabled="true"` וסמן רגיל; לא משתמשים ב־`disabled`, כדי לא לאבד Focus.
4. שורת סטטוס + שורת הודעת שמע (סעיף 1.3, סעיף 6).
5. כפתור פעולה: ראשי — Near-black, טקסט לבן 18/24/700, ‏Radius 16 px, היילייט עליון עדין, רוחב כמעט מלא; משני („שחק שוב”) — Silver, טקסט כהה, מסגרת ועומק עדין.

כללי:
- גופן `Heebo, Arial, sans-serif` עם הגופן המקומי.
- Focus גלוי: ‏`outline: 3px` בכל הכפתורים (`:focus-visible`).
- כל אזורי המגע לפחות 48 px; אין גלילה אופקית; ריווח לפי הסולם 4/8/16/24/32; ‏Safe Areas באמצעות `env(safe-area-inset-*)`.
- `touch-action: manipulation` על הכפתורים כדי למנוע השהיית Double-Tap Zoom במובייל, ומסלול אירוע יחיד — `click` בלבד.
- כל הטקסטים נכתבים דרך `textContent` (לא `innerHTML`). ה־Listeners נרשמים פעם אחת בבניית ה־View.

## 9. בדיקה עצמית בסיום הבנייה

1. `npm run typecheck`, ‏`npm test`, ‏`npm run build` — כולם עוברים.
2. `dev` בדפדפן המובנה בגודל מובייל (375×812): השוואה ל־Mockup (מבנה, מיקום הצבעים, RTL, קריאות), ללא שגיאות בקונסולה, ללא גלילה אופקית, מדידת גודל כפתורים ≥ 48 px.
3. משחק ידני עד הפסד ואז „שחק שוב”; לחיצות בזמן הצגה ואחרי סיום לא משנות דבר; לחיצות מהירות נקלטות לפי הסדר.
4. משחק שלם עד 10 (לבדיקה בלבד — באמצעות קריאת הרצף מהקונסולה של כלי הבדיקה, בלי להוסיף קוד דיבאג למוצר).
5. סימולציית הסתרת מסמך (`visibilitychange`) באמצע הצגה ובאמצע הזנה — בחזרה מוצג הרצף מתחילתו.
6. סימולציה של כשל שמע — מופיעה „הצלילים אינם זמינים כעת” והמשחק ממשיך.
7. Build + ‏Preview נפתחים והגופן נטען מקומית (אין בקשות רשת חיצוניות).
8. סגירת השרתים, סימון 🟡 ב־MILESTONES.md, ללא Commit.

**דורש בדיקה שלך (לא ניתן לי לאמת):** שהצלילים נשמעים בפועל ושונים זה מזה, ושהקצב מרגיש אחיד — במחשב ובטלפון.

## 10. Definition of Done — מיפוי

| תנאי | איך נבדק |
|---|---|
| Unit Tests לחוקי המשחק | סעיף 7, ‏`npm test` |
| משחק עד הפסד והתחלה מחדש; קצב אחיד; התעלמות מלחיצות לא בזמן | סעיף 9.3 + בדיקה שלך |
| לחיצות מהירות לפי הסדר, ללא כפילות | סעיף 9.3, Controller סינכרוני (סעיף 6) |
| צלילים והדגשות; הודעת כשל שמע | סעיפים 5, 9.6 + בדיקה שלך |
| חזרה מרקע ורענון | סעיף 9.5; רענון ← „התחל” |
| התאמה ל־DESIGN במובייל, אין גלילה אופקית, מגע ≥ 48 px | סעיף 9.2 |
| Type Checking, ‏Unit Tests, ‏Build | סעיף 9.1 |
