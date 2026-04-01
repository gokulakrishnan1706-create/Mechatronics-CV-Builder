# AI Content Generation Pipeline — GokulCV

> Reference guide for AI assistants working on the content generation, API calls, rewriting, and PDF fitting logic.
> Last updated: 2026-03-15

---

## Overview

GokulCV has **4 independent AI pipelines**. Each uses different providers, prompts, and data flows. Understanding which pipeline fires when is critical before making changes.

```
┌─────────────────────────────────────────────────────────┐
│                    AI PIPELINES                         │
├─────────────┬───────────────────────────────────────────┤
│ Pipeline    │ Trigger → File → Provider                 │
├─────────────┼───────────────────────────────────────────┤
│ 1. Tailor   │ Builder JD paste → ai.js → Groq/OR       │
│ 2. Optimise │ Part-Time CV upload → pdfExtract → Groq   │
│             │   (image CVs → Gemini Vision)             │
│ 3. Polish   │ Part-Time ✨ buttons → PartTimeCVGen → Groq│
│ 4. Typeset  │ PDF render → AILayoutEngine → Gemini SDK  │
└─────────────┴───────────────────────────────────────────┘
```

---

## Pipeline 1: CV Tailoring (Builder / SmartCV)

**Files:** `App.jsx` → `src/services/ai.js`
**Trigger:** User pastes a Job Description in MatchEngine and clicks "Tailor"
**Provider:** Groq (primary) → OpenRouter (fallback)

### Flow

```
User pastes JD in Builder/SmartCV
  ↓
App.jsx: handleTailor(jd)
  ↓
ai.js: tailorResume(resumeData, jobDescription)
  ↓
CV_WRITING_ALGORITHM system prompt + user's resume JSON + JD text
  ↓
callGroq() → POST https://api.groq.com/openai/v1/chat/completions
  model: 'openai/gpt-oss-120b'
  temperature: 0.4
  max_tokens: 4096
  response_format: { type: 'json_object' }
  ↓
If Groq fails → callOpenRouter() fallback
  model: 'meta-llama/llama-3.3-70b-instruct:free'
  ↓
parseJSON() → sanitiseDeep() → strips HTML entities
  ↓
ATS scoring: MECHATRONICS_TAXONOMY matching + impactScore + semanticScore
  finalMatchScore = (semanticScore × 0.4) + ontologyScore + impactScore
  ↓
Returns: { ...tailoredCV, match_score, missing_keywords, extra_metrics }
  ↓
App.jsx: setResumeData(synthesizedCV) — replaces all CV fields in state
```

### Key Details

- **CV_WRITING_ALGORITHM** (lines 41–103 in `ai.js`): A massive system prompt baked into every call. Contains tone rules, banned words, UK English requirements, quantification rules, sector-specific language, and compound word handling.
- **Input:** Full `resumeData` JSON + JD text (truncated to 6000 chars)
- **Output JSON structure:** Must match exactly: `personal`, `personal_profile`, `education`, `professional_qualifications`, `work_experience` (with `achievements` array), `extra_curricular`, plus `semanticScore`, `foundSkills`, `missingCrucialSkills`, `impactCritique`, `contextualSuggestions`
- **The AI completely rewrites the CV** — it's not a merge, it's a full replacement of all resume fields
- **ATS scoring** is computed client-side after the AI call, not by the AI itself. It's a weighted blend of the AI's `semanticScore`, keyword ontology matching, and impact verb counting.

### Environment Variables Used
- `VITE_GROQ_API_KEY` — for Groq API
- `VITE_OPENROUTER_API_KEY` — for OpenRouter fallback

---

## Pipeline 2: CV Upload & Optimise (Part-Time Generator)

**Files:** `PartTimeCVGenerator.jsx` → `src/services/pdfExtract.js`
**Trigger:** User uploads a PDF/image CV in the upload screen and clicks "Optimise"
**Provider:** Groq/OpenRouter (for PDFs) or Gemini Vision (for images)

### Flow

