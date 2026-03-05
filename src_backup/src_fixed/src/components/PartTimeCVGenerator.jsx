import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import html2pdf from 'html2pdf.js';
import {
    User, Briefcase, Wand2, Download, Loader2, CheckCircle, X, Plus, Trash2,
    ArrowLeft, Sparkles, Heart, Package, Clock
} from 'lucide-react';

// ─── Part-Time CV Data Template ───
const EMPTY_DATA = {
    personal: { name: '', email: '', phone: '', location: '' },
    objective: '',
    skills: [''],
    work_experience: [{ company: '', role: '', period: '', bullets: [''] }],
    education: [{ institution: '', degree: '', period: '' }],
    references: 'Available upon request',
};

const SECTOR_CONFIGS = {
    warehouse: {
        label: 'Warehouse & Logistics',
        icon: Package,
        color: '#f59e0b',
        bg: '#fffbeb',
        border: '#fde68a',
        skills: ['Forklift Operator (Counterbalance/Reach)', 'Manual Handling & Load Securing', 'Stock Control & Inventory Management', 'Health & Safety Compliance', 'RF Scanning & Warehouse Management Systems', 'Pick, Pack & Despatch Operations'],
        objectiveHint: 'Reliable and physically fit individual seeking a part-time warehouse role...',
    },
    freelance: {
        label: 'Freelance & Gig Work',
        icon: Clock,
        color: '#8b5cf6',
        bg: '#faf5ff',
        border: '#ddd6fe',
        skills: ['Time Management & Self-Motivation', 'Client Communication', 'Task Prioritisation', 'Invoicing & Basic Bookkeeping', 'Adaptability Across Multiple Projects', 'Remote Collaboration Tools (Slack, Trello)'],
        objectiveHint: 'Versatile and self-directed professional seeking flexible freelance opportunities...',
    },
    carehome: {
        label: 'Care Home & Support Work',
        icon: Heart,
        color: '#ec4899',
        bg: '#fdf2f8',
        border: '#fbcfe8',
        skills: ['Personal Care & Dignity-Led Support', 'Medication Administration (if applicable)', 'Dementia & Alzheimer\'s Awareness', 'Moving & Handling (Manual Handling Certificate)', 'Safeguarding Adults & DBS Cleared', 'Empathy, Patience & Active Listening'],
        objectiveHint: 'Compassionate and dedicated care professional seeking a part-time support worker role...',
    },
};

