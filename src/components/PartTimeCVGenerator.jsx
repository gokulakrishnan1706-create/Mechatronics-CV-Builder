import React, { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDF } from '../services/PDFTemplates';
import { sanitiseDeep } from '../services/ai';
import {
    User, Briefcase, Wand2, Download, Loader2, CheckCircle, X, Plus, Trash2,
    ArrowLeft, Sparkles, Heart, Package, Clock, ShoppingBag, ChefHat,
    Wine, RotateCcw, Save, ThumbsUp, ThumbsDown,
    ChevronDown, ChevronUp, Upload, FileText, Target, Zap, ArrowRight,
    RefreshCw, PenLine
} from 'lucide-react';
import { saveCVVersion, saveCV, getUser } from '../services/supabase';
import { getVisionPrompt, getPolishPrompt, validateCVOutput } from '../services/partTimeAlgorithm';
import { callAI, hasAnyKey } from '../services/aiRouter';

// ─────────────────────────────────────────────
// SECTOR CONFIGS
// ─────────────────────────────────────────────
const SECTOR_CONFIGS = {
    warehouse: {
        label: 'Warehouse & Logistics', icon: Package, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
        skills: ['Forklift Operator (Counterbalance/Reach)', 'Manual Handling & Load Securing', 'Stock Control & Inventory Management', 'Health & Safety Compliance', 'RF Scanning & Warehouse Management Systems', 'Pick, Pack & Despatch Operations'],
        objectiveHint: 'Reliable and physically fit individual seeking a part-time warehouse operative role...',
        bulletSuggestions: {
            'Warehouse Operative': ['Operated counterbalance forklift to move pallets across a 50,000 sq ft warehouse safely', 'Achieved 99.8% pick accuracy across 500+ daily orders using RF scanning equipment', 'Consistently met daily pick targets of 300+ units per shift with zero errors', 'Assisted in full stock counts reducing inventory discrepancies by 15%'],
            'Stock Controller': ['Managed inbound and outbound stock movements using WMS software', 'Identified and resolved stock discrepancies reducing shrinkage by 20%', 'Conducted daily cycle counts ensuring 98% inventory accuracy'],
            'General': ['Maintained a clean and organised work area in compliance with H&S regulations', 'Completed mandatory manual handling and fire safety training', 'Collaborated with team members to meet daily despatch deadlines'],
        },
    },
    carehome: {
        label: 'Care Home & Support Work', icon: Heart, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3',
        skills: ['Personal Care & Dignity-Led Support', 'Medication Administration', 'Dementia & Alzheimer\'s Awareness', 'Moving & Handling Certificate', 'Safeguarding Adults & DBS Cleared', 'Empathy, Patience & Active Listening'],
        objectiveHint: 'Compassionate and dedicated care professional seeking a part-time support worker role...',
        bulletSuggestions: {
            'Care Assistant': ['Provided dignified personal care to 8+ residents daily including bathing, dressing and medication prompts', 'Supported residents with dementia using person-centred care approaches, improving daily wellbeing scores', 'Maintained accurate care records and handover notes using digital care management system'],
            'Support Worker': ['Assisted service users with daily living activities promoting independence and choice', 'Developed trusting relationships with vulnerable adults through consistent, empathetic support', 'Reported safeguarding concerns promptly in line with organisational policy'],
            'General': ['Upheld dignity and respect for all service users at all times', 'Participated in regular team meetings and training sessions', 'Maintained confidentiality in line with GDPR and organisational policy'],
        },
    },
    freelance: {
        label: 'Freelance & Gig Work', icon: Clock, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
        skills: ['Time Management & Self-Motivation', 'Client Communication & Relationship Building', 'Task Prioritisation & Deadline Management', 'Invoicing & Basic Bookkeeping', 'Adaptability Across Multiple Projects', 'Remote Collaboration (Slack, Trello, Zoom)'],
        objectiveHint: 'Versatile and self-directed professional seeking flexible freelance opportunities...',
        bulletSuggestions: {
            'Freelancer': ['Delivered 20+ client projects on time and within budget, maintaining a 5-star review rating', 'Managed end-to-end client relationships from initial brief through to final delivery', 'Juggled 3–5 concurrent projects whilst maintaining consistent quality standards'],
            'General': ['Proactively communicated project updates to clients, reducing revision rounds by 30%', 'Built a repeat client base through reliable delivery and professional communication', 'Self-managed invoicing, scheduling and client onboarding independently'],
        },
    },
    retail: {
        label: 'Retail & Customer Service', icon: ShoppingBag, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd',
        skills: ['Customer Service & Complaint Resolution', 'Cash Handling & Till Operation', 'Stock Replenishment & Merchandising', 'Product Knowledge & Upselling', 'Loss Prevention Awareness', 'Team Collaboration & Communication'],
        objectiveHint: 'Friendly and customer-focused individual seeking a part-time retail or customer service role...',
        bulletSuggestions: {
            'Sales Assistant': ['Delivered excellent customer service to 100+ daily customers, consistently receiving positive feedback', 'Processed cash and card transactions accurately with zero till discrepancies over 6 months', 'Replenished and merchandised stock displays to maximise visual appeal and sales'],
            'Customer Service Advisor': ['Resolved customer complaints efficiently, achieving a 95% first-contact resolution rate', 'Processed refunds, exchanges and account queries in line with company policy', 'Exceeded upselling targets by 20% through confident product recommendations'],
            'General': ['Maintained a clean, safe and well-organised shop floor at all times', 'Supported colleagues during peak trading periods including Christmas and sale events', 'Completed till training and product knowledge sessions within first week of employment'],
        },
    },
    kitchen: {
        label: 'Kitchen & Catering', icon: ChefHat, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
        skills: ['Food Preparation & Knife Skills', 'Food Hygiene Certificate (Level 2)', 'HACCP & Temperature Control', 'Allergen Awareness & Labelling', 'Kitchen Cleaning & Deep Clean Procedures', 'Working Under Pressure in Fast-Paced Environments'],
        objectiveHint: 'Hardworking and food-safety conscious individual seeking a part-time kitchen or catering role...',
        bulletSuggestions: {
            'Kitchen Assistant': ['Prepared fresh ingredients daily for a 120-cover restaurant, maintaining food hygiene standards throughout', 'Completed all cleaning tasks to HACCP standards, passing every environmental health inspection', 'Supported head chef during busy service periods, ensuring timely delivery of dishes'],
            'Catering Assistant': ['Served food and beverages to 200+ guests at corporate events maintaining professional presentation', 'Set up and broke down catering stations efficiently, adhering to strict time schedules', 'Managed allergen queries confidently, ensuring guest safety at all times'],
            'General': ['Maintained Level 2 Food Hygiene Certificate and applied standards consistently', 'Operated commercial dishwasher and kitchen equipment safely following training', 'Contributed to a positive kitchen team environment during high-pressure service periods'],
        },
    },
    hospitality: {
        label: 'Hospitality & Bar Work', icon: Wine, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
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
// EMPTY DATA + STORAGE
// ─────────────────────────────────────────────
const makeEmptyData = () => ({
    personal: { name: '', email: '', phone: '', location: '' },
    objective: '',
    skills: [],
    work_experience: [{ id: Date.now(), company: '', role: '', period: '', bullets: [''] }],
    education: [{ institution: '', degree: '', period: '' }],
});

const STORAGE_KEY = 'gokulcv_parttime_v2';

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
const PTInput = ({ label, value, onChange, color, placeholder }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: focused ? color : '#94a3b8' }}>{label}</label>
            <input
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || ''}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ borderColor: focused ? color : undefined, boxShadow: focused ? `0 0 0 3px ${color}18` : undefined }}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none text-slate-900 placeholder-slate-300 bg-white transition-all"
            />
        </div>
    );
};

