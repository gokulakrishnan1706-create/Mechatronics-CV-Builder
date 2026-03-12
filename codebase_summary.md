# Codebase Summary — Mechatronics CV Builder

> Auto-generated summary of every file under `src/`.

---

## src/main.jsx

**Full path:** `src/main.jsx` (11 lines)

### First 30 lines
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Imports
| Module | Source |
|--------|--------|
| `StrictMode` | `react` |
| `createRoot` | `react-dom/client` |
| CSS | `./index.css` |
| `App` | `./App.jsx` |

### Exports
None (entry point — renders `<App />` into `#root`).

### State Variables
None.

---

## src/App.jsx

**Full path:** `src/App.jsx` (225 lines)

### First 30 lines
```jsx
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Homepage from './components/Homepage';
import BuilderWorkspace from './components/BuilderWorkspace';
import TemplatePicker from './components/TemplatePicker';
import { tailorResume } from './services/ai';

const SmartCV = lazy(() => import('./components/SmartCV'));
const PartTimeCVGenerator = lazy(() => import('./components/PartTimeCVGenerator'));

const STORAGE_KEY = 'aura_resume_cache';
const DEFAULT_RESUME = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '' },
  personal_profile: '',
  work_experience: [{ id: 1, company: '', role: '', period: '', context: '', achievements: [''] }],
  education: [{ institution: '', degree: '', period: '', bullets: [''] }],
  professional_qualifications: [{ category: '', skills: '' }],
  extra_curricular: [{ role: '', organization: '', period: '', bullets: [''] }],
};

function App() {
  const [view, setView] = useState('home');
  const [showPartTime, setShowPartTime] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RESUME;
    } catch { return DEFAULT_RESUME; }
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState, useEffect, useCallback, useRef, lazy, Suspense` | `react` |
| `motion, AnimatePresence` | `framer-motion` |
| `Homepage` | `./components/Homepage` |
| `BuilderWorkspace` | `./components/BuilderWorkspace` |
| `TemplatePicker` | `./components/TemplatePicker` |
| `tailorResume` | `./services/ai` |
| `SmartCV` | `./components/SmartCV` (lazy) |
| `PartTimeCVGenerator` | `./components/PartTimeCVGenerator` (lazy) |

### Exports
| Name | Type |
|------|------|
| `App` | Default export (function component) |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `view` | `useState('home')` | Controls which page is shown (home, templatepicker, builder, smartcv) |
| `showPartTime` | `useState(false)` | Toggles the part-time CV generator overlay |
| `selectedTemplate` | `useState('classic')` | Currently selected PDF template |
| `resumeData` | `useState(→ localStorage)` | Full resume data object, persisted |
| `aiFeed` | `useState([])` | AI status messages for the feed |
| `matchScore` | `useState(0)` | AI match score against JD |
| `missingKeywords` | `useState([])` | Missing keywords from AI analysis |
| `extraMetrics` | `useState(null)` | Additional AI metrics (semantic score, impact, suggestions) |
| `errorMessage` | `useState(null)` | Error banner message |
| `containerRef` | `useRef(null)` | Reference to the scroll container |

### Routes Defined
| View value | Component Rendered |
|------------|-------------------|
| `'home'` | `<Homepage />` |
| `'templatepicker'` | `<TemplatePicker />` |
| `'builder'` | `<BuilderWorkspace />` |
| `'smartcv'` | `<SmartCV />` |
| overlay | `<PartTimeCVGenerator />` (shown when `showPartTime` is true) |

---

## src/index.css

**Full path:** `src/index.css` (258 lines)

### First 30 lines
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Selection colour */
::selection { background: rgba(79, 70, 229, 0.15); color: #312e81; }

/* Accessible motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Print */
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
}

