# AI_CONTEXT.md — Mechatronics CV Builder
> Auto-generated on 2026-03-16 04:00:54 by `generate-ai-context.js`
> Run `npm run ai-context` to regenerate after changes.

## Project Overview
A React + Vite CV builder for mechatronics engineers with:
- AI-powered CV tailoring (Groq/Gemini/OpenRouter)
- ATS score checking and keyword optimization
- Multiple PDF templates (Classic, Modern, Executive, Part-Time, ATS)
- Part-time/casual job CV generator with sector presets
- Supabase auth, CV save/load, version control
- Gamification (XP, achievements, levels)

## Tech Stack
| Category | Technologies |
|----------|-------------|
| Framework | React ^19.2.0, Vite ^7.3.1 |
| Styling | TailwindCSS ^3.4.17 |
| Animation | Framer Motion ^12.34.3 |
| PDF | @react-pdf/renderer, jsPDF, pdfmake |
| AI | Groq (llama-4-scout), Gemini, OpenRouter |
| Backend | Supabase (auth + database) |
| Icons | lucide-react |

## Environment Variables (.env)
- `VITE_GEMINI_API_KEY`
- `VITE_GROQ_API_KEY`
- `VITE_GROQ_API_KEY_2`
- `VITE_OPENROUTER_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Commands
| Command | Purpose |
|---------|--------|
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |
| `npm run ai-context` | `node generate-ai-context.js` |

## File Map

### src
| File | Lines | Size | Exports | Flags |
|------|-------|------|---------|-------|
| App.css | 43 | 0.6KB |  |  |
| App.jsx | 362 | 13.4KB | App (default) | `supabase` `ai` `animation` |
| index.css | 258 | 5.7KB |  |  |
| main.jsx | 11 | 0.2KB |  |  |

### src/components
| File | Lines | Size | Exports | Flags |
|------|-------|------|---------|-------|
| ATSScoreChecker.jsx | 801 | 30.7KB | ATSScoreChecker (default) | `supabase` |
| AuthModal.jsx | 172 | 8.6KB | AuthModal (default) | `supabase` `animation` |
| BuilderWorkspace.jsx | 329 | 18.7KB | BuilderWorkspace (default) | `pdf` |
| DataHub.jsx | 378 | 22.1KB | DataHub (default) |  |
| Homepage.jsx | 743 | 51.8KB | Homepage (default) | `animation` |
| MatchEngine.jsx | 212 | 13.7KB | MatchEngine (default) |  |
| MatchScoreCard.jsx | 84 | 3.9KB | MatchScoreCard (default) |  |
| PartTimeCVGenerator.jsx | 1451 | 92.2KB | PartTimeCVGenerator (default) | `supabase` `ai` `pdf` `animation` |
| ResumePDF.jsx | 224 | 10.2KB | ResumePDF (default) | `pdf` |
| ResumeView.jsx | 238 | 11.8KB | ResumeView (default) |  |
| SavedCVs.jsx | 154 | 7.6KB | SavedCVs (default) | `supabase` `animation` |
| SmartCV.jsx | 858 | 44.8KB | SmartCV (default) | `pdf` `animation` |
| TemplateEngine.jsx | 122 | 20.4KB | ClassicTemplate, ModernTemplate, ExecutiveTemplate… |  |
| TemplatePicker.jsx | 169 | 10.1KB | TemplatePicker (default) | `animation` |
| UserMenu.jsx | 90 | 4.0KB | UserMenu (default) | `supabase` |

### src/services
| File | Lines | Size | Exports | Flags |
|------|-------|------|---------|-------|
| ai.js | 318 | 16.3KB | MECHATRONICS_TAXONOMY, calculateImpactScore, decodeEntities… | `ai` |
| AILayoutEngine.js | 140 | 5.0KB | getAITypesettingConfig | `ai` |
| aiRouter.js | 181 | 7.4KB | callAI, hasAnyKey | `ai` |
| partTimeAlgorithm.js | 329 | 16.7KB | BANNED_WORDS, getPartTimeAlgorithm, getExtractionPrompt… | `ai` |
| pdfExtract.js | 124 | 4.1KB | extractTextFromPDF, structureWithGroq, parseExtractedJSON | `ai` |
| pdfMakeDefinition.js | 363 | 12.5KB | generatePdfMakeDefinition |  |
| PDFTemplates.jsx | 553 | 35.0KB | ClassicPDF, ModernPDF, ExecutivePDF… | `pdf` |
| supabase.js | 240 | 6.6KB | supabase, signInWithGoogle, signInWithEmail… | `supabase` |

### src/utils
| File | Lines | Size | Exports | Flags |
|------|-------|------|---------|-------|
| atsEngine.js | 348 | 13.1KB | detectJobType, checkCVFormat, quickKeywordScan | `ai` |
| atsKeywords.js | 483 | 23.6KB | UK_SYNONYMS, SECTOR_KEYWORDS, PART_TIME_SIGNALS… |  |

## Dependency Graph (local imports)
```
App.jsx
  → Homepage.jsx
  → BuilderWorkspace.jsx
  → SmartCV.jsx
  → TemplatePicker.jsx
  → PartTimeCVGenerator.jsx
  → AuthModal.jsx
  → UserMenu.jsx
  → SavedCVs.jsx
  → resumeData.json
  → supabase.js
  → ai.js
