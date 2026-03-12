import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// AI provider handled via callAI() — Groq primary, OpenRouter fallback
import { pdf } from '@react-pdf/renderer';
import { PartTimePDF, ATSPartTimePDF } from '../services/PDFTemplates';
import {
    User, Briefcase, Wand2, Download, Loader2, CheckCircle, X, Plus, Trash2,
    ArrowLeft, Sparkles, Heart, Package, Clock, ShoppingBag, ChefHat,
    Wine, RotateCcw, LayoutTemplate, Save, ThumbsUp, ThumbsDown,
    ChevronDown, ChevronUp, Upload, FileText, Target, Zap
} from 'lucide-react';

// ─────────────────────────────────────────────
// CV UPLOAD + EXTRACT PANEL
// ─────────────────────────────────────────────
const CVUploadPanel = ({ onExtracted, onClose, cfg }) => {
    const [file, setFile] = useState(null);
    const [jd, setJd] = useState('');
    const [status, setStatus] = useState('idle'); // idle | extracting | polishing | done | error
    const [log, setLog] = useState('');
    const fileRef = useRef();

    const toBase64 = (f) => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(f);
    });

    const handleProcess = async () => {
        if (!file) { alert('Please upload your CV first'); return; }

        setStatus('extracting');
        setLog('Reading your CV...');

        try {
            const { extractTextFromPDF, buildExtractionPrompt, structureWithGroq, parseExtractedJSON } = await import('../services/pdfExtract.js');

            let raw;

            if (file.type === 'application/pdf') {
                // ── PDF: extract text in browser, send to Groq (no vision API needed) ──
                setLog('Extracting text from PDF...');
                const cvText = await extractTextFromPDF(file);

                if (!cvText || cvText.length < 50) {
                    throw new Error('Could not extract text from this PDF. It may be a scanned image — try uploading as JPG instead.');
                }

                setLog(jd.trim() ? 'Structuring & tailoring with AI...' : 'Structuring CV data with AI...');
                const prompt = buildExtractionPrompt(cvText, jd);
                raw = await structureWithGroq(prompt);

            } else {
                // ── Image CV: must use Gemini vision (only free vision-capable option) ──
                setLog('Reading image CV with vision AI...');
                const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!geminiKey) throw new Error('Image CVs require VITE_GEMINI_API_KEY. Please upload as PDF instead.');

                const base64 = await new Promise((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res(r.result.split(',')[1]);
                    r.onerror = rej;
                    r.readAsDataURL(file);
                });

                const imagePrompt = jd.trim()
                    ? `Extract ALL data from this CV image AND tailor to the job description below. Return ONLY raw JSON no markdown:
{"personal":{"name":"","email":"","phone":"","location":""},"objective":"","skills":[],"work_experience":[{"id":1,"company":"","role":"","period":"","bullets":[]}],"education":[{"institution":"","degree":"","period":""}]}
Rules: compelling personal statement max 60 words, strong action-verb bullets with metrics, JD keywords woven in, keep all personal details/dates exact.
JOB DESCRIPTION: ${jd.substring(0, 2000)}`
                    : `Extract ALL information from this CV image. Return ONLY raw JSON no markdown:
{"personal":{"name":"","email":"","phone":"","location":""},"objective":"","skills":[],"work_experience":[{"id":1,"company":"","role":"","period":"","bullets":[]}],"education":[{"institution":"","degree":"","period":""}]}
Extract ALL jobs, skills, education. Put all duties into bullets. Leave objective empty if none exists.`;

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [
                            { inline_data: { mime_type: file.type, data: base64 } },
                            { text: imagePrompt }
                        ]}]})
                    }
                );
                if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error(`Vision API error: ${e?.error?.message || res.status}. Try uploading as PDF instead.`);
                }
                const d = await res.json();
                raw = d.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!raw) throw new Error('Vision AI returned no data. Try again.');
            }

            const parsed = parseExtractedJSON(raw);
            parsed.work_experience = (parsed.work_experience || []).map((j, i) => ({ ...j, id: Date.now() + i }));
            if (!parsed.skills) parsed.skills = [];
            if (!parsed.education) parsed.education = [];

            setStatus('done');
            setLog(jd.trim() ? '✔ CV extracted and tailored to JD!' : '✔ Data extracted successfully!');
            onExtracted(parsed);

        } catch (err) {
            setStatus('error');
            setLog('✖ Error: ' + err.message);
        }
    };


    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: cfg.bg }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                            <Upload className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 text-sm">Upload Existing CV</h2>
                            <p className="text-xs text-slate-500">AI will extract your data and optionally tailor it to a job</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-6 space-y-4">
                    {/* File upload */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Your CV (PDF or Image)</label>
                        <div onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'}`}>
                            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
                            {file ? (
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-semibold text-emerald-700">{file.name}</span>
                                    <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600">Click to upload PDF or image</p>
                                    <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional JD */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Job Description <span className="text-slate-400 font-normal normal-case">(optional — paste to tailor CV)</span>
                        </label>
                        <div className="relative">
                            <textarea value={jd} onChange={e => setJd(e.target.value)} rows={4}
                                placeholder="Paste the job description here to automatically tailor your CV to the role..."
                                className="w-full text-sm border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-slate-400 text-slate-900 placeholder-slate-400" />
                            {jd.trim() && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                                    <Target className="w-3 h-3" /> JD Ready
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Log */}
                    {log && (
                        <div className={`text-xs font-mono px-3 py-2 rounded-lg ${status === 'error' ? 'bg-red-50 text-red-600' : status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                            {status === 'extracting' || status === 'polishing' ? <span className="inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />{log}</span> : log}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleProcess} disabled={!file || status === 'extracting' || status === 'polishing'}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: cfg.color }}>
                            {status === 'extracting' || status === 'polishing'
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                : jd.trim()
                                    ? <><Zap className="w-4 h-4" /> Extract + Tailor to JD</>
                                    : <><FileText className="w-4 h-4" /> Extract CV Data</>}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// SECTOR CONFIGS (6 sectors)
// ─────────────────────────────────────────────
const SECTOR_CONFIGS = {
    warehouse: {
        label: 'Warehouse & Logistics', icon: Package, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
        skills: ['Forklift Operator (Counterbalance/Reach)', 'Manual Handling & Load Securing', 'Stock Control & Inventory Management', 'Health & Safety Compliance', 'RF Scanning & Warehouse Management Systems', 'Pick, Pack & Despatch Operations'],
        objectiveHint: 'Reliable and physically fit individual seeking a part-time warehouse operative role...',
        bulletSuggestions: {
            'Warehouse Operative': ['Operated counterbalance forklift to move pallets across a 50,000 sq ft warehouse safely', 'Achieved 99.8% pick accuracy across 500+ daily orders using RF scanning equipment', 'Consistently met daily pick targets of 300+ units per shift with zero errors', 'Assisted in full stock counts reducing inventory discrepancies by 15%'],
            'Stock Controller': ['Managed inbound and outbound stock movements using WMS software', 'Identified and resolved stock discrepancies reducing shrinkage by 20%', 'Conducted daily cycle counts ensuring 98% inventory accuracy'],
            'General': ['Maintained a clean and organised work area in compliance with H&S regulations', 'Completed mandatory manual handling and fire safety training', 'Collaborated with team members to meet daily despatch deadlines'],
        },
    },
    carehome: {
        label: 'Care Home & Support Work', icon: Heart, color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8',
        skills: ['Personal Care & Dignity-Led Support', 'Medication Administration', 'Dementia & Alzheimer\'s Awareness', 'Moving & Handling Certificate', 'Safeguarding Adults & DBS Cleared', 'Empathy, Patience & Active Listening'],
        objectiveHint: 'Compassionate and dedicated care professional seeking a part-time support worker role...',
        bulletSuggestions: {
            'Care Assistant': ['Provided dignified personal care to 8+ residents daily including bathing, dressing and medication prompts', 'Supported residents with dementia using person-centred care approaches, improving daily wellbeing scores', 'Maintained accurate care records and handover notes using digital care management system'],
            'Support Worker': ['Assisted service users with daily living activities promoting independence and choice', 'Developed trusting relationships with vulnerable adults through consistent, empathetic support', 'Reported safeguarding concerns promptly in line with organisational policy'],
            'General': ['Upheld dignity and respect for all service users at all times', 'Participated in regular team meetings and training sessions', 'Maintained confidentiality in line with GDPR and organisational policy'],
        },
    },
    freelance: {
        label: 'Freelance & Gig Work', icon: Clock, color: '#8b5cf6', bg: '#faf5ff', border: '#ddd6fe',
        skills: ['Time Management & Self-Motivation', 'Client Communication & Relationship Building', 'Task Prioritisation & Deadline Management', 'Invoicing & Basic Bookkeeping', 'Adaptability Across Multiple Projects', 'Remote Collaboration (Slack, Trello, Zoom)'],
        objectiveHint: 'Versatile and self-directed professional seeking flexible freelance opportunities...',
        bulletSuggestions: {
            'Freelancer': ['Delivered 20+ client projects on time and within budget, maintaining a 5-star review rating', 'Managed end-to-end client relationships from initial brief through to final delivery', 'Juggled 3–5 concurrent projects whilst maintaining consistent quality standards'],
            'General': ['Proactively communicated project updates to clients, reducing revision rounds by 30%', 'Built a repeat client base through reliable delivery and professional communication', 'Self-managed invoicing, scheduling and client onboarding independently'],
        },
    },
    retail: {
        label: 'Retail & Customer Service', icon: ShoppingBag, color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd',
        skills: ['Customer Service & Complaint Resolution', 'Cash Handling & Till Operation', 'Stock Replenishment & Merchandising', 'Product Knowledge & Upselling', 'Loss Prevention Awareness', 'Team Collaboration & Communication'],
        objectiveHint: 'Friendly and customer-focused individual seeking a part-time retail or customer service role...',
        bulletSuggestions: {
            'Sales Assistant': ['Delivered excellent customer service to 100+ daily customers, consistently receiving positive feedback', 'Processed cash and card transactions accurately with zero till discrepancies over 6 months', 'Replenished and merchandised stock displays to maximise visual appeal and sales'],
            'Customer Service Advisor': ['Resolved customer complaints efficiently, achieving a 95% first-contact resolution rate', 'Processed refunds, exchanges and account queries in line with company policy', 'Exceeded upselling targets by 20% through confident product recommendations'],
            'General': ['Maintained a clean, safe and well-organised shop floor at all times', 'Supported colleagues during peak trading periods including Christmas and sale events', 'Completed till training and product knowledge sessions within first week of employment'],
        },
    },
    kitchen: {
        label: 'Kitchen & Catering', icon: ChefHat, color: '#ef4444', bg: '#fff1f2', border: '#fecdd3',
        skills: ['Food Preparation & Knife Skills', 'Food Hygiene Certificate (Level 2)', 'HACCP & Temperature Control', 'Allergen Awareness & Labelling', 'Kitchen Cleaning & Deep Clean Procedures', 'Working Under Pressure in Fast-Paced Environments'],
        objectiveHint: 'Hardworking and food-safety conscious individual seeking a part-time kitchen or catering role...',
        bulletSuggestions: {
            'Kitchen Assistant': ['Prepared fresh ingredients daily for a 120-cover restaurant, maintaining food hygiene standards throughout', 'Completed all cleaning tasks to HACCP standards, passing every environmental health inspection', 'Supported head chef during busy service periods, ensuring timely delivery of dishes'],
            'Catering Assistant': ['Served food and beverages to 200+ guests at corporate events maintaining professional presentation', 'Set up and broke down catering stations efficiently, adhering to strict time schedules', 'Managed allergen queries confidently, ensuring guest safety at all times'],
            'General': ['Maintained Level 2 Food Hygiene Certificate and applied standards consistently', 'Operated commercial dishwasher and kitchen equipment safely following training', 'Contributed to a positive kitchen team environment during high-pressure service periods'],
        },
    },
    hospitality: {
        label: 'Hospitality & Bar Work', icon: Wine, color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0',
        skills: ['Bar Service & Cocktail Preparation', 'Cellar Management & Stock Rotation', 'Challenge 25 & Age Verification', 'EPOS Till & Card Payment Systems', 'Table Service & Front-of-House', 'Conflict De-escalation & Licencing Awareness'],
        objectiveHint: 'Personable and energetic individual seeking a part-time bar or hospitality role...',
        bulletSuggestions: {
            'Bar Staff': ['Served 150+ customers per shift in a fast-paced licensed venue, maintaining quality and speed', 'Operated EPOS till and handled cash/card payments with 100% accuracy across all shifts', 'Applied Challenge 25 policy consistently, refusing service to underage customers where appropriate'],
            'Waiter/Waitress': ['Delivered attentive table service to 40+ covers per shift, resulting in consistent 5-star reviews', 'Upsold premium menu items and drinks, contributing to a 12% increase in average spend per head', 'Managed multiple tables simultaneously during peak service with composure and efficiency'],
            'General': ['Maintained a clean bar and front-of-house area throughout service in line with health regulations', 'Supported team members during high-volume periods including weekend and event shifts', 'Completed personal licence awareness training and applied responsible service principles'],
        },
    },
};

// ─────────────────────────────────────────────
// EMPTY DATA TEMPLATE
// ─────────────────────────────────────────────
const makeEmptyData = () => ({
    personal: { name: '', email: '', phone: '', location: '' },
    objective: '',
    skills: [],
    work_experience: [{ id: Date.now(), company: '', role: '', period: '', bullets: [''] }],
    education: [{ institution: '', degree: '', period: '' }],
});

const STORAGE_KEY = 'gokulcv_parttime_v2';

// ─────────────────────────────────────────────
// COMPLETENESS SCORE
// ─────────────────────────────────────────────
const getCompleteness = (data) => {
    let score = 0; const checks = [];
    const p = data.personal;
    if (p.name?.trim()) { score += 15; checks.push({ label: 'Name', done: true }); } else checks.push({ label: 'Name', done: false });
    if (p.email?.trim()) { score += 10; checks.push({ label: 'Email', done: true }); } else checks.push({ label: 'Email', done: false });
    if (p.phone?.trim()) { score += 5; checks.push({ label: 'Phone', done: true }); } else checks.push({ label: 'Phone', done: false });
    if (data.objective?.trim().length > 30) { score += 20; checks.push({ label: 'Personal Statement', done: true }); } else checks.push({ label: 'Personal Statement', done: false });
    const hasSkills = data.skills?.filter(s => s.trim()).length >= 3;
    if (hasSkills) { score += 15; checks.push({ label: '3+ Skills', done: true }); } else checks.push({ label: '3+ Skills', done: false });
    const hasExp = data.work_experience?.some(j => j.role?.trim() && j.company?.trim());
    if (hasExp) { score += 20; checks.push({ label: 'Work Experience', done: true }); } else checks.push({ label: 'Work Experience', done: false });
    const hasBullets = data.work_experience?.some(j => j.bullets?.filter(b => b.trim()).length >= 2);
    if (hasBullets) { score += 15; checks.push({ label: '2+ Bullet Points', done: true }); } else checks.push({ label: '2+ Bullet Points', done: false });
    return { score, checks };
};

// ─────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────
const PTInput = ({ label, value, onChange, color, placeholder }) => (
    <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{label}</label>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 text-slate-900 placeholder-slate-400 bg-white transition-all" />
    </div>
);

const FormSection = ({ title, icon, children, color, collapsible = false }) => {
    const [open, setOpen] = useState(true);
    return (
        <div>
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => collapsible && setOpen(o => !o)}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: `${color}18`, color }}>{icon}</div>
                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                </div>
                {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
            </div>
            {(!collapsible || open) && children}
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const PartTimeCVGenerator = ({ onClose }) => {
    const [sector, setSector] = useState(() => {
        try { const saved = localStorage.getItem(STORAGE_KEY + '_sector'); return saved || 'warehouse'; } catch { return 'warehouse'; }
    });
    const [data, setData] = useState(() => {
        try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : makeEmptyData(); } catch { return makeEmptyData(); }
    });
    const [layout, setLayout] = useState(() => {
        try { const saved = localStorage.getItem(STORAGE_KEY + '_layout'); return saved || 'two-col'; } catch { return 'two-col'; }
    });
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishTarget, setPolishTarget] = useState(null);
    const [pendingDiff, setPendingDiff] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [polishLog, setPolishLog] = useState('');
    const [savedToast, setSavedToast] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [jobOrder, setJobOrder] = useState(() => data.work_experience.map((_, i) => i));
    const cfg = SECTOR_CONFIGS[sector];
    const CfgIcon = cfg.icon;
    const { score, checks } = getCompleteness(data);

    // ── Auto-save ──
    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
        }, 800);
        return () => clearTimeout(t);
    }, [data]);

    // Persist sector + layout immediately on change
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY + '_sector', sector); } catch {}
    }, [sector]);
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY + '_layout', layout); } catch {}
    }, [layout]);

    // ── Deep update helper ──
    const updateField = useCallback((path, value) => {
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let cur = next;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = /^\d+$/.test(keys[i]) ? parseInt(keys[i], 10) : keys[i];
                cur = cur[k];
            }
            const last = keys[keys.length - 1];
            cur[/^\d+$/.test(last) ? parseInt(last, 10) : last] = value;
            return next;
        });
    }, []);

    const injectSkills = () => setData(prev => ({ ...prev, skills: [...cfg.skills] }));

    const insertBulletSuggestion = (jobIdx, bullet) => {
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const job = next.work_experience[jobIdx];
            const empty = job.bullets.findIndex(b => !b.trim());
            if (empty !== -1) job.bullets[empty] = bullet;
            else job.bullets.push(bullet);
            return next;
        });
    };

    const resetData = () => { if (confirm('Clear all data? This cannot be undone.')) { localStorage.removeItem(STORAGE_KEY); setData(makeEmptyData()); } };

    const manualSave = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setSavedToast(true); setTimeout(() => setSavedToast(false), 2000); } catch {}
    };

    // ── AI Polish (per-section with diff) — Groq primary, OpenRouter fallback ──
    const handleAIPolish = async (target) => {
        const groqKey = import.meta.env.VITE_GROQ_API_KEY;
        const orKey   = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!groqKey && !orKey) { alert('Add VITE_GROQ_API_KEY to your .env file'); return; }
        setIsPolishing(true);
        setPolishTarget(target);
        setPolishLog('Polishing with AI...');

        const sectorAlgo = `You are a UK CV writer for part-time ${cfg.label} roles.
STRICT RULES — every violation will cause rejection:
- Start every bullet with a DIFFERENT strong action verb: Delivered, Led, Achieved, Drove, Built, Managed, Maintained, Supported, Reduced, Increased, Trained, Resolved, Completed, Secured, Processed
- Include at least one metric/number (%, hours, residents, orders, covers etc) per bullet
- UK English spelling (organised, recognised, maintained)  
- Max 20 words per bullet — short and punchy
- BANNED WORDS — never use: dynamic, exceptional, proactive, passionate, synergy, leverage, spearheaded, collaborated, demonstrated, hardworking, dedicated, motivated, team player, reliable
- No first-person (no I, my, me)
- No vague phrases like "ensuring smooth operations" or "attention to detail"
- Be specific to ${cfg.label} sector language`;

        try {
            let prompt, original;
            if (target === 'objective') {
                original = data.objective;
                prompt = `${sectorAlgo}

Rewrite this personal statement: compelling, specific, sector-relevant, max 60 words, 3 sentences, ends with a value proposition. Return ONLY the improved text, nothing else.

Original: ${original}`;
            } else {
                const job = data.work_experience[target];
                original = job.bullets.filter(b => b.trim());
                prompt = `${sectorAlgo}

Rewrite these ${cfg.label} job bullets. Same number of bullets. Each must start with a different action verb and include a metric. Return ONLY a JSON array of strings, no markdown.

Role: ${job.role} at ${job.company}
Original bullets: ${JSON.stringify(original)}`;
            }

            let text = null;

            // Try Groq first
            if (groqKey) {
                const isObjective = target === 'objective';
                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
                    body: JSON.stringify({
                        model: 'openai/gpt-oss-120b',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.5,
                        max_tokens: 512,
                        ...(isObjective ? {} : { response_format: { type: 'json_object' } }),
                    })
                });
                if (res.ok) { const d = await res.json(); text = d.choices[0].message.content?.trim(); }
            }

            // OpenRouter fallback
            if (!text && orKey) {
                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orKey}`, 'HTTP-Referer': 'https://gokulcv.app', 'X-Title': 'GokulCV' },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-3.3-70b-instruct:free',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.5, max_tokens: 512,
                    })
                });
                if (res.ok) { const d = await res.json(); text = d.choices[0].message.content?.trim(); }
            }

            if (!text) throw new Error('AI providers unavailable. Check your API keys.');

            let proposed;
            if (target === 'objective') {
                proposed = text.replace(/^["']|["']$/g, '').trim();
            } else {
                const s = text.indexOf('[');
                const e = text.lastIndexOf(']');
                proposed = s !== -1 ? JSON.parse(text.substring(s, e + 1)) : JSON.parse(text);
            }
            setPendingDiff({ target, original, proposed });
            setPolishLog('');
        } catch (err) {
            setPolishLog('✖ AI error: ' + err.message);
        } finally {
            setIsPolishing(false);
            setPolishTarget(null);
        }
    };

    const acceptDiff = () => {
        if (!pendingDiff) return;
        const { target, proposed } = pendingDiff;
        if (target === 'objective') {
            updateField('objective', proposed);
        } else {
            setData(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                next.work_experience[target].bullets = proposed;
                return next;
            });
        }
        setPendingDiff(null);
    };

    const rejectDiff = () => setPendingDiff(null);

    // ── Download PDF ──
    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadSuccess(false);
        try {
            const safeName = (data.personal.name || 'PartTime_CV').replace(/[^a-zA-Z0-9]/g, '_');
            const blob = await pdf(
                layout === 'ats'
                    ? <ATSPartTimePDF data={data} sector={sector} />
                    : <PartTimePDF data={data} sector={sector} layout={layout} />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${safeName}_PartTime_CV.pdf`; a.rel = 'noopener'; a.style.display = 'none';
            document.body.appendChild(a);
            a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 10000);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) { alert('Download failed: ' + err.message); }
        finally { setTimeout(() => setIsDownloading(false), 1500); }
    };

    // ── Reorder jobs on drag end ──
    const handleReorder = (newOrder) => {
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.work_experience = newOrder.map(id => prev.work_experience.find(j => j.id === id) || prev.work_experience[id]);
            return next;
        });
    };

    const addJob = () => setData(prev => ({
        ...prev,
        work_experience: [...prev.work_experience, { id: Date.now(), company: '', role: '', period: '', bullets: [''] }]
    }));

    const removeJob = (i) => setData(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, idx) => idx !== i) }));

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans overflow-hidden">

            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="h-5 w-px bg-slate-200" />
                    <div className="p-1.5 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <CfgIcon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-sm leading-tight">Part-Time CV Generator</h1>
                        <p className="text-[11px] text-slate-400">{cfg.label}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* ATS mode badge */}
                    {layout === 'ats' && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            🎯 ATS Mode — interview-ready format
                        </div>
                    )}

                    {/* Completeness pill */}
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : score >= 50 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        {score}% Complete
                    </div>

                    {/* Upload CV button */}
                    <button onClick={() => setShowUpload(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-all"
                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                        <Upload className="w-4 h-4" />
                        Upload CV
                    </button>

                    {/* Layout selector — 3 options */}
                    <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                        {[
                            { id: 'two-col', label: '2-Col' },
                            { id: 'one-col', label: '1-Col' },
                            { id: 'ats',     label: '🎯 ATS' },
                        ].map(opt => (
                            <button key={opt.id} onClick={() => setLayout(opt.id)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${layout === opt.id ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Save */}
                    <button onClick={manualSave} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative">
                        <Save className="w-4 h-4" />
                        <AnimatePresence>
                            {savedToast && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded whitespace-nowrap">Saved!</motion.div>}
                        </AnimatePresence>
                    </button>

                    {/* Reset */}
                    <button onClick={resetData} title="Clear all data" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Download */}
                    <button onClick={handleDownload} disabled={isDownloading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all ${downloadSuccess ? 'bg-emerald-500' : 'bg-brand-primary hover:bg-blue-700'}`}>
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : downloadSuccess ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        {downloadSuccess ? 'Done!' : 'PDF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* ══ LEFT: FORM ══ */}
                <div className="w-[460px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

                    {/* Sector selector */}
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50 shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Sector</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {Object.entries(SECTOR_CONFIGS).map(([key, s]) => {
                                const Icon = s.icon;
                                return (
                                    <button key={key} onClick={() => setSector(key)}
                                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all truncate ${sector === key ? 'border-current shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                                        style={sector === key ? { borderColor: s.color, background: s.bg, color: s.color } : {}}>
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{s.label.split(' & ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Completeness checklist */}
                    <div className="px-4 py-2 border-b border-slate-100 bg-white shrink-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full" animate={{ width: `${score}%` }} transition={{ duration: 0.5 }}
                                    style={{ background: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{score}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {checks.map((c, i) => (
                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.done ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {c.done ? '✓' : '○'} {c.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Form fields */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                        {/* Personal */}
                        <FormSection title="Personal Details" icon={<User className="w-3.5 h-3.5" />} color={cfg.color}>
                            <div className="grid grid-cols-2 gap-2.5">
                                <PTInput label="Full Name" value={data.personal.name} onChange={v => updateField('personal.name', v)} color={cfg.color} />
                                <PTInput label="Email" value={data.personal.email} onChange={v => updateField('personal.email', v)} color={cfg.color} />
                                <PTInput label="Phone" value={data.personal.phone} onChange={v => updateField('personal.phone', v)} color={cfg.color} />
                                <PTInput label="Location" value={data.personal.location} onChange={v => updateField('personal.location', v)} color={cfg.color} />
                            </div>
                        </FormSection>

                        {/* Personal Statement */}
                        <FormSection title="Personal Statement" icon={<Sparkles className="w-3.5 h-3.5" />} color={cfg.color}>
                            <textarea value={data.objective} onChange={e => updateField('objective', e.target.value)}
                                placeholder={cfg.objectiveHint} rows={3}
                                className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:border-slate-400 text-slate-900 placeholder-slate-400 transition-all" />
                            <button onClick={() => handleAIPolish('objective')} disabled={isPolishing && polishTarget === 'objective'}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                {isPolishing && polishTarget === 'objective' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                AI Polish Statement
                            </button>

                            {/* Diff for objective */}
                            <AnimatePresence>
                                {pendingDiff?.target === 'objective' && (
                                    <DiffPanel original={pendingDiff.original} proposed={pendingDiff.proposed}
                                        onAccept={acceptDiff} onReject={rejectDiff} color={cfg.color} isText />
                                )}
                            </AnimatePresence>
                        </FormSection>

                        {/* Skills */}
                        <FormSection title="Key Skills" icon={<CheckCircle className="w-3.5 h-3.5" />} color={cfg.color}>
                            <button onClick={injectSkills} className="text-xs font-semibold mb-2.5 px-3 py-1.5 rounded-lg border w-full text-center transition-colors"
                                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                ✦ Auto-fill {cfg.label.split(' & ')[0]} skills
                            </button>
                            <div className="space-y-1.5">
                                {(data.skills.length === 0 ? [''] : data.skills).map((sk, i) => (
                                    <div key={i} className="flex gap-1.5 items-center">
                                        <input value={sk} onChange={e => {
                                            const s = [...data.skills]; if (s.length === 0) s.push(''); s[i] = e.target.value;
                                            setData(p => ({ ...p, skills: s }));
                                        }} placeholder={`Skill ${i + 1}`} className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-400 text-slate-900 bg-white" />
                                        <button onClick={() => setData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => setData(p => ({ ...p, skills: [...(p.skills || []), ''] }))}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 mt-0.5 transition-colors">
                                    <Plus className="w-3 h-3" /> Add Skill
                                </button>
                            </div>
                        </FormSection>

                        {/* Work Experience — draggable */}
                        <FormSection title="Work Experience" icon={<Briefcase className="w-3.5 h-3.5" />} color={cfg.color}>
                            <div className="space-y-3">
                                {data.work_experience.map((job, i) => (
                                    <JobBlock key={job.id || i} job={job} index={i} cfg={cfg}
                                        onChange={(path, val) => updateField(`work_experience.${i}.${path}`, val)}
                                        onAddBullet={() => setData(p => { const n = JSON.parse(JSON.stringify(p)); n.work_experience[i].bullets.push(''); return n; })}
                                        onRemoveBullet={(bi) => setData(p => { const n = JSON.parse(JSON.stringify(p)); n.work_experience[i].bullets = n.work_experience[i].bullets.filter((_, idx) => idx !== bi); return n; })}
                                        onBulletChange={(bi, val) => updateField(`work_experience.${i}.bullets.${bi}`, val)}
                                        onRemoveJob={() => removeJob(i)}
                                        canRemove={data.work_experience.length > 1}
                                        onAIPolish={() => handleAIPolish(i)}
                                        isPolishing={isPolishing && polishTarget === i}
                                        pendingDiff={pendingDiff?.target === i ? pendingDiff : null}
                                        onAcceptDiff={acceptDiff}
                                        onRejectDiff={rejectDiff}
                                        onInsertSuggestion={(b) => insertBulletSuggestion(i, b)}
                                    />
                                ))}
                            </div>
                            <button onClick={addJob} className="mt-2 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors w-full justify-center"
                                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                <Plus className="w-3.5 h-3.5" /> Add Another Job
                            </button>
                        </FormSection>

                        {/* Education */}
                        <FormSection title="Education" icon={<Sparkles className="w-3.5 h-3.5" />} color={cfg.color} collapsible>
                            {data.education.map((edu, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                                    <PTInput label="School / College" value={edu.institution} onChange={v => updateField(`education.${i}.institution`, v)} color={cfg.color} />
                                    <PTInput label="Qualification" value={edu.degree} onChange={v => updateField(`education.${i}.degree`, v)} color={cfg.color} />
                                    <PTInput label="Years" value={edu.period} onChange={v => updateField(`education.${i}.period`, v)} color={cfg.color} />
                                </div>
                            ))}
                        </FormSection>
                    </div>

                    {/* AI log */}
                    {polishLog && (
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 shrink-0">
                            <p className={`text-xs font-mono ${polishLog.startsWith('✖') ? 'text-red-500' : 'text-brand-primary'}`}>{polishLog}</p>
                        </div>
                    )}
                </div>

                {/* ══ RIGHT: LIVE PREVIEW ══ */}
                <div className="flex-1 bg-slate-100 overflow-y-auto flex justify-center py-8 px-4">
                    <div className="relative">
                        <div className="absolute -inset-3 bg-black/5 rounded-2xl blur-xl opacity-40 pointer-events-none" />
                        <div className="relative shadow-2xl ring-1 ring-slate-200/80" style={{ transform: 'scale(0.80)', transformOrigin: 'top center' }}>
                            <PartTimeCVPreview data={data} sector={sector} layout={layout} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Upload CV Panel ── */}
            <AnimatePresence>
                {showUpload && (
                    <CVUploadPanel
                        cfg={cfg}
                        onClose={() => setShowUpload(false)}
                        onExtracted={(extracted) => {
                            setData(extracted);
                            setShowUpload(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// JOB BLOCK (with bullet suggestions + AI polish)
// ─────────────────────────────────────────────
const JobBlock = ({ job, index, cfg, onChange, onAddBullet, onRemoveBullet, onBulletChange, onRemoveJob, canRemove, onAIPolish, isPolishing, pendingDiff, onAcceptDiff, onRejectDiff, onInsertSuggestion }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestions = cfg.bulletSuggestions;
    const roleKey = Object.keys(suggestions).find(k => job.role?.toLowerCase().includes(k.toLowerCase())) || 'General';
    const allSuggestions = [...(suggestions[roleKey] || []), ...(suggestions['General'] || [])];

    return (
        <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role {index + 1}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={onAIPolish} disabled={isPolishing} title="AI polish bullets"
                            className="p-1.5 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                            {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setShowSuggestions(s => !s)} title="Bullet suggestions"
                            className={`p-1.5 rounded-md transition-colors ${showSuggestions ? 'text-brand-primary bg-blue-50' : 'text-slate-400 hover:text-brand-primary hover:bg-blue-50'}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        {canRemove && <button onClick={onRemoveJob} className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <PTInput label="Job Title" value={job.role} onChange={v => onChange('role', v)} color={cfg.color} />
                    <PTInput label="Company" value={job.company} onChange={v => onChange('company', v)} color={cfg.color} />
                    <PTInput label="Period e.g. Jan 2024 – Present" value={job.period} onChange={v => onChange('period', v)} color={cfg.color} />
                </div>

                {/* Bullet suggestions dropdown */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mb-2 overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">💡 Suggested Bullets — click to insert</p>
                            <div className="space-y-1 max-h-36 overflow-y-auto">
                                {allSuggestions.map((s, si) => (
                                    <button key={si} onClick={() => { onInsertSuggestion(s); setShowSuggestions(false); }}
                                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-brand-primary hover:bg-blue-50 text-slate-600 hover:text-slate-900 transition-all leading-snug">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bullets */}
                <div className="space-y-1.5">
                    {job.bullets.map((b, bi) => (
                        <div key={bi} className="flex gap-1.5 items-start">
                            <textarea value={b} onChange={e => onBulletChange(bi, e.target.value)}
                                placeholder="Describe a key duty or achievement..." rows={2}
                                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:border-slate-400 text-slate-900 placeholder-slate-400 bg-white" />
                            <button onClick={() => onRemoveBullet(bi)} className="text-slate-300 hover:text-red-400 transition-colors mt-1.5">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <button onClick={onAddBullet} className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
                        <Plus className="w-3 h-3" /> Add bullet
                    </button>
                </div>
            </div>

            {/* Diff panel for bullets */}
            <AnimatePresence>
                {pendingDiff && (
                    <DiffPanel original={pendingDiff.original} proposed={pendingDiff.proposed}
                        onAccept={onAcceptDiff} onReject={onRejectDiff} color={cfg.color} isList />
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────
// DIFF PANEL — accept / reject AI changes
// ─────────────────────────────────────────────
const DiffPanel = ({ original, proposed, onAccept, onReject, color, isText, isList }) => (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
        className="mx-3 mb-3 rounded-xl border border-purple-200 bg-purple-50 overflow-hidden">
        <div className="px-3 py-2 border-b border-purple-100 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5" /> AI Suggestion — accept or reject?</span>
            <div className="flex gap-1.5">
                <button onClick={onAccept} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                    <ThumbsUp className="w-3 h-3" /> Accept
                </button>
                <button onClick={onReject} className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
                    <ThumbsDown className="w-3 h-3" /> Reject
                </button>
            </div>
        </div>
        <div className="p-3 grid grid-cols-2 gap-3">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Before</p>
                <div className="text-xs text-slate-500 bg-white rounded-lg p-2 border border-slate-200 line-through opacity-60">
                    {isText ? original : isList ? (original || []).map((b, i) => <div key={i} className="mb-0.5">• {b}</div>) : null}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">After</p>
                <div className="text-xs text-slate-800 bg-white rounded-lg p-2 border border-purple-200">
                    {isText ? proposed : isList ? (proposed || []).map((b, i) => <div key={i} className="mb-0.5">• {b}</div>) : null}
                </div>
            </div>
        </div>
    </motion.div>
);

// ─────────────────────────────────────────────
// LIVE PREVIEW (HTML — for screen only)
// ─────────────────────────────────────────────
const PartTimeCVPreview = ({ data, sector, layout }) => {
    const cfg = SECTOR_CONFIGS[sector];
    const { personal, objective, skills, work_experience, education } = data;
    const color = cfg.color;

    // ── ATS Layout — single column, plain text, no colour/tables ──
    if (layout === 'ats') {
        const ATSSection = ({ title }) => (
            <div style={{ margin: '16px 0 6px', borderBottom: '1.5px solid #000', paddingBottom: '2px' }}>
                <p style={{ fontFamily: 'Arial,sans-serif', fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: '#000' }}>{title}</p>
            </div>
        );
        // ATS Keywords — ONLY sector-specific terms (what the ATS scanner looks for)
        // User's raw skills go below as "Additional Skills" — keeps keyword block clean and relevant
        const SECTOR_ATS_KEYWORDS = {
            warehouse:   ['Warehouse Operations', 'Stock Control', 'Manual Handling', 'Pick & Pack', 'RF Scanning', 'Health & Safety Compliance', 'Forklift Operation', 'Inventory Management', 'Despatch & Inbound', 'WMS Systems'],
            carehome:    ['Person-Centred Care', 'Safeguarding Adults', 'Medication Administration', 'Manual Handling', 'Dignity & Respect', 'Care Planning', 'DBS Cleared', 'Dementia Awareness', 'Wellbeing Monitoring', 'Empathetic Communication'],
            freelance:   ['Client Communication', 'Project Management', 'Time Management', 'Deadline Delivery', 'Invoicing', 'Remote Collaboration', 'Self-Motivation', 'Task Prioritisation'],
            retail:      ['Customer Service', 'Cash Handling', 'Stock Replenishment', 'Visual Merchandising', 'Till Operation', 'Upselling', 'Loss Prevention', 'Product Knowledge'],
            kitchen:     ['Food Hygiene Level 2', 'HACCP', 'Allergen Awareness', 'Food Preparation', 'Kitchen Cleaning', 'Temperature Control', 'Mise en Place', 'Fast-Paced Service'],
            hospitality: ['Table Service', 'Bar Service', 'EPOS Till', 'Challenge 25', 'Cellar Management', 'Front-of-House', 'Upselling', 'Licencing Awareness'],
        };
        const atsKeywords = (SECTOR_ATS_KEYWORDS[sector] || []).slice(0, 10);
        const userSkillsList = (skills || []).filter(s => s.trim() && !atsKeywords.some(k => k.toLowerCase() === s.toLowerCase()));

        return (
            <div style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial,sans-serif', fontSize: '10pt', lineHeight: 1.55, color: '#000', padding: '52px 62px', boxSizing: 'border-box', background: '#fff' }}>

                {/* Header — plain text, no colour */}
                <p style={{ fontFamily: 'Arial,sans-serif', fontSize: '18pt', fontWeight: 800, margin: '0 0 4px', color: '#000' }}>{personal?.name || 'Your Name'}</p>
                <p style={{ fontSize: '9pt', margin: '0 0 14px', color: '#333' }}>
                    {[personal?.email, personal?.phone, personal?.location].filter(Boolean).join('  |  ')}
                </p>

                {/* Profile */}
                {objective?.trim() && <>
                    <ATSSection title="Personal Profile" />
                    <p style={{ fontSize: '10pt', lineHeight: 1.6, margin: '6px 0 0', color: '#000' }}>{objective}</p>
                </>}

                {/* ATS Keywords — sector-relevant terms only */}
                {atsKeywords.length > 0 && <>
                    <ATSSection title="Key Skills" />
                    <p style={{ fontSize: '10pt', margin: '6px 0 0', lineHeight: 1.8, color: '#000' }}>
                        {atsKeywords.join('  •  ')}
                    </p>
                    {userSkillsList.length > 0 && (
                        <p style={{ fontSize: '9.5pt', margin: '4px 0 0', color: '#444' }}>
                            <strong>Additional:</strong> {userSkillsList.join(', ')}
                        </p>
                    )}
                </>}

                {/* Experience */}
                {work_experience?.filter(j => j.role?.trim() || j.company?.trim()).length > 0 && <>
                    <ATSSection title="Work Experience" />
                    {work_experience.filter(j => j.role?.trim() || j.company?.trim()).map((job, i) => (
                        <div key={i} style={{ marginTop: '10px', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ fontWeight: 700, fontSize: '10.5pt', margin: 0 }}>{job.role || '—'}</p>
                                <p style={{ fontSize: '9.5pt', margin: 0, color: '#333' }}>{job.period || ''}</p>
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '9.5pt', margin: '1px 0 4px', color: '#333' }}>{job.company || ''}</p>
                            {job.bullets?.filter(b => b.trim()).map((b, bi) => (
                                <div key={bi} style={{ display: 'flex', gap: '8px', marginBottom: '3px', paddingLeft: '8px' }}>
                                    <span style={{ minWidth: '12px', color: '#000', fontWeight: 700 }}>▪</span>
                                    <p style={{ margin: 0, fontSize: '10pt', lineHeight: 1.55 }}>{b}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </>}

                {/* Education */}
                {education?.filter(e => e.institution?.trim()).length > 0 && <>
                    <ATSSection title="Education" />
                    {education.filter(e => e.institution?.trim()).map((edu, i) => (
                        <div key={i} style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ fontWeight: 700, fontSize: '10pt', margin: 0 }}>{edu.institution}</p>
                                <p style={{ fontSize: '9.5pt', margin: 0, color: '#333' }}>{edu.period || ''}</p>
                            </div>
                            {edu.degree && <p style={{ fontSize: '9.5pt', margin: '1px 0 0', fontStyle: 'italic' }}>{edu.degree}</p>}
                        </div>
                    ))}
                </>}

                {/* References */}
                <ATSSection title="References" />
                <p style={{ fontSize: '10pt', margin: '6px 0 0' }}>Available upon request.</p>
            </div>
        );
    }

    const SectionLabel = ({ children }) => (
        <h3 style={{ fontSize: '8.5pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color, margin: '0 0 8px', paddingBottom: '4px', borderBottom: `1.5px solid ${color}` }}>{children}</h3>
    );

    const isTwo = layout === 'two-col';

    return (
        <div className="cv-document bg-white" style={{ width: '794px', minHeight: '1123px', fontFamily: "'Inter','Helvetica Neue',sans-serif", fontSize: '10pt', lineHeight: 1.5, color: '#1e293b', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ borderBottom: `3px solid ${color}`, padding: '36px 52px 20px' }}>
                <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#0f172a', margin: '0 0 3px', letterSpacing: '-0.3px' }}>{personal?.name || 'Your Name'}</h1>
                <div style={{ fontSize: '8.5pt', fontWeight: 700, color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{cfg.label} · Part-Time</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '8.5pt', color: '#64748b' }}>
                    {personal?.email && <span>✉ {personal.email}</span>}
                    {personal?.phone && <span>📱 {personal.phone}</span>}
                    {personal?.location && <span>📍 {personal.location}</span>}
                </div>
            </div>

            <div style={{ padding: '22px 52px' }}>
                {/* Objective */}
                {objective && <div style={{ background: `${color}12`, borderLeft: `3px solid ${color}`, borderRadius: '0 6px 6px 0', padding: '10px 13px', marginBottom: '18px' }}>
                    <SectionLabel>Personal Statement</SectionLabel>
                    <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', lineHeight: 1.6 }}>{objective}</p>
                </div>}

                {isTwo ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
                        {/* Left col */}
                        <div>
                            {skills?.filter(s => s.trim()).length > 0 && <div style={{ marginBottom: '18px' }}>
                                <SectionLabel>Key Skills</SectionLabel>
                                {skills.filter(s => s.trim()).map((sk, i) => (
                                    <div key={i} style={{ fontSize: '9pt', color: '#334155', padding: '3px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '6px' }}>
                                        <span style={{ color, fontWeight: 700 }}>▸</span>{sk}
                                    </div>
                                ))}
                            </div>}
                            {education?.length > 0 && <div>
                                <SectionLabel>Education</SectionLabel>
                                {education.map((edu, i) => (
                                    <div key={i} style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a' }}>{edu.institution || '—'}</div>
                                        {edu.degree && <div style={{ fontSize: '8.5pt', color, fontStyle: 'italic' }}>{edu.degree}</div>}
                                        {edu.period && <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.period}</div>}
                                    </div>
                                ))}
                            </div>}
                        </div>
                        {/* Right col */}
                        <div>
                            {work_experience?.length > 0 && <div>
                                <SectionLabel>Work Experience</SectionLabel>
                                {work_experience.map((job, i) => (
                                    <div key={i} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: i < work_experience.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{job.role || '—'}</div>
                                            {job.period && <span style={{ fontSize: '8pt', color: '#94a3b8', background: '#f8fafc', padding: '2px 7px', borderRadius: '999px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{job.period}</span>}
                                        </div>
                                        {job.company && <div style={{ fontSize: '9pt', fontWeight: 700, color, marginBottom: '4px' }}>{job.company}</div>}
                                        {job.bullets?.filter(b => b.trim()).length > 0 && (
                                            <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                                                {job.bullets.filter(b => b.trim()).map((b, bi) => (
                                                    <li key={bi} style={{ fontSize: '9.5pt', marginBottom: '2px', lineHeight: 1.45, color: '#334155' }}>{b}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>}
                        </div>
                    </div>
                ) : (
                    /* One-column layout */
                    <div>
                        {skills?.filter(s => s.trim()).length > 0 && <div style={{ marginBottom: '18px' }}>
                            <SectionLabel>Key Skills</SectionLabel>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {skills.filter(s => s.trim()).map((sk, i) => (
                                    <span key={i} style={{ fontSize: '8.5pt', background: `${color}12`, color, border: `1px solid ${color}30`, borderRadius: '999px', padding: '3px 10px', fontWeight: 600 }}>{sk}</span>
                                ))}
                            </div>
                        </div>}
                        {work_experience?.length > 0 && <div style={{ marginBottom: '18px' }}>
                            <SectionLabel>Work Experience</SectionLabel>
                            {work_experience.map((job, i) => (
                                <div key={i} style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <div><span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{job.role || '—'}</span>{job.company && <span style={{ fontSize: '9pt', color, fontWeight: 600 }}> · {job.company}</span>}</div>
                                        {job.period && <span style={{ fontSize: '8pt', color: '#94a3b8' }}>{job.period}</span>}
                                    </div>
                                    {job.bullets?.filter(b => b.trim()).length > 0 && <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                        {job.bullets.filter(b => b.trim()).map((b, bi) => <li key={bi} style={{ fontSize: '9.5pt', marginBottom: '2px', lineHeight: 1.45 }}>{b}</li>)}
                                    </ul>}
                                </div>
                            ))}
                        </div>}
                        {education?.length > 0 && <div>
                            <SectionLabel>Education</SectionLabel>
                            {education.map((edu, i) => (
                                <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>{edu.institution || '—'}</div>
                                        {edu.degree && <div style={{ fontSize: '8.5pt', color, fontStyle: 'italic' }}>{edu.degree}</div>}
                                    </div>
                                    {edu.period && <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.period}</div>}
                                </div>
                            ))}
                        </div>}
                    </div>
                )}

                <div style={{ marginTop: '24px', paddingTop: '10px', borderTop: `1px solid ${color}30`, fontSize: '8pt', color: '#94a3b8', textAlign: 'center' }}>
                    References available upon request · Part-Time CV · Generated with GokulCV
                </div>
            </div>
        </div>
    );
};

export default PartTimeCVGenerator;