const FormSection = ({ title, icon, children, color, collapsible = false }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={{ background: `${color}0d`, borderBottom: open ? `1px solid ${color}22` : 'none' }}
                onClick={() => collapsible && setOpen(o => !o)}
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg" style={{ background: `${color}22`, color }}>{icon}</div>
                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                </div>
                {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
            </div>
            {(!collapsible || open) && <div className="px-4 py-3">{children}</div>}
        </div>
    );
};

// ─────────────────────────────────────────────
// UPLOAD SCREEN — Phase 1
// ─────────────────────────────────────────────
const UploadScreen = ({ sector, setSector, uploadFile, setUploadFile, uploadJD, setUploadJD, onOptimise, onClose, onManual }) => {
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();
    const cfg = SECTOR_CONFIGS[sector];

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.type === 'application/pdf' || f.type.startsWith('image/'))) {
            setUploadFile(f);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col font-sans bg-brand-bg text-brand-text overflow-hidden"
        >
            {/* Ambient Background Glows — matches Homepage */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[150px] opacity-60"></div>
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40"></div>
            </div>

            {/* Navbar-style Header — matches Homepage nav */}
            <nav className="relative z-20 bg-white/80 backdrop-blur-md border-b border-brand-border flex items-center px-8 py-4 shrink-0">
                <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-text hover:bg-slate-100 rounded-full transition-all active:scale-95 mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-brand-border mr-4" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                        {React.createElement(cfg.icon, { className: 'w-5 h-5 text-brand-primary' })}
                    </div>
                    <div>
                        <h1 className="font-bold text-brand-text text-base tracking-tight">Part-Time CV Generator</h1>
                        <p className="text-[11px] text-brand-muted font-medium">AI-powered optimisation for {cfg.label}</p>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-12 pb-24">

                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-brand-primary text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" /> CV Synthesis Engine
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-text">Upload & Optimise</h2>
                        <p className="text-lg text-brand-muted max-w-xl mx-auto font-light leading-relaxed">Select your sector, upload your CV, and let our AI engine transform it into a high-impact document.</p>
                    </div>

                    {/* Step 1: Sector Selection */}
                    <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm hover:shadow-md transition-shadow mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-brand-primary">01</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-text tracking-tight">Choose Your Sector</h3>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(SECTOR_CONFIGS).map(([key, s]) => {
                                const Icon = s.icon;
                                const isActive = sector === key;
                                return (
                                    <button key={key} onClick={() => setSector(key)}
                                        className={`flex flex-col items-center justify-center gap-3 px-4 py-5 rounded-2xl border transition-all duration-300 group ${
                                            isActive
                                                ? 'bg-blue-50 border-brand-primary/40 shadow-md ring-1 ring-brand-primary/20'
                                                : 'bg-white border-brand-border hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm ${
                                            isActive
                                                ? 'bg-white border-blue-100 scale-110'
                                                : 'bg-slate-50 border-slate-100 group-hover:scale-110 group-hover:bg-white'
                                        }`}>
                                            <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text'}`} />
                                        </div>
                                        <span className={`text-center font-bold tracking-tight text-sm ${isActive ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text'}`}>{s.label.split(' & ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm hover:shadow-md transition-shadow mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-brand-accent">02</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-text tracking-tight">Upload Existing CV</h3>
                        </div>
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 select-none relative ${
                                dragOver
                                    ? 'border-brand-primary bg-blue-50/50 scale-[1.01] shadow-md'
                                    : uploadFile
                                    ? 'border-emerald-300 bg-emerald-50/30'
                                    : 'border-brand-border bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                            }`}
                        >
                            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden"
                                onChange={e => setUploadFile(e.target.files[0])} />
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
                                        <FileText className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-base font-bold text-brand-text">{uploadFile.name}</p>
                                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {(uploadFile.size / 1024).toFixed(0)} KB · Ready to optimise</p>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); setUploadFile(null); }}
                                        className="ml-auto p-2.5 rounded-xl text-brand-muted hover:text-red-600 hover:bg-red-50 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-white border border-brand-border shadow-sm">
                                        <Upload className="w-7 h-7 text-brand-muted" />
                                    </div>
                                    <p className="text-lg font-bold text-brand-text mb-1 tracking-tight">Drag & drop your CV here</p>
                                    <p className="text-sm text-brand-muted">or click to browse · PDF, JPG, PNG supported</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Job Description */}
                    <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm hover:shadow-md transition-shadow mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-indigo-600">03</span>
                            </div>
                            <h3 className="text-xl font-bold text-brand-text tracking-tight">Target Role
                                <span className="ml-2 text-sm font-normal text-brand-muted">(optional)</span>
                            </h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={uploadJD}
                                onChange={e => setUploadJD(e.target.value)}
                                rows={4}
                                placeholder="Paste the job description here and the AI will tailor your CV specifically for this role, weaving in the right keywords and phrasing..."
                                className="w-full text-base border border-brand-border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-brand-text placeholder-slate-400 bg-slate-50/50 transition-all leading-relaxed"
                            />
                            {uploadJD.trim() && (
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-emerald-50 border border-emerald-200 text-emerald-700">
                                    <Target className="w-3.5 h-3.5" /> JD Loaded
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-4">
                        <motion.button
                            onClick={onOptimise}
                            disabled={!uploadFile}
                            whileHover={uploadFile ? { scale: 1.01 } : {}}
                            whileTap={uploadFile ? { scale: 0.98 } : {}}
                            className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                uploadFile
                                    ? 'bg-brand-text hover:bg-slate-800 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-brand-border'
                            }`}
                        >
                            <Zap className="w-5 h-5" />
                            {uploadJD.trim() ? 'Optimise & Tailor to Role' : 'Optimise My CV with AI'}
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>

                        <button
                            onClick={onManual}
                            className="w-full py-3.5 rounded-full text-sm font-medium text-brand-muted hover:text-brand-text bg-white border border-brand-border hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95">
                            <PenLine className="w-4 h-4" />
                            Start from scratch instead
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// OPTIMISING SCREEN — Phase 2
// ─────────────────────────────────────────────
const OptimisingScreen = ({ steps, error, sector, fileName, onRetry }) => {
    const cfg = SECTOR_CONFIGS[sector];
    const CfgIcon = cfg.icon;
    const allDone = steps.length > 0 && steps.every(s => s.status === 'done');
    const doneCount = steps.filter(s => s.status === 'done').length;
    const progressPercent = allDone ? 100 : Math.max(8, (doneCount / Math.max(steps.length, 1)) * 100);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-bg flex flex-col items-center justify-center font-sans p-6 overflow-hidden text-brand-text"
        >
            {/* Ambient Background Glows — matches Homepage */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[150px] opacity-60"></div>
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40"></div>
            </div>

            <div className="w-full max-w-md text-center relative z-10">

                {/* Animated icon */}
                <div className="relative mx-auto w-28 h-28 mb-10">
                    {!allDone && !error && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border-[3px] border-transparent"
                            style={{ borderTopColor: '#2563EB', borderRightColor: '#0EA5E9' }}
                        />
                    )}
                    <div className="absolute inset-3 rounded-full flex items-center justify-center bg-white border border-brand-border shadow-sm">
                        {allDone
                            ? <CheckCircle className="w-12 h-12 text-emerald-500" />
                            : error
                            ? <X className="w-12 h-12 text-red-500" />
                            : <CfgIcon className="w-12 h-12 text-brand-primary animate-pulse" />
                        }
                    </div>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-brand-text mb-3">
                    {allDone ? 'Your CV is Ready' : error ? 'Something Went Wrong' : 'Optimising Your CV'}
                </h2>
                {fileName && !error && (
                    <p className="text-sm text-brand-muted mb-10 font-medium truncate max-w-xs mx-auto bg-slate-50 border border-brand-border px-4 py-1.5 rounded-full shadow-sm">{fileName}</p>
                )}

                {/* Steps */}
                {!error && (
                    <div className="space-y-3 text-left mt-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-3 bg-white border border-brand-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border shadow-sm ${
                                    step.status === 'done' ? 'bg-emerald-50 border-emerald-200' :
                                    step.status === 'loading' ? 'bg-blue-50 border-blue-200' :
                                    'bg-slate-50 border-brand-border'
                                }`}>
                                    {step.status === 'done'
                                        ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        : step.status === 'loading'
                                        ? <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                                        : <div className="w-2 h-2 rounded-full bg-slate-300" />
                                    }
                                </div>
                                <span className={`text-sm ${
                                    step.status === 'done' ? 'text-brand-text font-semibold' :
                                    step.status === 'loading' ? 'text-brand-primary font-bold' :
                                    'text-brand-muted'
                                }`}>
                                    {step.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-8 space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700 text-left shadow-sm">
                            {error}
                        </div>
                        <button onClick={onRetry}
                            className="w-full py-3.5 rounded-full font-bold text-white text-sm flex items-center justify-center gap-2 bg-brand-text hover:bg-slate-800 transition-all active:scale-95 shadow-md">
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </button>
                    </div>
                )}

                {/* Progress bar */}
                {!error && (
                    <div className="mt-10">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-brand-border/50">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                            <span>Processing</span>
                            <span className={allDone ? 'text-emerald-600' : ''}>{allDone ? 'Complete' : `${Math.round(progressPercent)}%`}</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const PartTimeCVGenerator = ({ onClose }) => {

    // ── Phase management ──
    const [phase, setPhase] = useState('upload'); // 'upload' | 'optimising' | 'result'

    // ── Upload phase state ──
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadJD, setUploadJD] = useState('');
    const [optimiseSteps, setOptimiseSteps] = useState([]);
    const [optimiseError, setOptimiseError] = useState('');
    const [showNewBadge, setShowNewBadge] = useState(false);

    // ── Persistent state ──
    const [sector, setSector] = useState(() => {
        try { const s = localStorage.getItem(STORAGE_KEY + '_sector'); return s || 'warehouse'; } catch { return 'warehouse'; }
    });
    const [data, setData] = useState(() => {
        try { const s = localStorage.getItem(STORAGE_KEY); return s ? sanitiseDeep(JSON.parse(s)) : makeEmptyData(); } catch { return makeEmptyData(); }
    });
    const [layout, setLayout] = useState(() => {
        try { const s = localStorage.getItem(STORAGE_KEY + '_layout'); return s || 'two-col'; } catch { return 'two-col'; }
    });

    // ── Result/editor state ──
    const [isPolishing, setIsPolishing] = useState(false);
    const [polishTarget, setPolishTarget] = useState(null);
    const [pendingDiff, setPendingDiff] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [polishLog, setPolishLog] = useState('');
    const [savedToast, setSavedToast] = useState(false);
    const [atsFix, setAtsFix] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [savedCvId, setSavedCvId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [atsRescanScore] = useState(null);

    const cfg = SECTOR_CONFIGS[sector];
    const CfgIcon = cfg.icon;
    const { score, checks } = getCompleteness(data);

    // ── Auto-save ──
    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitiseDeep(data))); } catch { /* ignore */ }
        }, 800);
        return () => clearTimeout(t);
    }, [data]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY + '_sector', sector); } catch { /* ignore */ }
    }, [sector]);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY + '_layout', layout); } catch { /* ignore */ }
    }, [layout]);

    // ── ATS Fix Mode: read context from sessionStorage ──
    useEffect(() => {
        const raw = sessionStorage.getItem('gokulcv_ats_fix_context');
        if (raw) {
            try {
                const ctx = JSON.parse(raw);
                if (Date.now() - ctx.timestamp < 30 * 60 * 1000) {
                    setAtsFix(ctx);
                    if (ctx.sector) setSector(ctx.sector);
                }
                sessionStorage.removeItem('gokulcv_ats_fix_context');
            } catch (e) {
                console.error('Failed to parse ATS context:', e);
            }
        }
        getUser().then(setCurrentUser);
    }, []);

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

    const resetData = () => {
        if (confirm('Clear all data? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            setData(makeEmptyData());
        }
    };

    const manualSave = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitiseDeep(data))); setSavedToast(true); setTimeout(() => setSavedToast(false), 2000); } catch { /* ignore */ }
    };

    // ── OPTIMISE: the main extraction + AI flow ──
    const toBase64 = (f) => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(f);
    });

    const STEPS_LABELS = (hasJD) => [
        'Reading your CV',
        hasJD ? 'Structuring & tailoring with AI' : 'Structuring with AI',
        'Parsing CV data',
        'Building your new version',
    ];

    const setStep = (idx, status) => {
        setOptimiseSteps(prev => prev.map((s, i) => i === idx ? { ...s, status } : s));
    };

    const handleOptimise = async () => {
        if (!uploadFile) return;
        const hasJD = uploadJD.trim().length > 0;
        const labels = STEPS_LABELS(hasJD);

        setOptimiseError('');
        setOptimiseSteps(labels.map((label, i) => ({ label, status: i === 0 ? 'loading' : 'pending' })));
        setPhase('optimising');

        try {
            const { extractTextFromPDF, buildExtractionPrompt, structureWithGroq, parseExtractedJSON } =
                await import('../services/pdfExtract.js');

            let raw;

            if (uploadFile.type === 'application/pdf') {
                const cvText = await extractTextFromPDF(uploadFile);
                if (!cvText || cvText.length < 50) {
                    throw new Error('Could not extract text from this PDF. It may be a scanned image — try uploading as JPG instead.');
                }

                setStep(0, 'done');
                setStep(1, 'loading');

                const prompt = buildExtractionPrompt(cvText, uploadJD, sector);
                raw = await structureWithGroq(prompt);

            } else {
                // Image CV — use Gemini vision
                const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (!geminiKey) throw new Error('Image CVs require VITE_GEMINI_API_KEY. Please upload as PDF instead.');

                const base64 = await toBase64(uploadFile);

                const imagePrompt = getVisionPrompt(uploadJD, sector);

                setStep(0, 'done');
                setStep(1, 'loading');

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [
                            { inline_data: { mime_type: uploadFile.type, data: base64 } },
                            { text: imagePrompt }
                        ]}] })
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

            setStep(1, 'done');
            setStep(2, 'loading');

            const rawParsed = parseExtractedJSON(raw);
            const parsed = validateCVOutput(rawParsed);
            parsed.work_experience = parsed.work_experience.map((j, i) => ({ ...j, id: Date.now() + i }));

            setStep(2, 'done');
            setStep(3, 'loading');

            await new Promise(r => setTimeout(r, 700));

            setData(sanitiseDeep(parsed));

            setStep(3, 'done');

            await new Promise(r => setTimeout(r, 500));
            setPhase('result');
            setShowNewBadge(true);
            setTimeout(() => setShowNewBadge(false), 5000);

        } catch (err) {
            setOptimiseError(err.message);
            setOptimiseSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
            setPhase('upload');
        }
    };

    const handleRetry = () => {
        setOptimiseError('');
        setOptimiseSteps([]);
        setPhase('upload');
    };


    // ── AI Polish ──
    const handleAIPolish = async (target) => {
        if (!hasAnyKey()) { alert('Add VITE_GROQ_API_KEY to your .env file'); return; }
        setIsPolishing(true);
        setPolishTarget(target);
        setPolishLog('Polishing with AI...');

        try {
            const prompt = getPolishPrompt(target, data, sector, atsFix);
            const original = target === 'objective' ? data.objective : data.work_experience[target].bullets.filter(b => b.trim());

            const isObjective = target === 'objective';
            const text = await callAI(prompt, 'polish', {
                jsonMode: !isObjective,
                maxTokens: 2048,
            });

            if (!text) throw new Error('AI providers unavailable. Check your API keys.');

            let proposed;
            if (isObjective) {
                proposed = text.replace(/^["']|["']$/g, '').trim();
            } else {
                const s = text.indexOf('[');
                const e = text.lastIndexOf(']');
                proposed = s !== -1 ? sanitiseDeep(JSON.parse(text.substring(s, e + 1))) : sanitiseDeep(JSON.parse(text));
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

    const acceptDiff = async () => {
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

        if (currentUser) {
            try {
                const currentData = JSON.parse(JSON.stringify(data));
                if (target === 'objective') currentData.objective = proposed;
                else currentData.work_experience[target].bullets = proposed;
                await saveCVVersion({
                    savedCvId,
                    cvData: currentData,
                    sector,
                    atsScore: atsFix?.previousScore || null,
                    atsJobType: atsFix?.jobType || null,
                    notes: atsFix ? `ATS Fix Mode — was ${atsFix.previousScore}/100` : null,
                });
            } catch (e) {
                console.error('Version save failed silently:', e);
            }
        }
    };

    const rejectDiff = () => setPendingDiff(null);

    // ── Download PDF ──
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const name = data?.personal?.name || 'CV';
            const filename = `${name}_${sector}_GokulCV.pdf`.replace(/[^a-zA-Z0-9_\-.]/g, '_');
            const blob = await generatePDF(data, layout, { sector, data });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.rel = 'noopener';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 10000);
        } catch (err) {
            console.error('[PDF] Part-time export failed:', err);
            alert('PDF export failed: ' + err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    const addJob = () => setData(prev => ({
        ...prev,
        work_experience: [...prev.work_experience, { id: Date.now(), company: '', role: '', period: '', bullets: [''] }]
    }));

    const removeJob = (i) => setData(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, idx) => idx !== i) }));

    // ─────────────────────────────────────────
    // RENDER — phase-based
    // ─────────────────────────────────────────

    return (
        <AnimatePresence mode="wait">
            {phase === 'upload' && (
                <UploadScreen
                    key="upload"
                    sector={sector}
                    setSector={setSector}
                    uploadFile={uploadFile}
                    setUploadFile={setUploadFile}
                    uploadJD={uploadJD}
                    setUploadJD={setUploadJD}
                    onOptimise={handleOptimise}
                    onClose={onClose}
                    onManual={() => setPhase('result')}
                />
            )}

            {phase === 'optimising' && (
                <OptimisingScreen
                    key="optimising"
                    steps={optimiseSteps}
                    error={optimiseError}
                    sector={sector}
                    fileName={uploadFile?.name}
                    onRetry={handleRetry}
                />
            )}

            {phase === 'result' && (
                <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans overflow-hidden"
                >
                    {/* ── Header ── */}
                    <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm gap-3">
                        {/* Left */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="h-5 w-px bg-slate-200 shrink-0" />
                            <div className="p-2 rounded-xl shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                <CfgIcon className="w-4 h-4" style={{ color: cfg.color }} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-slate-900 text-sm leading-tight truncate">Part-Time CV Generator</h1>
                                <p className="text-[11px] truncate" style={{ color: cfg.color }}>{cfg.label}</p>
                            </div>

                            {/* New Version badge */}
                            <AnimatePresence>
                                {showNewBadge && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.85, x: -8 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        New version ready
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right: controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Completeness pill */}
                            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : score >= 50 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                <div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                                {score}%
                            </div>

                            {/* Optimise another CV */}
                            <button
                                onClick={() => { setUploadFile(null); setUploadJD(''); setPhase('upload'); }}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-xs transition-all"
                                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                <Upload className="w-3.5 h-3.5" />
                                Optimise CV
                            </button>

                            {/* Layout selector */}
                            <div className="hidden sm:flex items-center gap-0.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
                                {[
                                    { id: 'two-col', label: '2-Col' },
                                    { id: 'one-col', label: '1-Col' },
                                    { id: 'ats', label: '🎯 ATS' },
                                ].map(opt => (
                                    <button key={opt.id} onClick={() => setLayout(opt.id)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${layout === opt.id ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Save draft */}
                            <button onClick={manualSave} title="Save draft" className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative">
                                <Save className="w-4 h-4" />
                                <AnimatePresence>
                                    {savedToast && (
                                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded whitespace-nowrap">
                                            Saved!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            {/* Reset */}
                            <button onClick={resetData} title="Clear all data" className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Save to Supabase */}
                            {currentUser && data?.personal?.name && (
                                <button
                                    onClick={async () => {
                                        setSaveStatus('saving');
                                        try {
                                            const saved = await saveCV({
                                                title: `${data.personal.name || 'My CV'} — ${sector} — ${new Date().toLocaleDateString('en-GB')}`,
                                                sector,
                                                cvData: data,
                                                atsScore: atsRescanScore || atsFix?.previousScore || null,
                                                atsJobType: atsFix?.jobType || null,
                                                atsSector: atsFix?.sector || sector,
                                            });
                                            setSavedCvId(saved.id);
                                            setSaveStatus('saved');
                                            setTimeout(() => setSaveStatus('idle'), 3000);
                                        } catch (e) {
                                            console.error('Save failed:', e);
                                            setSaveStatus('error');
                                        }
                                    }}
                                    disabled={saveStatus === 'saving'}
                                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs text-white transition-all ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                                >
                                    {saveStatus === 'saving' ? '💾 Saving...' : saveStatus === 'saved' ? '✓ Saved!' : '💾 Save CV'}
                                </button>
                            )}

                            {/* Download PDF */}
                            <button onClick={handleDownload} disabled={isDownloading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all shadow-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
                                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {isDownloading ? 'Building…' : '↓ PDF'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* ══ LEFT: FORM ══ */}
                        <div className="w-[460px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

                            {/* ATS Fix Mode Banner */}
                            {atsFix && (
                                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)', padding: '20px 24px', borderBottom: '1px solid #3b82f6' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        <div style={{ fontSize: 28, flexShrink: 0 }}>🎯</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#93c5fd', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
                                                ATS Fix Mode Active
                                            </div>
                                            <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
                                                Your previous ATS score was{' '}
                                                <strong style={{ color: '#fbbf24' }}>{atsFix.previousScore}/100</strong>.
                                                The AI will target these missing keywords in your rewrite:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                                {atsFix.missingKeywords.map(kw => (
                                                    <span key={kw} style={{ background: '#1d4ed8', color: '#bfdbfe', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid #3b82f6' }}>
                                                        + {kw}
                                                    </span>
                                                ))}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                After generating, go back to the ATS Checker to see your new score.
                                            </div>
                                        </div>
                                        <button onClick={() => setAtsFix(null)}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, padding: 4, flexShrink: 0 }}
                                            title="Dismiss ATS Fix Mode">✕</button>
                                    </div>
                                </div>
                            )}

                            {/* Sector selector */}
                            <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Select Sector</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(SECTOR_CONFIGS).map(([key, s]) => {
                                        const Icon = s.icon;
                                        const isActive = sector === key;
                                        return (
                                            <button key={key} onClick={() => setSector(key)}
                                                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-semibold transition-all ${isActive ? 'shadow-md' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white hover:shadow-sm'}`}
                                                style={isActive ? { borderColor: s.color, background: s.bg, color: s.color, boxShadow: `0 2px 8px ${s.color}30` } : {}}>
                                                <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: s.color } : {}} />
                                                <span className="text-center leading-tight text-[11px]">{s.label.split(' & ')[0]}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Completeness tracker */}
                            <div className="px-4 py-3 border-b border-slate-100 bg-white shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-slate-500">Profile Completeness</span>
                                    <span className="text-[11px] font-bold" style={{ color: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }}>{score}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                                    <motion.div className="h-full rounded-full" animate={{ width: `${score}%` }} transition={{ duration: 0.5 }}
                                        style={{ background: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {checks.map((c, i) => (
                                        <span key={i} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${c.done ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                            {c.done ? '✓' : '·'} {c.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Form fields */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60">

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
                                        className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none text-slate-900 placeholder-slate-300 transition-all"
                                        onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.boxShadow = `0 0 0 3px ${cfg.color}18`; }}
                                        onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                                    />
                                    <button onClick={() => handleAIPolish('objective')} disabled={isPolishing && polishTarget === 'objective'}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                        {isPolishing && polishTarget === 'objective' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                        AI Polish Statement
                                    </button>
                                    <AnimatePresence>
                                        {pendingDiff?.target === 'objective' && (
                                            <DiffPanel original={pendingDiff.original} proposed={pendingDiff.proposed}
                                                onAccept={acceptDiff} onReject={rejectDiff} isText />
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

                                {/* Work Experience */}
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
                                    <button onClick={addJob} className="mt-2 text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all w-full justify-center hover:shadow-sm"
                                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                        <Plus className="w-3.5 h-3.5" /> Add Another Role
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
                                    <p className={`text-xs font-mono ${polishLog.startsWith('✖') ? 'text-red-500' : 'text-blue-600'}`}>{polishLog}</p>
                                </div>
                            )}
                        </div>

                        {/* ══ RIGHT: LIVE PREVIEW ══ */}
                        <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e8edf5 100%)' }}>
                            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
                                {layout === 'ats' && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                                        🎯 ATS Mode — interview-ready
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 flex justify-center px-4 pb-8">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-black/8 rounded-3xl blur-2xl opacity-30 pointer-events-none" />
                                    <div className="relative shadow-2xl ring-1 ring-slate-300/60" style={{ transform: 'scale(0.80)', transformOrigin: 'top center' }}>
                                        <PartTimeCVPreview data={data} sector={sector} layout={layout} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ─────────────────────────────────────────────
// JOB BLOCK
// ─────────────────────────────────────────────
const JobBlock = ({ job, index, cfg, onChange, onAddBullet, onRemoveBullet, onBulletChange, onRemoveJob, canRemove, onAIPolish, isPolishing, pendingDiff, onAcceptDiff, onRejectDiff, onInsertSuggestion }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestions = cfg.bulletSuggestions;
    const roleKey = Object.keys(suggestions).find(k => job.role?.toLowerCase().includes(k.toLowerCase())) || 'General';
    const allSuggestions = [...(suggestions[roleKey] || []), ...(suggestions['General'] || [])];

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100" style={{ background: `${cfg.color}08` }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                    Experience {index + 1}
                </span>
                <div className="flex items-center gap-0.5">
                    <button onClick={onAIPolish} disabled={isPolishing} title="AI polish bullets"
                        className="p-1.5 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                        {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setShowSuggestions(s => !s)} title="Bullet suggestions"
                        className={`p-1.5 rounded-md transition-colors ${showSuggestions ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    {canRemove && (
                        <button onClick={onRemoveJob} className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="px-3 pt-3 pb-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <PTInput label="Job Title" value={job.role} onChange={v => onChange('role', v)} color={cfg.color} />
                    <PTInput label="Company" value={job.company} onChange={v => onChange('company', v)} color={cfg.color} />
                    <PTInput label="Period e.g. Jan 2024 – Present" value={job.period} onChange={v => onChange('period', v)} color={cfg.color} />
                </div>

                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mb-2 overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">💡 Suggested Bullets — click to insert</p>
                            <div className="space-y-1 max-h-36 overflow-y-auto">
                                {allSuggestions.map((s, si) => (
                                    <button key={si} onClick={() => { onInsertSuggestion(s); setShowSuggestions(false); }}
                                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-slate-900 transition-all leading-snug">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Duties & Achievements</p>
                    {job.bullets.map((b, bi) => (
                        <div key={bi} className="flex gap-1.5 items-start">
                            <div className="w-1.5 h-1.5 rounded-full mt-3 shrink-0" style={{ background: cfg.color }} />
                            <textarea value={b} onChange={e => onBulletChange(bi, e.target.value)}
                                placeholder="Describe a key duty or achievement..." rows={2}
                                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none text-slate-900 placeholder-slate-300 bg-white transition-all"
                                onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.boxShadow = `0 0 0 3px ${cfg.color}18`; }}
                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                            />
                            <button onClick={() => onRemoveBullet(bi)} className="text-slate-300 hover:text-red-400 transition-colors mt-2">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <button onClick={onAddBullet} className="text-xs font-semibold flex items-center gap-1 mt-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100" style={{ color: cfg.color }}>
                        <Plus className="w-3 h-3" /> Add bullet
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {pendingDiff && (
                    <DiffPanel original={pendingDiff.original} proposed={pendingDiff.proposed}
                        onAccept={onAcceptDiff} onReject={onRejectDiff} isList />
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────
// DIFF PANEL
// ─────────────────────────────────────────────
const DiffPanel = ({ original, proposed, onAccept, onReject, isText, isList }) => (
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
// LIVE PREVIEW — static sub-components (must be outside render)
// ─────────────────────────────────────────────
const ATSSection = ({ title }) => (
    <div style={{ margin: '16px 0 6px', borderBottom: '1.5px solid #000', paddingBottom: '2px' }}>
        <p style={{ fontFamily: 'Arial,sans-serif', fontSize: '10pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, color: '#000' }}>{title}</p>
    </div>
);

const SectionLabel = ({ children, color }) => (
    <h3 style={{ fontSize: '8.5pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color, margin: '0 0 8px', paddingBottom: '4px', borderBottom: `1.5px solid ${color}` }}>{children}</h3>
);

// ─────────────────────────────────────────────
// LIVE PREVIEW (HTML — screen only)
// ─────────────────────────────────────────────
const PartTimeCVPreview = ({ data, sector, layout }) => {
    const cfg = SECTOR_CONFIGS[sector];
    const { personal, objective, skills, work_experience, education } = data;
    const color = cfg.color;

    if (layout === 'ats') {

        return (
            <div style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial,sans-serif', fontSize: '10pt', lineHeight: 1.55, color: '#000', padding: '52px 62px', boxSizing: 'border-box', background: '#fff' }}>
                <p style={{ fontFamily: 'Arial,sans-serif', fontSize: '18pt', fontWeight: 800, margin: '0 0 4px', color: '#000' }}>{personal?.name || 'Your Name'}</p>
                <p style={{ fontSize: '9pt', margin: '0 0 14px', color: '#333' }}>
                    {[personal?.email, personal?.phone, personal?.location].filter(Boolean).join('  |  ')}
                </p>
                {objective?.trim() && <>
                    <ATSSection title="Personal Profile" />
                    <p style={{ fontSize: '10pt', lineHeight: 1.6, margin: '6px 0 0', color: '#000' }}>{objective}</p>
                </>}
                {skills?.filter(s => s.trim()).length > 0 && <>
                    <ATSSection title="Key Skills" />
                    <p style={{ fontSize: '10pt', margin: '6px 0 0', lineHeight: 1.8, color: '#000' }}>
                        {skills.filter(s => s.trim()).join(', ')}
                    </p>
                </>}
                {work_experience?.filter(j => j.role?.trim() || j.company?.trim()).length > 0 && <>
                    <ATSSection title="Work Experience" />
                    {work_experience.filter(j => j.role?.trim() || j.company?.trim()).map((job, i) => (
                        <div key={i} data-job style={{ marginTop: '10px', marginBottom: '4px' }}>
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
                {education?.filter(e => e.institution?.trim()).length > 0 && <>
                    <ATSSection title="Education" />
                    {education.filter(e => e.institution?.trim()).map((edu, i) => (
                        <div key={i} data-edu style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ fontWeight: 700, fontSize: '10pt', margin: 0 }}>{edu.institution}</p>
                                <p style={{ fontSize: '9.5pt', margin: 0, color: '#333' }}>{edu.period || ''}</p>
                            </div>
                            {edu.degree && <p style={{ fontSize: '9.5pt', margin: '1px 0 0', fontStyle: 'italic' }}>{edu.degree}</p>}
                        </div>
                    ))}
                </>}
                <ATSSection title="References" />
                <p style={{ fontSize: '10pt', margin: '6px 0 0' }}>Available upon request.</p>
            </div>
        );
    }

    const isTwo = layout === 'two-col';

    return (
        <div className="cv-document bg-white" style={{ width: '794px', minHeight: '1123px', fontFamily: "'Inter','Helvetica Neue',sans-serif", fontSize: '10pt', lineHeight: 1.5, color: '#1e293b', boxSizing: 'border-box' }}>
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
                {objective && (
                    <div style={{ background: `${color}12`, borderLeft: `3px solid ${color}`, borderRadius: '0 6px 6px 0', padding: '10px 13px', marginBottom: '18px' }}>
                        <SectionLabel color={color}>Personal Statement</SectionLabel>
                        <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', lineHeight: 1.6 }}>{objective}</p>
                    </div>
                )}

                {isTwo ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
                        <div>
                            {skills?.filter(s => s.trim()).length > 0 && (
                                <div style={{ marginBottom: '18px' }}>
                                    <SectionLabel color={color}>Key Skills</SectionLabel>
                                    {skills.filter(s => s.trim()).map((sk, i) => (
                                        <div key={i} style={{ fontSize: '9pt', color: '#334155', padding: '3px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '6px' }}>
                                            <span style={{ color, fontWeight: 700 }}>▸</span>{sk}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {education?.length > 0 && (
                                <div>
                                    <SectionLabel color={color}>Education</SectionLabel>
                                    {education.map((edu, i) => (
                                        <div key={i} style={{ marginBottom: '8px' }}>
                                            <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a' }}>{edu.institution || '—'}</div>
                                            {edu.degree && <div style={{ fontSize: '8.5pt', color, fontStyle: 'italic' }}>{edu.degree}</div>}
                                            {edu.period && <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.period}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            {work_experience?.length > 0 && (
                                <div>
                                    <SectionLabel color={color}>Work Experience</SectionLabel>
                                    {work_experience.map((job, i) => (
                                        <div key={i} data-job style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: i < work_experience.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
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
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        {skills?.filter(s => s.trim()).length > 0 && (
                            <div style={{ marginBottom: '18px' }}>
                                <SectionLabel color={color}>Key Skills</SectionLabel>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {skills.filter(s => s.trim()).map((sk, i) => (
                                        <span key={i} style={{ fontSize: '8.5pt', background: `${color}12`, color, border: `1px solid ${color}30`, borderRadius: '999px', padding: '3px 10px', fontWeight: 600 }}>{sk}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {work_experience?.length > 0 && (
                            <div style={{ marginBottom: '18px' }}>
                                <SectionLabel color={color}>Work Experience</SectionLabel>
                                {work_experience.map((job, i) => (
                                    <div key={i} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <div><span style={{ fontWeight: 700, fontSize: '10.5pt' }}>{job.role || '—'}</span>{job.company && <span style={{ fontSize: '9pt', color, fontWeight: 600 }}> · {job.company}</span>}</div>
                                            {job.period && <span style={{ fontSize: '8pt', color: '#94a3b8' }}>{job.period}</span>}
                                        </div>
                                        {job.bullets?.filter(b => b.trim()).length > 0 && (
                                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                {job.bullets.filter(b => b.trim()).map((b, bi) => (
                                                    <li key={bi} style={{ fontSize: '9.5pt', marginBottom: '2px', lineHeight: 1.45 }}>{b}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {education?.length > 0 && (
                            <div>
                                <SectionLabel color={color}>Education</SectionLabel>
                                {education.map((edu, i) => (
                                    <div key={i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '9.5pt' }}>{edu.institution || '—'}</div>
                                            {edu.degree && <div style={{ fontSize: '8.5pt', color, fontStyle: 'italic' }}>{edu.degree}</div>}
                                        </div>
                                        {edu.period && <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.period}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
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