// ─── Mini CV Preview for Part-Time ───
const PartTimeCVPreview = ({ data, sector }) => {
    const cfg = SECTOR_CONFIGS[sector];
    const { personal, objective, skills, work_experience, education } = data;

    return (
        <div className="cv-document bg-white" style={{ width: '794px', minHeight: '1123px', padding: '48px 56px', fontFamily: "'Inter','Helvetica Neue',sans-serif", fontSize: '10pt', lineHeight: '1.5', color: '#1e293b', boxSizing: 'border-box' }}>
            {/* Header */}
            <header style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `3px solid ${cfg.color}` }}>
                <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{personal?.name || 'Your Name'}</h1>
                <div style={{ fontSize: '9pt', fontWeight: 600, color: cfg.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{cfg.label} · Part-Time</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '8.5pt', color: '#64748b' }}>
                    {personal?.email && <span>✉ {personal.email}</span>}
                    {personal?.phone && <span>📱 {personal.phone}</span>}
                    {personal?.location && <span>📍 {personal.location}</span>}
                </div>
            </header>

            {/* Objective */}
            {objective && (
                <section style={{ marginBottom: '18px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '6px', padding: '12px 14px' }}>
                    <PTSectionHeader color={cfg.color}>Personal Statement</PTSectionHeader>
                    <p style={{ margin: 0, fontSize: '9.5pt', color: '#334155', lineHeight: '1.6' }}>{objective}</p>
                </section>
            )}

            {/* Two-column layout: Skills + Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Left: Skills */}
                <div>
                    {skills?.filter(s => s.trim()).length > 0 && (
                        <section style={{ marginBottom: '18px' }}>
                            <PTSectionHeader color={cfg.color}>Key Skills</PTSectionHeader>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                {skills.filter(s => s.trim()).map((sk, i) => (
                                    <li key={i} style={{ fontSize: '9pt', color: '#334155', padding: '4px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                        <span style={{ color: cfg.color, fontWeight: 700, flexShrink: 0 }}>▸</span>
                                        {sk}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {education?.length > 0 && (
                        <section>
                            <PTSectionHeader color={cfg.color}>Education</PTSectionHeader>
                            {education.map((edu, i) => (
                                <div key={i} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a' }}>{edu.institution || '—'}</div>
                                    <div style={{ fontSize: '8.5pt', color: cfg.color, fontStyle: 'italic' }}>{edu.degree}</div>
                                    <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{edu.period}</div>
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                {/* Right: Experience */}
                <div>
                    {work_experience?.length > 0 && (
                        <section>
                            <PTSectionHeader color={cfg.color}>Work Experience</PTSectionHeader>
                            {work_experience.map((job, i) => (
                                <div key={i} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: i < work_experience.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <div>
                                            <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{job.role || '—'}</div>
                                            <div style={{ fontSize: '9pt', color: cfg.color, fontWeight: 600 }}>{job.company}</div>
                                        </div>
                                        <span style={{ fontSize: '8pt', color: '#94a3b8', background: '#f8fafc', padding: '2px 7px', borderRadius: '999px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0' }}>{job.period}</span>
                                    </div>
                                    {job.bullets?.filter(b => b.trim()).length > 0 && (
                                        <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#334155' }}>
                                            {job.bullets.filter(b => b.trim()).map((b, bi) => (
                                                <li key={bi} style={{ fontSize: '9.5pt', marginBottom: '2px', lineHeight: '1.45' }}>{b}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: `1px solid ${cfg.border}`, fontSize: '8.5pt', color: '#94a3b8', textAlign: 'center' }}>
                References available upon request · Part-Time CV · Generated with GokulCV
            </div>
        </div>
    );
};

const PTSectionHeader = ({ children, color }) => (
    <h3 style={{ fontSize: '8.5pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color, margin: '0 0 8px', paddingBottom: '4px', borderBottom: `1.5px solid currentColor`, opacity: 0.9 }}>{children}</h3>
);

// ─── Main Component ───
const PartTimeCVGenerator = ({ onClose }) => {
    const [sector, setSector] = useState('warehouse');
    const [data, setData] = useState(EMPTY_DATA);
    const [isPolishing, setIsPolishing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [polishLog, setPolishLog] = useState('');
    const [activeTab, setActiveTab] = useState('form');

    const cfg = SECTOR_CONFIGS[sector];
    const CfgIcon = cfg.icon;

    const updateField = (path, value) => {
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let cur = next;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = /^\d+$/.test(keys[i]) ? parseInt(keys[i], 10) : keys[i];
                cur = cur[k];
            }
            const lastKey = /^\d+$/.test(keys[keys.length - 1]) ? parseInt(keys[keys.length - 1], 10) : keys[keys.length - 1];
            cur[lastKey] = value;
            return next;
        });
    };

    const injectSuggestedSkills = () => {
        setData(prev => ({ ...prev, skills: [...cfg.skills] }));
    };

    const handleAIPolish = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) { alert('Missing VITE_GEMINI_API_KEY in .env'); return; }

        setIsPolishing(true);
        setPolishLog('Initialising AI engine...');
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            setPolishLog('Analysing role type and rewriting bullets...');

            const prompt = `You are a professional UK CV writer specialising in part-time ${cfg.label} roles.
Given this raw CV data as JSON, improve the objective statement to be compelling and sector-specific, and rewrite the work experience bullets to be achievement-focused and action-verb led. Keep skills as-is. Return ONLY valid JSON with the SAME structure. Do not invent facts.

Input:
${JSON.stringify(data)}

Return improved JSON (same keys, same structure). Raw JSON only, no markdown.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start === -1) throw new Error('AI returned no JSON');
            const parsed = JSON.parse(text.substring(start, end + 1));
            setData(parsed);
            setPolishLog('✔ AI polish complete! Review your updated CV.');
        } catch (err) {
            setPolishLog('✖ Error: ' + err.message);
        } finally {
            setIsPolishing(false);
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadSuccess(false);
        try {
            const el = document.querySelector('.cv-document');
            if (!el) throw new Error('CV element not found');

            const safeName = (data.personal.name || 'PartTime_CV').replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${safeName}_PartTime_CV.pdf`;

            const blob = await html2pdf()
                .set({ margin: [5, 0, 5, 0], image: { type: 'jpeg', quality: 1.0 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } })
                .from(el)
                .outputPdf('blob');

            const finalBlob = new Blob([blob], { type: 'application/pdf' });
            const url = URL.createObjectURL(finalBlob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.rel = 'noopener'; a.style.display = 'none';
            document.body.appendChild(a);
            a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 10000);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) {
            alert('Download failed: ' + err.message);
        } finally {
            setTimeout(() => setIsDownloading(false), 1500);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }} className="p-2 rounded-lg">
                        <CfgIcon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-base">Part-Time CV Generator</h1>
                        <p className="text-xs text-slate-500">{cfg.label}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleAIPolish} disabled={isPolishing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-all" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color, opacity: isPolishing ? 0.7 : 1 }}>
                        {isPolishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        AI Polish
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading} className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm text-white transition-all ${downloadSuccess ? 'bg-emerald-500' : 'bg-brand-primary hover:bg-blue-700'}`}>
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : downloadSuccess ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        {downloadSuccess ? 'Downloaded!' : 'Download PDF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Form */}
                <div className="w-[460px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
                    {/* Sector Selector */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sector</p>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(SECTOR_CONFIGS).map(([key, s]) => {
                                const Icon = s.icon;
                                return (
                                    <button key={key} onClick={() => setSector(key)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${sector === key ? 'border-current shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`} style={sector === key ? { borderColor: s.color, background: s.bg, color: s.color } : {}}>
                                        <Icon className="w-4 h-4" />
                                        <span className="leading-tight text-center">{s.label.split(' & ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 p-5 space-y-6">
                        {/* Personal */}
                        <FormSection title="Personal Details" icon={<User className="w-4 h-4" />} color={cfg.color}>
                            <div className="grid grid-cols-2 gap-3">
                                {[['Full Name', 'personal.name'], ['Email', 'personal.email'], ['Phone', 'personal.phone'], ['Location', 'personal.location']].map(([lbl, path]) => (
                                    <PTInput key={path} label={lbl} value={data.personal[path.split('.')[1]] || ''} onChange={v => updateField(path, v)} color={cfg.color} />
                                ))}
                            </div>
                        </FormSection>

                        {/* Objective */}
                        <FormSection title="Personal Statement" icon={<Sparkles className="w-4 h-4" />} color={cfg.color}>
                            <textarea
                                value={data.objective}
                                onChange={e => updateField('objective', e.target.value)}
                                placeholder={cfg.objectiveHint}
                                rows={4}
                                className="w-full text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 text-slate-900 placeholder-slate-400 transition-all"
                                style={{ focusRingColor: cfg.color }}
                            />
                        </FormSection>

                        {/* Skills */}
                        <FormSection title="Key Skills" icon={<CheckCircle className="w-4 h-4" />} color={cfg.color}>
                            <button onClick={injectSuggestedSkills} className="text-xs font-semibold mb-3 px-3 py-1.5 rounded-lg border transition-colors" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                ✦ Auto-fill {cfg.label} skills
                            </button>
                            <div className="space-y-2">
                                {data.skills.map((sk, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input value={sk} onChange={e => updateField(`skills.${i}`, e.target.value)} placeholder={`Skill ${i + 1}`} className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-400 text-slate-900" />
                                        <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => setData(prev => ({ ...prev, skills: [...prev.skills, ''] }))} className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mt-1">
                                    <Plus className="w-3.5 h-3.5" /> Add Skill
                                </button>
                            </div>
                        </FormSection>

                        {/* Work Experience */}
                        <FormSection title="Work Experience" icon={<Briefcase className="w-4 h-4" />} color={cfg.color}>
                            {data.work_experience.map((job, i) => (
                                <div key={i} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role {i + 1}</span>
                                        {data.work_experience.length > 1 && <button onClick={() => setData(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <PTInput label="Job Title" value={job.role} onChange={v => updateField(`work_experience.${i}.role`, v)} color={cfg.color} />
                                        <PTInput label="Company" value={job.company} onChange={v => updateField(`work_experience.${i}.company`, v)} color={cfg.color} />
                                        <PTInput label="Period" value={job.period} onChange={v => updateField(`work_experience.${i}.period`, v)} color={cfg.color} />
                                    </div>
                                    <div className="space-y-1.5">
                                        {job.bullets.map((b, bi) => (
                                            <div key={bi} className="flex gap-2 items-start">
                                                <textarea value={b} onChange={e => updateField(`work_experience.${i}.bullets.${bi}`, e.target.value)} placeholder="Describe a key duty or achievement..." rows={2} className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-slate-400 text-slate-900 placeholder-slate-400" />
                                                <button onClick={() => setData(prev => { const n = JSON.parse(JSON.stringify(prev)); n.work_experience[i].bullets = n.work_experience[i].bullets.filter((_, idx) => idx !== bi); return n; })} className="text-slate-400 hover:text-red-500 mt-2"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setData(prev => { const n = JSON.parse(JSON.stringify(prev)); n.work_experience[i].bullets.push(''); return n; })} className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
                                            <Plus className="w-3.5 h-3.5" /> Add bullet
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setData(prev => ({ ...prev, work_experience: [...prev.work_experience, { company: '', role: '', period: '', bullets: [''] }] }))} className="mt-1 text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                                <Plus className="w-3.5 h-3.5" /> Add Job
                            </button>
                        </FormSection>

                        {/* Education */}
                        <FormSection title="Education" icon={<Sparkles className="w-4 h-4" />} color={cfg.color}>
                            {data.education.map((edu, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 mb-3">
                                    <PTInput label="School / College" value={edu.institution} onChange={v => updateField(`education.${i}.institution`, v)} color={cfg.color} />
                                    <PTInput label="Qualification" value={edu.degree} onChange={v => updateField(`education.${i}.degree`, v)} color={cfg.color} />
                                    <PTInput label="Years" value={edu.period} onChange={v => updateField(`education.${i}.period`, v)} color={cfg.color} />
                                </div>
                            ))}
                        </FormSection>
                    </div>

                    {/* AI Polish log */}
                    {polishLog && (
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                            <p className={`text-xs font-mono ${polishLog.startsWith('✔') ? 'text-emerald-600' : polishLog.startsWith('✖') ? 'text-red-500' : 'text-brand-primary'}`}>{polishLog}</p>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-slate-100 overflow-y-auto flex justify-center py-10">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-black/5 rounded-xl blur-lg opacity-30" />
                        <div className="relative shadow-2xl ring-1 ring-slate-200" style={{ transform: 'scale(0.82)', transformOrigin: 'top center' }}>
                            <PartTimeCVPreview data={data} sector={sector} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FormSection = ({ title, icon, children, color }) => (
    <div>
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ background: `${color}15`, color }}>{icon}</div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);

const PTInput = ({ label, value, onChange, color }) => (
    <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{label}</label>
        <input value={value || ''} onChange={e => onChange(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none text-slate-900 placeholder-slate-400 transition-all bg-white" style={{ '--tw-ring-color': color }} />
    </div>
);

export default PartTimeCVGenerator;