ATSScoreChecker.jsx
  → atsEngine.js
  → supabase.js
AuthModal.jsx
  → supabase.js
BuilderWorkspace.jsx
  → PDFTemplates.jsx
  → DataHub.jsx
  → MatchEngine.jsx
  → TemplateEngine.jsx
Homepage.jsx
  → UserMenu.jsx
MatchEngine.jsx
  → MatchScoreCard.jsx
PartTimeCVGenerator.jsx
  → PDFTemplates.jsx
  → ai.js
  → supabase.js
  → partTimeAlgorithm.js
  → aiRouter.js
SavedCVs.jsx
  → supabase.js
SmartCV.jsx
  → PDFTemplates.jsx
  → TemplateEngine.jsx
TemplatePicker.jsx
  → TemplateEngine.jsx
UserMenu.jsx
  → supabase.js
main.jsx
  → index.css
  → App.jsx
```

## Key State Variables (components with 3+ state vars)
### App.jsx
States: `view`, `selectedTemplate`, `showPartTime`, `user`, `showAuth`, `showSaved`, `activeCvId`, `activeCvTitle`, `saveStatus`, `resumeData`, `aiFeed`, `matchScore`, `missingKeywords`, `extraMetrics`, `showRevertModal`

### ATSScoreChecker.jsx
States: `cvText`, `cvFile`, `jdText`, `jobType`, `detectedType`, `analysing`, `progress`, `results`, `error`, `dragOver`, `scoreAnimated`, `user`, `scanSaved`, `scoreTrend`

### AuthModal.jsx
States: `mode`, `email`, `password`, `loading`, `googleLoading`, `error`, `success`

### BuilderWorkspace.jsx
States: `activeTemplate`, `isDownloading`, `downloadSuccess`, `showDropdown`, `activeTab`, `zoom`

### PartTimeCVGenerator.jsx
States: `focused`, `open`, `dragOver`, `phase`, `uploadFile`, `uploadJD`, `optimiseSteps`, `optimiseError`, `showNewBadge`, `sector`, `data`, `layout`, `isPolishing`, `polishTarget`, `pendingDiff`, `isDownloading`, `polishLog`, `savedToast`, `atsFix`, `currentUser`, `savedCvId`, `saveStatus`, `showSuggestions`

### SavedCVs.jsx
States: `cvs`, `loading`, `error`, `deleting`

### SmartCV.jsx
States: `jd`, `isJdOpen`, `activeSection`, `isScanning`, `scanComplete`, `xp`, `earnedAchievements`, `toasts`, `showLevelUp`, `prevLevel`, `isDownloading`, `activeTemplate`

## Architecture Notes
- **Entry**: `main.jsx` → `App.jsx` (view-based routing via state, not react-router)
- **Views**: home | templatepicker | builder | smartcv | ats (+ PartTimeCVGenerator overlay)
- **AI flow**: User pastes JD → `ai.js` calls Groq → returns tailored resume JSON → renders in template
- **PDF flow**: `PDFTemplates.jsx` uses @react-pdf/renderer to create vector PDFs client-side
- **Data persistence**: localStorage (resume cache) + Supabase (auth, saved CVs, versions)
- **ATS flow**: Upload CV → extract text → compare against JD → score + fix suggestions

## For AI Assistants
1. Read THIS file first — it has everything you need to understand the project
2. Only read specific source files when you need to edit them
3. Run `npm run dev` to start dev server (Vite, usually port 5173)
4. Run `npm run build` to verify changes compile
5. After making changes, run `npm run ai-context` to update this file
