# GokulCV — Fix My CV + CV Version Control
# Antigravity Deployment Instructions

## What this does
Connects the ATS Score Checker to the CV Builder so users can fix their CV
in one click. Also adds CV version history to Supabase.

---

## STEP 1 — Run this SQL in Supabase first (before anything else)

Go to: Supabase Dashboard → Your project → SQL Editor → New Query
Paste and run the contents of `SUPABASE_SQL.sql`

---

## STEP 2 — Replace these files entirely

| File in repo                              | Use this file      |
|-------------------------------------------|--------------------|
| `src/services/supabase.js`                | `supabase.js`      |
| `src/components/ATSScoreChecker.jsx`      | `ATSScoreChecker.jsx` |

---

## STEP 3 — Patch PartTimeCVGenerator.jsx

Read `PartTimeCVGenerator_PATCH.js` carefully. It has 7 sections.
Apply each section to the existing `src/components/PartTimeCVGenerator.jsx`.

**Section 1 — Imports**
Add `import { saveCVVersion, saveCV, getUser } from '../services/supabase';`
after the existing imports at the top of the file.

**Section 2 — State variables**
After the last existing `const [xxx, setXxx] = useState(...)` line,
add the 4 new state variables shown in the patch.

**Section 3 — useEffect**
After the existing useEffect hooks, add the new useEffect that reads
sessionStorage for `gokulcv_ats_fix_context` and loads the current user.

**Section 4 — ATS Fix Mode Banner**
In the JSX return, find the main container div.
Add the ATS Fix Mode Banner as the very first child element,
before the sector selector (the buttons for Warehouse, Retail, etc.)

**Section 5 — buildAtsFixInstructions function**
Add this as a new function inside the component,
before the generate/submit handler.
Then modify the AI prompt to include `${buildAtsFixInstructions()}`
at the end of the system prompt or instructions string.

**Section 6 — Save version after generation**
Find where generated CV data is set into state after the AI call returns.
After that line, add the version save block.

**Section 7 — Save CV button**
Find where the Download PDF button is rendered.
Add the Save CV button next to it.

---

## STEP 4 — Build and deploy

```bash
npm run build
```

If build passes with 0 errors:
```bash
git add -A
git commit -m "feat: Fix My CV flow + CV version control + ATS scan history"
git push
```

---

## What to test after deploy

1. Go to /ats → upload CV → paste JD → Analyse
2. Click "Fix My CV with AI →"
3. CV builder should open with the blue ATS Fix Mode banner showing missing keywords
4. Generate the CV — it should target those keywords
5. Download or Save the CV
6. Go back to /ats and scan again — score should improve

---

## If something breaks

The ATS context passing uses `sessionStorage` — it clears automatically
after being read. If the banner doesn't appear in the builder,
check browser console for JSON parse errors from Section 3's try/catch.