@layer base {
```

### Imports
Tailwind base/components/utilities via `@tailwind` directives.

### Exports
N/A (global CSS file).

### Key Definitions
Custom scrollbar styles, selection colour, reduced motion accessibility, print styles, gamification animations (`animate-loop-scroll`, `spin-ring`, `shimmer`, `fill-progress`, `float`).

---

## src/App.css

**Full path:** `src/App.css` (43 lines)

### First 30 lines
```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
```

### Imports
None.

### Exports
N/A (CSS file — root layout and logo spin animation).

---

## src/components/Homepage.jsx

**Full path:** `src/components/Homepage.jsx` (716 lines)

### First 30 lines
```jsx
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Download, Brain, Shield, Zap, Star,
         ChevronDown, ChevronUp, Target, Github, Linkedin, Briefcase,
         Trophy, BarChart3, Clock } from 'lucide-react';

export default function Homepage({ onStartBuilding, onStartSmartCV, onStartPartTime }) {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
    const [openFaq, setOpenFaq] = useState(null);
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useRef, useState` | `react` |
| `motion, useScroll, useTransform, AnimatePresence` | `framer-motion` |
| 16 icons | `lucide-react` |

### Exports
| Name | Type |
|------|------|
| `Homepage` | Default export (function component) |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `heroRef` | `useRef(null)` | Reference for scroll-based hero animation |
| `openFaq` | `useState(null)` | Currently expanded FAQ item index |

---

## src/components/BuilderWorkspace.jsx

**Full path:** `src/components/BuilderWorkspace.jsx` (342 lines)

### First 30 lines
```jsx
import React, { useState, useRef, useMemo } from 'react';
import { Download, RotateCcw, ZoomIn, ZoomOut, FileText, Brain, SplitSquareHorizontal, Loader2 } from 'lucide-react';
import DataHub from './DataHub';
import MatchEngine from './MatchEngine';
import { ResumeView, TEMPLATES } from './TemplateEngine';
import { generatePDF } from '../services/PDFTemplates';

const BuilderWorkspace = ({ resumeData, onUpdate, template: initialTemplate, onTailor, aiFeed, matchScore, missingKeywords, extraMetrics }) => {
    const cvRef = useRef(null);
    const [activeTab, setActiveTab] = useState('edit');
    const [zoom, setZoom] = useState(100);
    const [currentTemplate, setCurrentTemplate] = useState(initialTemplate || 'classic');
    const [isDownloading, setIsDownloading] = useState(false);
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState, useRef, useMemo` | `react` |
| 8 icons | `lucide-react` |
| `DataHub` | `./DataHub` |
| `MatchEngine` | `./MatchEngine` |
| `ResumeView, TEMPLATES` | `./TemplateEngine` |
| `generatePDF` | `../services/PDFTemplates` |

### Exports
| Name | Type |
|------|------|
| `BuilderWorkspace` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `cvRef` | `useRef(null)` | Reference for the CV preview container |
| `activeTab` | `useState('edit')` | Active sidebar tab (edit / match) |
| `zoom` | `useState(100)` | Preview zoom level |
| `currentTemplate` | `useState(initialTemplate)` | Currently selected template |
| `isDownloading` | `useState(false)` | PDF download in-progress flag |

---

## src/components/DataHub.jsx

**Full path:** `src/components/DataHub.jsx` (378 lines)

### First 30 lines
```jsx
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Award, Heart } from 'lucide-react';

const DataHub = ({ resumeData, onUpdate }) => {
    const [openSection, setOpenSection] = useState('personal');
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState` | `react` |
| 9 icons | `lucide-react` |

### Exports
| Name | Type |
|------|------|
| `DataHub` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `openSection` | `useState('personal')` | Which collapsible section is open |

---

## src/components/MatchEngine.jsx

**Full path:** `src/components/MatchEngine.jsx` (212 lines)

### First 30 lines
```jsx
import React, { useState } from 'react';
import { Target, BrainCircuit, Loader2, Terminal, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import MatchScoreCard from './MatchScoreCard';

const MatchEngine = ({ onTailor, aiFeed, matchScore, missingKeywords, extraMetrics }) => {
    const [jd, setJd] = useState('');
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState` | `react` |
| 7 icons | `lucide-react` |
| `MatchScoreCard` | `./MatchScoreCard` |

### Exports
| Name | Type |
|------|------|
| `MatchEngine` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `jd` | `useState('')` | Job description text input |

---

## src/components/MatchScoreCard.jsx

**Full path:** `src/components/MatchScoreCard.jsx` (84 lines)

### First 30 lines
```jsx
import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

const MatchScoreCard = ({ score, impactCritique }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const [displayScore, setDisplayScore] = useState(0);
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useEffect, useState` | `react` |
| `Info` | `lucide-react` |

### Exports
| Name | Type |
|------|------|
| `MatchScoreCard` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `displayScore` | `useState(0)` | Animated count-up display value |

---

## src/components/ResumePDF.jsx

**Full path:** `src/components/ResumePDF.jsx` (224 lines)

### First 30 lines
```jsx
import React from 'react';
import { Document, Page, View, Text, Link, StyleSheet, Font } from '@react-pdf/renderer';

Font.registerHyphenationCallback(word => [word]);

const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, lineHeight: 1.35, color: '#1a1a1a', paddingTop: 30, paddingBottom: 30, paddingHorizontal: 40, backgroundColor: '#ffffff' },
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React` | `react` |
| `Document, Page, View, Text, Link, StyleSheet, Font` | `@react-pdf/renderer` |

### Exports
| Name | Type |
|------|------|
| `ResumePDF` | Default export (react-pdf Document component) |

### State Variables
None (pure render component).

---

## src/components/ResumeView.jsx

**Full path:** `src/components/ResumeView.jsx` (238 lines)

### First 30 lines
```jsx
import React from 'react';

const ResumeView = React.forwardRef(({ resumeData }, ref) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <div ref={ref} className="cv-document" style={{ fontFamily: "'Georgia','Garamond','Times New Roman',serif", ... }}>
        ...
```

### Imports
| Module | Source |
|--------|--------|
| `React` | `react` |

### Exports
| Name | Type |
|------|------|
| `ResumeView` | Default export (forwardRef component) |
| `SectionHeader` | Internal component (not exported) |

### State Variables
None (pure render component).

---

## src/components/SmartCV.jsx

**Full path:** `src/components/SmartCV.jsx` (858 lines)

### First 30 lines
```jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Target, BrainCircuit, Sparkles, AlertTriangle, ArrowRight,
  Download, Loader2, Terminal, CheckCircle, Trophy, Zap, Shield, Star,
  ChevronDown, ChevronUp, FileText, Edit3, Eye, TrendingUp, Award,
  Crosshair, Cpu, Lock, Unlock, BarChart3, Flame, X
} from 'lucide-react';
import { generatePDF } from '../services/PDFTemplates';
import { ResumeView, TEMPLATES } from './TemplateEngine';

const LEVELS = [
  { name: 'Rookie', min: 0, icon: '🥉', ... },
  ...
];
const ACHIEVEMENTS = [
  { id: 'first_scan', label: 'First Scan Complete', xp: 50, icon: '🔍' },
  ...
];
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState, useEffect, useMemo, useRef, useCallback` | `react` |
| `motion, AnimatePresence` | `framer-motion` |
| 28 icons | `lucide-react` |
| `generatePDF` | `../services/PDFTemplates` |
| `ResumeView, TEMPLATES` | `./TemplateEngine` |

### Exports
| Name | Type |
|------|------|
| `SmartCV` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `jd` | `useState('')` | Job description input |
| `isJdOpen` | `useState(true)` | JD input panel toggle |
| `activeSection` | `useState('summary')` | Active editing section |
| `isScanning` | `useState(false)` | AI scanning in-progress |
| `scanComplete` | `useState(false)` | Whether scan finished |
| `xp` | `useState(→ localStorage)` | Gamification XP score |
| `earnedAchievements` | `useState(→ localStorage)` | Unlocked achievements |
| `toasts` | `useState([])` | Achievement toast messages |
| `showLevelUp` | `useState(false)` | Level-up overlay toggle |
| `prevLevel` | `useState(...)` | Previous level for detecting level-ups |
| `isDownloading` | `useState(false)` | PDF export flag |
| `activeTemplate` | `useState('classic')` | Selected PDF template |
| `cvRef` | `useRef(null)` | CV preview container ref |

---

## src/components/TemplateEngine.jsx

**Full path:** `src/components/TemplateEngine.jsx` (122 lines)

### First 30 lines
```jsx
import React from 'react';

// TEMPLATE 1: CLASSIC (Harvard Executive Style)
export const ClassicTemplate = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <div className="cv-document" style={{ fontFamily: "'Georgia','Garamond','Times New Roman',serif", ... }}>
        ...
```

### Imports
| Module | Source |
|--------|--------|
| `React` | `react` |

### Exports
| Name | Type |
|------|------|
| `ClassicTemplate` | Named export (component) |
| `ModernTemplate` | Named export (component) |
| `ExecutiveTemplate` | Named export (component) |
| `TEMPLATES` | Named export (registry object) |
| `ResumeView` | Named + default export (template switcher component) |

### State Variables
None (pure render components).

---

## src/components/TemplatePicker.jsx

**Full path:** `src/components/TemplatePicker.jsx` (169 lines)

### First 30 lines
```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { TEMPLATES } from './TemplateEngine';

const TemplateCard = ({ template, isSelected, onSelect }) => {
    const { name, subtitle, colors } = template;
    const previews = { classic: (...), modern: (...), executive: (...) };
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState` | `react` |
| `motion, AnimatePresence` | `framer-motion` |
| 4 icons | `lucide-react` |
| `TEMPLATES` | `./TemplateEngine` |

### Exports
| Name | Type |
|------|------|
| `TemplatePicker` | Default export |

### Key State Variables
| Variable | Hook | Purpose |
|----------|------|---------|
| `selected` | `useState('classic')` | Currently selected template ID |

---

## src/components/PartTimeCVGenerator.jsx

**Full path:** `src/components/PartTimeCVGenerator.jsx` (1134 lines)

### First 30 lines
```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { PartTimePDF, ATSPartTimePDF } from '../services/PDFTemplates';
import {
    User, Briefcase, Wand2, Download, Loader2, CheckCircle, X, Plus, Trash2,
    ArrowLeft, Sparkles, Heart, Package, Clock, ShoppingBag, ChefHat,
    Wine, RotateCcw, LayoutTemplate, Save, ThumbsUp, ThumbsDown,
    ChevronDown, ChevronUp, Upload, FileText, Target, Zap
} from 'lucide-react';

const CVUploadPanel = ({ onExtracted, onClose, cfg }) => {
    const [file, setFile] = useState(null);
    const [jd, setJd] = useState('');
    const [status, setStatus] = useState('idle');
    const [log, setLog] = useState('');
    const fileRef = useRef();
    ...
```

### Imports
| Module | Source |
|--------|--------|
| `React, useState, useEffect, useCallback, useRef` | `react` |
| `motion, AnimatePresence` | `framer-motion` |
| `pdf` | `@react-pdf/renderer` |
| `PartTimePDF, ATSPartTimePDF` | `../services/PDFTemplates` |
| 24 icons | `lucide-react` |
| Dynamic: `pdfExtract.js` | `../services/pdfExtract.js` (via `import()`) |

### Exports
| Name | Type |
|------|------|
| `PartTimeCVGenerator` | Default export |

### Key State Variables (PartTimeCVGenerator)
| Variable | Hook | Purpose |
|----------|------|---------|
| `sector` | `useState(→ localStorage)` | Selected sector (warehouse, retail, etc.) |
| `layout` | `useState(→ localStorage)` | Selected layout (two-col, ats) |
| `formData` | `useState({...})` | Full form data for part-time CV |
| `generating` | `useState(false)` | AI generation flag |
| `downloading` | `useState(false)` | PDF export flag |
| `expandedSections` | `useState({...})` | Collapsible section states |
| `showUpload` | `useState(false)` | CV upload panel visibility |
| `genLog` | `useState([])` | AI generation log messages |

### Key State Variables (CVUploadPanel — inner component)
| Variable | Hook | Purpose |
|----------|------|---------|
| `file` | `useState(null)` | Uploaded file reference |
| `jd` | `useState('')` | Job description for tailoring |
| `status` | `useState('idle')` | Processing status |
| `log` | `useState('')` | Status log text |
| `fileRef` | `useRef()` | File input reference |

---

## src/services/ai.js

**Full path:** `src/services/ai.js` (272 lines)

### First 30 lines
```js
/**
 * ai.js — GokulCV AI Layer v2.0
 * Primary:  Groq (llama-4-scout) — fast, free, reliable
 * Fallback: OpenRouter (llama-3.3-70b free) — automatic backup
 */

// MECHATRONICS TAXONOMY (ATS scoring)
export const MECHATRONICS_TAXONOMY = {
    'CAD':                ['SolidWorks', 'AutoCAD', 'CATIA', 'Creo', 'NX', 'Fusion 360', 'Inventor'],
    'Controls':           ['PLC', 'SCADA', 'PID', 'Allen Bradley', 'Siemens', 'Beckhoff', 'HMI', 'Ladder Logic'],
    'Robotics':           ['ROS', 'Kinematics', 'FANUC', 'KUKA', 'ABB', 'UR', 'Cobots', 'Path Planning'],
    'Programming':        ['C++', 'Python', 'MATLAB', 'Simulink', 'C', 'IEC 61131-3', 'Embedded C'],
    'Electronics':        ['PCB Design', 'Altium', 'Eagle', 'KiCad', 'Microcontrollers', 'Arduino', 'Raspberry Pi', 'FPGA'],
    'Systems Engineering':['FMEA', 'SysML', 'Requirements Engineering', 'MBSE', 'Validation'],
    'Sensors & Actuators':['Lidar', 'Encoders', 'Servos', 'Stepper Motors', 'Pneumatics', 'Hydraulics'],
};

export const calculateImpactScore = (resumeText) => {
    ...
```

### Imports
None (uses `fetch` for API calls, reads environment variables via `import.meta.env`).

### Exports
| Name | Type |
|------|------|
| `MECHATRONICS_TAXONOMY` | Named export (const object — ATS keyword taxonomy) |
| `calculateImpactScore` | Named export (function) |
| `tailorResume` | Named export (async function — main AI entry point) |

### State Variables
N/A (service module — no React hooks).

---

## src/services/PDFTemplates.jsx

**Full path:** `src/services/PDFTemplates.jsx` (651 lines)

### First 30 lines
```jsx
/**
 * PDFTemplates.jsx — @react-pdf/renderer vector PDF generation
 * Fixes: contact row (single Text line), section headers, skills table, page breaks
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const stripHtml = (str) => (str || '').replace(/<[^>]*>/g, '');

const buildContactLine = (personal) =>
    [personal?.email, personal?.phone, personal?.location, personal?.linkedin ? 'LinkedIn' : null]
        .filter(Boolean).join('  |  ');
...
```

### Imports
| Module | Source |
|--------|--------|
| `React` | `react` |
| `Document, Page, Text, View, StyleSheet, pdf` | `@react-pdf/renderer` |

### Exports
| Name | Type |
|------|------|
| `ClassicPDF` | Named export (component) |
| `ModernPDF` | Named export (component) |
| `ExecutivePDF` | Named export (component) |
| `PartTimePDF` | Named export (component) |
| `ATSPartTimePDF` | Named export (component) |
| `generatePDF` | Named export (async function — generates PDF blob) |

### State Variables
N/A (react-pdf Document components — no React hooks).

---

## src/services/pdfExtract.js

**Full path:** `src/services/pdfExtract.js` (190 lines)

### First 30 lines
```js
/**
 * pdfExtract.js — Browser-based PDF text extraction
 * Uses PDF.js via CDN — zero API calls, zero cost, works offline
 * Fallback: image CVs use base64 for vision API
 */
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

let pdfjsLib = null;

const loadPdfJs = async () => {
    if (pdfjsLib) return pdfjsLib;
    try {
        const mod = await import(PDFJS_CDN);
        pdfjsLib = mod;
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        return pdfjsLib;
    } catch (err) {
        throw new Error('Failed to load PDF.js: ' + err.message);
    }
};

export const extractTextFromPDF = async (file) => {
    ...
```

### Imports
None (loads `pdf.js` dynamically via CDN import).

### Exports
| Name | Type |
|------|------|
| `extractTextFromPDF` | Named export (async function) |
| `buildExtractionPrompt` | Named export (function) |
| `structureWithGroq` | Named export (async function) |
| `parseExtractedJSON` | Named export (function) |

### State Variables
N/A (service module).

---

## src/services/AILayoutEngine.js

**Full path:** `src/services/AILayoutEngine.js` (140 lines)

### First 30 lines
```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * AI Typesetting Orchestrator
 * Calculates the exact dynamic spacing config required to fit the CV content into 2 pages.
 */
const SYSTEM_PROMPT = `
You are an expert typography engine and professional typesetting bot.
Your singular objective is to analyze the volume of text in a provided CV and compute the precise mathematical spatial constraints required to perfectly fit the content onto exactly 2 A4 pages.

### RULES
- The standard A4 page is 210mm x 297mm.
- If the CV has massive amounts of text, you must return tighter margins, smaller fonts, and tighter line gaps.
- If the CV has very little text, you must return generous margins, larger fonts, and wider line gaps to beautifully fill the space.
- Do NOT output any markdown, explanations, or text. RETURN ONLY VALID JSON.
...
```

### Imports
| Module | Source |
|--------|--------|
| `GoogleGenerativeAI` | `@google/generative-ai` |

### Exports
| Name | Type |
|------|------|
| `getAITypesettingConfig` | Named export (async function — calls Gemini API) |

### State Variables
N/A (service module).

---

## src/services/pdfMakeDefinition.js

**Full path:** `src/services/pdfMakeDefinition.js` (363 lines)

### First 30 lines
```js
// PDF DOCUMENT DEFINITION GENERATOR
// Harvard Business School / Top-Tier Executive Standard
// Pure data — no pdfMake import. pdfMake is loaded dynamically
// in BuilderWorkspace.jsx to avoid Vite ESM deadlock.

const LAYOUT = {
    PAGE_MARGIN: [50, 45, 50, 45],
    NAME_SIZE: 24,
    CONTACT_SIZE: 9,
    SECTION_HEADER_SIZE: 10.5,
    BODY_SIZE: 9.5,
    ENTRY_TITLE_SIZE: 10,
    ROLE_SIZE: 9,
    BULLET_SIZE: 9,
    CONTEXT_SIZE: 9,
    LINE_HEIGHT: 1.4,
    SECTION_GAP: 12,
    ENTRY_GAP: 10,
    BULLET_GAP: 2,
};
...
```

### Imports
None (pure data definition module).

### Exports
| Name | Type |
|------|------|
| `generatePdfMakeDefinition` | Named export (function — returns pdfMake doc definition) |

### State Variables
N/A (service module).

---

*End of codebase summary.*