```
User uploads CV file + optional JD
  ↓
PartTimeCVGenerator.jsx: handleOptimise()
  ↓
┌── PDF file? ──────────────────────────────────────┐
│ pdfExtract.js: extractTextFromPDF(file)           │
│   → Uses PDF.js (loaded from CDN, runs in browser)│
│   → Returns raw text string                       │
│                                                    │
│ pdfExtract.js: buildExtractionPrompt(cvText, jd)  │
│   → Builds extraction prompt with JSON schema     │
│   → If JD provided: adds tailoring instructions   │
│                                                    │
│ pdfExtract.js: structureWithGroq(prompt)           │
│   → Groq: 'openai/gpt-oss-120b', temp 0.2         │
│   → Fallback: OpenRouter 'llama-3.3-70b:free'     │
│   → Returns raw JSON string                       │
└───────────────────────────────────────────────────┘

┌── Image file? (JPG/PNG) ──────────────────────────┐
│ Convert to base64 via FileReader                   │
│ POST to Gemini Vision API (REST, not SDK):         │
│   generativelanguage.googleapis.com/v1beta/models/ │
│   gemini-2.5-flash-preview-05-20:generateContent   │
│   Body: { contents: [{ parts: [                    │
│     { inline_data: { mime_type, data: base64 } },  │
│     { text: extractionPrompt }                     │
│   ]}]}                                             │
└───────────────────────────────────────────────────┘
  ↓
pdfExtract.js: parseExtractedJSON(raw) → sanitiseDeep()
  ↓
setData(parsed) — populates the Part-Time CV editor form
  ↓
Phase transitions: 'upload' → 'optimising' → 'result'
```

### Key Details

- **PDF extraction is local** — PDF.js runs entirely in the browser, no API call needed for the text extraction step
- **Image CVs cost more** — they require Gemini Vision API (sends full base64 image)
- **The extraction prompt** asks for a specific JSON shape: `personal`, `objective`, `skills[]`, `work_experience[]`, `education[]`
- **This is a DIFFERENT data shape** than Pipeline 1's output. Part-Time uses `objective` (string) and `skills` (array), while Builder uses `personal_profile` and `professional_qualifications`
- **JD tailoring is baked into the extraction** — if the user provides a JD, the AI rewrites bullets during extraction (not as a separate step)

### Environment Variables Used
- `VITE_GROQ_API_KEY` — for PDF text structuring
- `VITE_OPENROUTER_API_KEY` — fallback for PDF structuring
- `VITE_GEMINI_API_KEY` — for image CV extraction (Gemini Vision)

---

## Pipeline 3: AI Polish (Part-Time Generator)

**Files:** `PartTimeCVGenerator.jsx` (inline, lines 662–741)
**Trigger:** User clicks the ✨ sparkle/polish button next to a job's bullets or the personal statement
**Provider:** Groq (primary) → OpenRouter (fallback)

### Flow

```
User clicks ✨ on a specific section
  ↓
handleAIPolish(target)  — target = 'objective' or job index (0, 1, 2...)
  ↓
Builds sector-specific prompt with:
  - Sector algorithm (cfg.label-specific rules)
  - ATS fix instructions (if in ATS Fix Mode)
  - Original content to rewrite
  ↓
POST to Groq: 'openai/gpt-oss-120b', temp 0.5, max_tokens 512
  → If Groq fails → POST to OpenRouter
  ↓
Returns:
  - For objective: plain text string
  - For bullets: JSON array of strings
  ↓
setPendingDiff({ target, original, proposed })
  → Shows a DIFF UI comparing old vs new
  ↓
User clicks Accept → updateField() applies changes
User clicks Reject → discards proposed changes
  ↓
If accepted + user logged in → saveCVVersion() to Supabase
```

### Key Details

- **This is inline in the component** — not in a service file. The Groq/OpenRouter calls are written directly in `PartTimeCVGenerator.jsx`
- **Sector-aware prompts** — each sector (warehouse, care, hospitality, retail, kitchen, freelance) has different banned words, action verbs, and language requirements
- **ATS Fix Mode** — if the user came from the ATS Checker with missing keywords, those keywords are injected into the polish prompt via `buildAtsFixInstructions()`
- **Diff review** — unlike Pipeline 1 (which replaces everything), Polish shows a before/after comparison and lets the user accept or reject
- **Lower token usage** — max_tokens is 512 (vs 4096 for full tailoring), because it only rewrites one section at a time

### Environment Variables Used
- `VITE_GROQ_API_KEY` — primary
- `VITE_OPENROUTER_API_KEY` — fallback

---

## Pipeline 4: AI Typesetting Engine

**Files:** `src/services/AILayoutEngine.js`
**Trigger:** Called during PDF generation to compute optimal font sizes and margins
**Provider:** Gemini SDK (`@google/generative-ai`)

### Flow

```
PDF generation starts
  ↓
AILayoutEngine: getAITypesettingConfig(resumeData)
  ↓
Check localStorage cache (keyed by content hash)
  → If cache hit: return cached config immediately (no API call)
  ↓
Gemini SDK: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  temperature: 0.1 (highly deterministic)
  responseMimeType: 'application/json'
  ↓
Prompt: "Analyze CV data (N chars) → compute typography to fit 2 A4 pages"
  ↓
Returns JSON: { margin_lr, margin_tb, fontSize_body, fontSize_name,
                fontSize_heading, lineGap_body, margin_section, margin_entry }
  ↓
Cache result in localStorage for future calls
  ↓
If API fails → returns hardcoded default config
```

### Key Details

- **Uses Gemini SDK** (not REST API) — different from all other pipelines
- **Cached aggressively** — only calls the API if the CV content hash changes
- **Pure math, no creative writing** — temperature is 0.1, and the prompt asks for numerical spacing values only
- **Fallback is safe** — if Gemini is down, returns a sensible default config that still produces a valid PDF

### Environment Variables Used
- `VITE_GEMINI_API_KEY` — for Gemini SDK

---

## ATS Fix Mode Flow (Cross-Pipeline)

This is a special flow that chains Pipeline 2/3 with the ATS Checker:

```
ATS Checker (/ats route)
  → User uploads CV + JD → scores the CV
  → Shows missing keywords
  → User clicks "Fix My CV with AI →"
  ↓
sessionStorage.setItem('gokulcv_ats_fix_context', JSON.stringify({
  missingKeywords, previousScore, jobType, sector, timestamp
}))
  ↓
Navigate to Part-Time CV Generator
  ↓
PartTimeCVGenerator reads sessionStorage on mount (useEffect)
  → Sets atsFix state → shows blue "ATS Fix Mode" banner
  → Injects missing keywords into AI prompts via buildAtsFixInstructions()
  ↓
When user polishes sections → keywords are woven in by the AI
  ↓
User goes back to /ats → rescans → score should be higher
```

---

## API Provider Summary

| Provider | Model | Used By | API Style | Env Var |
|----------|-------|---------|-----------|---------|
| Groq | `openai/gpt-oss-120b` | Pipelines 1, 2, 3 | REST (OpenAI-compatible) | `VITE_GROQ_API_KEY` |
| OpenRouter | `llama-3.3-70b-instruct:free` | Pipelines 1, 2, 3 (fallback) | REST (OpenAI-compatible) | `VITE_OPENROUTER_API_KEY` |
| Gemini Vision | `gemini-2.5-flash-preview-05-20` | Pipeline 2 (image CVs) | REST (Google AI) | `VITE_GEMINI_API_KEY` |
| Gemini SDK | `gemini-2.5-flash` | Pipeline 4 (typesetting) | `@google/generative-ai` SDK | `VITE_GEMINI_API_KEY` |

---

## Output Data Shapes

### Builder/SmartCV (Pipeline 1)
```json
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "" },
  "personal_profile": "3-sentence profile",
  "education": [{ "degree": "", "institution": "", "period": "", "bullets": [""] }],
  "professional_qualifications": [{ "category": "", "skills": "" }],
  "work_experience": [{ "role": "", "company": "", "period": "", "context": "", "achievements": [""] }],
  "extra_curricular": [{ "role": "", "organization": "", "period": "", "bullets": [""] }]
}
```

### Part-Time Generator (Pipeline 2)
```json
{
  "personal": { "name": "", "email": "", "phone": "", "location": "" },
  "objective": "Personal statement string",
  "skills": ["skill1", "skill2"],
  "work_experience": [{ "id": 1, "company": "", "role": "", "period": "", "bullets": [""] }],
  "education": [{ "institution": "", "degree": "", "period": "" }]
}
```

> ⚠️ **These are different shapes!** The Builder uses `personal_profile` + `professional_qualifications` + `achievements`. The Part-Time uses `objective` + `skills[]` + `bullets`. Don't mix them up.

---

## Common Gotchas

1. **Pipeline 3 (Polish) is inline** — the Groq/OpenRouter calls are written directly in `PartTimeCVGenerator.jsx`, not in a service file. If you refactor, keep them together.
2. **Two different JSON output shapes** — Builder and Part-Time use different data structures (see above). PDF templates handle both.
3. **ATS scoring is client-side** — the `MECHATRONICS_TAXONOMY` matching and `calculateImpactScore()` run in the browser, not via AI.
4. **Gemini is used in 2 different ways** — SDK (`@google/generative-ai`) in AILayoutEngine, and raw REST API in PartTimeCVGenerator for image CVs.
5. **The `sanitiseDeep()` function exists in 2 files** — `ai.js` and `pdfExtract.js`. They're identical. This is intentional to avoid circular imports.
6. **Fallback chain** — Groq → OpenRouter. If both fail, errors bubble up to the UI. There's no third fallback.
7. **Content fitting** — Pipeline 4 (typesetting) only runs for Builder PDFs. Part-Time PDFs use fixed layouts.
