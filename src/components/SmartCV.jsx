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

// ═══════════════════════════════════════════════
// GAMIFICATION CONFIG
// ═══════════════════════════════════════════════
const LEVELS = [
  { name: 'Rookie', min: 0, icon: '🥉', color: '#94a3b8', bg: 'from-slate-500/20 to-slate-600/10' },
  { name: 'Contender', min: 150, icon: '🥈', color: '#f59e0b', bg: 'from-amber-500/20 to-amber-600/10' },
  { name: 'Specialist', min: 400, icon: '🥇', color: '#3b82f6', bg: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Elite', min: 700, icon: '💎', color: '#8b5cf6', bg: 'from-violet-500/20 to-violet-600/10' },
  { name: 'Legendary', min: 1000, icon: '👑', color: '#f97316', bg: 'from-orange-500/20 to-orange-600/10' },
];

const ACHIEVEMENTS = [
  { id: 'first_scan', label: 'First Scan Complete', xp: 50, icon: '🔍' },
  { id: 'score_50', label: '50% Match Reached', xp: 75, icon: '🎯' },
  { id: 'score_80', label: '80% Elite Match', xp: 150, icon: '🏆' },
  { id: 'all_keywords', label: 'All Keywords Matched', xp: 200, icon: '⚡' },
  { id: 'ai_synthesis', label: 'AI Synthesis Deployed', xp: 100, icon: '🧠' },
  { id: 'pdf_exported', label: 'PDF Battle-Ready', xp: 50, icon: '📄' },
];

const getLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
};

const getNextLevel = (xp) => {
  const current = getLevel(xp);
  if (current.index >= LEVELS.length - 1) return null;
  return LEVELS[current.index + 1];
};

const getXpProgress = (xp) => {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const inLevel = xp - current.min;
  const levelRange = next.min - current.min;
  return Math.min(100, Math.round((inLevel / levelRange) * 100));
};

// ═══════════════════════════════════════════════
// SMART CV COMPONENT
// ═══════════════════════════════════════════════
const SmartCV = ({
  onBack,
  resumeData,
  onUpdate,
  onTailor,
  aiFeed = [],
  matchScore = 0,
  missingKeywords = [],
  extraMetrics = null
}) => {
  // --- STATE ---
  const [jd, setJd] = useState('');
  const [isJdOpen, setIsJdOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('smartcv_xp');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [earnedAchievements, setEarnedAchievements] = useState(() => {
    const saved = localStorage.getItem('smartcv_achievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [toasts, setToasts] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(getLevel(xp).index);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('classic');
  const cvRef = useRef(null);

  // Persist XP
  useEffect(() => {
    localStorage.setItem('smartcv_xp', xp.toString());
  }, [xp]);
  useEffect(() => {
    localStorage.setItem('smartcv_achievements', JSON.stringify(earnedAchievements));
  }, [earnedAchievements]);

  // Level-up detection
  useEffect(() => {
    const currentLevel = getLevel(xp).index;
    if (currentLevel > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setPrevLevel(currentLevel);
  }, [xp, prevLevel]);

  // --- LOCAL KEYWORD INTELLIGENCE ---
  const targetKeywords = useMemo(() => {
    if (!jd) return [];
    const words = jd.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = ['this', 'that', 'with', 'from', 'your', 'have', 'more', 'will', 'about', 'which', 'their', 'they', 'were', 'what', 'when', 'where', 'there', 'could', 'would', 'should', 'experience', 'ability', 'skills', 'working', 'work', 'role', 'team', 'well', 'also', 'including', 'using', 'within', 'across', 'ensure', 'able', 'strong', 'good', 'make', 'been', 'being', 'must', 'need', 'required', 'preferred', 'ideal', 'candidate', 'looking', 'join', 'position', 'company', 'apply', 'please', 'submit'];
    const filtered = words.filter(w => !stopWords.includes(w));
    const counts = {};
    filtered.forEach(w => counts[w] = (counts[w] || 0) + 1);
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 15);
  }, [jd]);

  // --- LIVE MATCH SCORING (Local) ---
  const fullCvText = useMemo(() => JSON.stringify(resumeData).toLowerCase(), [resumeData]);
  const matchedKeywords = useMemo(() => targetKeywords.filter(kw => fullCvText.includes(kw)), [targetKeywords, fullCvText]);
  const missingLocal = useMemo(() => targetKeywords.filter(kw => !fullCvText.includes(kw)), [targetKeywords, fullCvText]);
  const localScore = targetKeywords.length > 0 ? Math.round((matchedKeywords.length / targetKeywords.length) * 100) : 0;

  // Effective score: use AI score if available, else local
  const effectiveScore = matchScore > 0 ? matchScore : localScore;

  // --- SECTION COMPLETENESS ---
  const sectionScores = useMemo(() => {
    const d = resumeData;
    const profileLen = (d.personal_profile || '').length;
    const profileScore = Math.min(100, Math.round((profileLen / 300) * 100));

    const expAchievements = (d.work_experience || []).reduce((sum, job) => sum + (job.achievements?.length || 0), 0);
    const expScore = Math.min(100, Math.round((expAchievements / 8) * 100));

    const skillCategories = (d.professional_qualifications || []).length;
    const skillsScore = Math.min(100, Math.round((skillCategories / 4) * 100));

    const eduBullets = (d.education || []).reduce((sum, e) => sum + (e.bullets?.length || 0), 0);
    const eduScore = Math.min(100, Math.round((eduBullets / 4) * 100));

    return { profile: profileScore, experience: expScore, skills: skillsScore, education: eduScore };
  }, [resumeData]);

  const overallCompleteness = Math.round(
    (sectionScores.profile + sectionScores.experience + sectionScores.skills + sectionScores.education) / 4
  );

  // --- XP CALCULATION ---
  const calculatedXp = useMemo(() => {
    let base = 0;
    base += overallCompleteness * 2; // up to 200
    base += effectiveScore * 3; // up to 300
    base += matchedKeywords.length * 15; // up to ~225
    base += earnedAchievements.reduce((sum, a) => {
      const ach = ACHIEVEMENTS.find(x => x.id === a);
      return sum + (ach?.xp || 0);
    }, 0);
    return base;
  }, [overallCompleteness, effectiveScore, matchedKeywords, earnedAchievements]);

  useEffect(() => {
    setXp(calculatedXp);
  }, [calculatedXp]);

  // --- ACHIEVEMENT UNLOCKING ---
  const unlockAchievement = useCallback((id) => {
    if (earnedAchievements.includes(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    setEarnedAchievements(prev => [...prev, id]);
    setToasts(prev => [...prev, { id: Date.now(), ...ach }]);
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 4000);
  }, [earnedAchievements]);

  // Check achievements
  useEffect(() => {
    if (effectiveScore >= 50) unlockAchievement('score_50');
    if (effectiveScore >= 80) unlockAchievement('score_80');
    if (targetKeywords.length > 0 && missingLocal.length === 0 && matchedKeywords.length > 0) {
      unlockAchievement('all_keywords');
    }
  }, [effectiveScore, targetKeywords, missingLocal, matchedKeywords, unlockAchievement]);

  // --- AI SYNTHESIS ---
  const handleRunAI = async () => {
    if (!jd.trim()) return;
    setIsScanning(true);
    setScanComplete(false);
    unlockAchievement('first_scan');
    try {
      await onTailor(jd);
      setScanComplete(true);
      unlockAchievement('ai_synthesis');
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // --- PDF DOWNLOAD ---
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePDF(resumeData, activeTemplate);
      const filename = `${(resumeData.personal?.name || 'Resume').replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 10000);
      unlockAchievement('pdf_exported');
    } catch (error) {
      console.error('[PDF]', error);
      alert('PDF generation failed: ' + error.message);
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  // --- SCORE RING ---
  const circleRadius = 44;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circleCircumference - (effectiveScore / 100) * circleCircumference;
  const scoreColor = effectiveScore >= 80 ? '#10b981' : effectiveScore >= 60 ? '#3b82f6' : effectiveScore >= 40 ? '#f59e0b' : '#ef4444';

  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpProgress = getXpProgress(xp);

  // --- INLINE EDITING HELPERS ---
  const updateField = (path, value) => {
    if (onUpdate) onUpdate(path, value);
  };

  // --- SECTION CONFIGS ---
  const sections = [
    { id: 'summary', label: 'Profile Summary', icon: <FileText className="w-4 h-4" />, score: sectionScores.profile },
    { id: 'experience', label: 'Work Experience', icon: <TrendingUp className="w-4 h-4" />, score: sectionScores.experience },
    { id: 'skills', label: 'Technical Skills', icon: <Cpu className="w-4 h-4" />, score: sectionScores.skills },
    { id: 'education', label: 'Education', icon: <Award className="w-4 h-4" />, score: sectionScores.education },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0a0e1a] font-sans text-white overflow-hidden relative">

      {/* ═══ ACHIEVEMENT TOASTS ═══ */}
      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.8 }}
              className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 backdrop-blur-xl border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-2xl shadow-amber-500/10 pointer-events-auto"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-amber-200">{t.label}</p>
                <p className="text-[10px] font-mono text-amber-400/80">+{t.xp} XP EARNED</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══ LEVEL UP OVERLAY ═══ */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="text-center"
            >
              <div className="text-7xl mb-4 animate-bounce">{level.icon}</div>
              <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 tracking-tight mb-2">
                LEVEL UP!
              </h2>
              <p className="text-xl font-bold" style={{ color: level.color }}>{level.name}</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -60, opacity: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className="w-2 h-2 rounded-full bg-amber-400"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HEADER BAR ═══ */}
      <header className="bg-[#0d1221]/90 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 cursor-pointer active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Smart Match <span className="text-indigo-400">Arena</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">LIVE GAMIFIED UI</p>
            </div>
          </div>
        </div>

        {/* XP BAR IN HEADER */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span className="text-lg">{level.icon}</span>
            <span className="text-xs font-bold" style={{ color: level.color }}>{level.name}</span>
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: level.color }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{xp} XP</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/25 border border-indigo-400/20 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Rendering...' : 'Export PDF'}
          </button>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <main className="flex flex-1 overflow-hidden relative">

        {/* ═══ LEFT PANEL: THE GAMIFIED COCKPIT ═══ */}
        <section className="w-full md:w-[520px] shrink-0 flex flex-col h-full bg-[#0d1221] border-r border-white/5 relative">

          {/* ── SCORE HUD ── */}
          <div className="shrink-0 p-5 bg-gradient-to-b from-[#0f1628] to-[#0d1221] border-b border-white/5">

            {/* Score Ring + Stats Row */}
            <div className="flex items-center gap-5">
              {/* Animated Score Ring */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r={circleRadius} fill="none"
                    stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    initial={{ strokeDashoffset: circleCircumference }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                  />
                </svg>
                {/* Glow effect */}
                <div className="absolute inset-2 rounded-full opacity-20" style={{ boxShadow: `0 0 30px ${scoreColor}` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white tracking-tighter">{effectiveScore}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">MATCH</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Keywords</p>
                  <p className="text-lg font-black text-white">{matchedKeywords.length}<span className="text-sm text-slate-500">/{targetKeywords.length}</span></p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Completeness</p>
                  <p className="text-lg font-black text-white">{overallCompleteness}<span className="text-sm text-slate-500">%</span></p>
                </div>
                {extraMetrics && (
                  <>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Semantic</p>
                      <p className="text-lg font-black text-blue-400">{extraMetrics.semanticScore}<span className="text-sm text-slate-500">%</span></p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                      <p className="text-lg font-black text-emerald-400">+{extraMetrics.impactScore}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section Completeness Bars */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer ${activeSection === s.id ? 'bg-white/10 border border-white/10' : 'bg-transparent border border-transparent hover:bg-white/5'}`}
                >
                  <div className="relative w-8 h-8 mb-1">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle cx="16" cy="16" r="12" fill="none"
                        stroke={s.score >= 80 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 12}
                        strokeDashoffset={2 * Math.PI * 12 - (s.score / 100) * 2 * Math.PI * 12}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-400">{s.score}%</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">{s.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── SCROLLABLE AREA ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 pb-32">

            {/* JD INPUT SECTION */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setIsJdOpen(!isJdOpen)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Crosshair className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white block">Target Job Description</span>
                    <span className="text-[10px] text-slate-500">Paste to extract keywords & score</span>
                  </div>
                </div>
                {isJdOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              <AnimatePresence>
                {isJdOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3">
                      <div className="relative">
                        <textarea
                          value={jd}
                          onChange={(e) => setJd(e.target.value)}
                          placeholder="Paste the full job description here..."
                          maxLength={15000}
                          className="w-full h-36 bg-black/30 border border-white/10 rounded-xl text-sm text-white p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600 custom-scrollbar font-medium leading-relaxed transition-all"
                        />
                        {jd.length > 0 && (
                          <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                            {jd.split(/\s+/).filter(Boolean).length} words
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleRunAI}
                        disabled={!jd.trim() || isScanning}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale shadow-lg shadow-indigo-500/20 border border-indigo-400/20 cursor-pointer relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isScanning ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Running AI Synthesis...</>
                        ) : (
                          <><BrainCircuit className="w-5 h-5" /> Run AI Synthesis <ArrowRight className="w-4 h-4 opacity-60" /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* KEYWORD RADAR */}
            {targetKeywords.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Keyword Radar</h3>
                  <span className="ml-auto text-[10px] font-mono text-slate-500">{matchedKeywords.length}/{targetKeywords.length} locked</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetKeywords.map(kw => {
                    const isMatched = matchedKeywords.includes(kw);
                    return (
                      <motion.span
                        key={kw}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-500 ${isMatched
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                          : 'bg-red-500/10 text-red-400/80 border-red-500/20 border-dashed animate-pulse'
                          }`}
                      >
                        {isMatched ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
                        {kw}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI STATUS FEED */}
            {aiFeed.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
                <div className="bg-white/[0.03] px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      System Log
                      {aiFeed[0]?.type !== 'success' && aiFeed[0]?.type !== 'error' && (
                        <span className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                </div>
                <div className="p-4 space-y-2.5 font-mono text-xs max-h-[150px] overflow-y-auto custom-scrollbar">
                  {aiFeed.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-slate-600 shrink-0 w-14 select-none font-bold text-[10px]">[{msg.time?.split(' ')[0]}]</span>
                      <span className={`shrink-0 ${msg.type === 'success' ? 'text-emerald-400' : msg.type === 'error' ? 'text-red-400' : msg.type === 'warning' ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {msg.type === 'success' ? '✔' : msg.type === 'error' ? '✖' : msg.type === 'warning' ? '⚠' : '❯'}
                      </span>
                      <span className={`leading-snug ${msg.type === 'success' ? 'text-slate-300' : msg.type === 'error' ? 'text-red-300' : 'text-slate-500'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI SUGGESTIONS */}
            {extraMetrics?.contextualSuggestions?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">AI Rewrite Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {extraMetrics.contextualSuggestions.map((sug, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl border border-white/5 p-4 hover:border-indigo-500/20 transition-colors">
                      <div className="flex gap-3">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-white font-semibold text-sm">{sug.target}</h5>
                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{sug.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MISSING KEYWORDS ALERT */}
            {missingKeywords?.length > 0 && matchScore > 0 && (
              <div className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest">Missing Skills (AI)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* IMPACT CRITIQUE */}
            {extraMetrics?.impactCritique && (
              <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{extraMetrics.impactCritique}</p>
              </div>
            )}

            {/* SECTION EDITOR CARDS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Edit3 className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Edit Sections</h3>
              </div>

              {/* Profile Summary */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'summary' ? '' : 'summary')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">Profile Summary</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectionScores.profile >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sectionScores.profile}%
                    </span>
                  </div>
                  {activeSection === 'summary' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {activeSection === 'summary' && (
                  <div className="px-5 pb-5">
                    <textarea
                      value={resumeData.personal_profile || ''}
                      onChange={(e) => updateField('personal_profile', e.target.value)}
                      className="w-full h-32 bg-black/30 border border-white/10 rounded-xl text-sm text-white p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 placeholder-slate-600 custom-scrollbar leading-relaxed transition-all"
                      placeholder="Write your professional profile..."
                    />
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Work Experience</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectionScores.experience >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sectionScores.experience}%
                    </span>
                  </div>
                  {activeSection === 'experience' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {activeSection === 'experience' && (
                  <div className="px-5 pb-5 space-y-4">
                    {(resumeData.work_experience || []).map((job, jobIdx) => (
                      <div key={jobIdx} className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white">{job.role}</h4>
                            <p className="text-xs text-slate-500">{job.company} • {job.period}</p>
                          </div>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{job.achievements?.length || 0} bullets</span>
                        </div>
                        {(job.achievements || []).map((bullet, bulletIdx) => (
                          <textarea
                            key={bulletIdx}
                            value={bullet}
                            onChange={(e) => updateField(`work_experience.${jobIdx}.achievements.${bulletIdx}`, e.target.value)}
                            className="w-full h-20 bg-black/30 border border-white/10 rounded-lg text-xs text-slate-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 custom-scrollbar leading-relaxed transition-all"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-bold text-white">Technical Skills</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectionScores.skills >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sectionScores.skills}%
                    </span>
                  </div>
                  {activeSection === 'skills' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {activeSection === 'skills' && (
                  <div className="px-5 pb-5 space-y-3">
                    {(resumeData.professional_qualifications || []).map((qual, qIdx) => (
                      <div key={qIdx} className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <h5 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">{qual.category}</h5>
                        <textarea
                          value={qual.skills}
                          onChange={(e) => updateField(`professional_qualifications.${qIdx}.skills`, e.target.value)}
                          className="w-full h-16 bg-black/30 border border-white/10 rounded-lg text-xs text-slate-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 custom-scrollbar leading-relaxed transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Education</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectionScores.education >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {sectionScores.education}%
                    </span>
                  </div>
                  {activeSection === 'education' ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {activeSection === 'education' && (
                  <div className="px-5 pb-5 space-y-4">
                    {(resumeData.education || []).map((edu, eduIdx) => (
                      <div key={eduIdx} className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                          <p className="text-xs text-slate-500">{edu.institution} • {edu.period}</p>
                        </div>
                        {(edu.bullets || []).map((bullet, bulletIdx) => (
                          <textarea
                            key={bulletIdx}
                            value={bullet.replace(/<[^>]*>/g, '')}
                            onChange={(e) => updateField(`education.${eduIdx}.bullets.${bulletIdx}`, e.target.value)}
                            className="w-full h-16 bg-black/30 border border-white/10 rounded-lg text-xs text-slate-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 custom-scrollbar leading-relaxed transition-all"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACHIEVEMENTS WALL */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Achievements</h3>
                <span className="ml-auto text-[10px] font-mono text-slate-500">{earnedAchievements.length}/{ACHIEVEMENTS.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.map(ach => {
                  const unlocked = earnedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${unlocked
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-white/[0.02] border-white/5 opacity-40'
                        }`}
                    >
                      <span className={`text-xl mb-1 ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                      <span className="text-[9px] font-bold text-slate-400 leading-tight">{ach.label}</span>
                      <span className="text-[8px] font-mono text-indigo-400/60 mt-0.5">+{ach.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ═══ RIGHT PANEL: LIVE PREVIEW ═══ */}
        <section className="flex-1 bg-[#080b14] overflow-y-auto custom-scrollbar flex flex-col relative">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Template Switcher */}
          <div className="shrink-0 p-4 border-b border-white/5 flex items-center justify-between relative z-10 bg-[#080b14]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
              {Object.values(TEMPLATES).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${activeTemplate === t.id
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex justify-center py-10 px-4 relative z-10">
            <div className="relative">
              {/* Paper glow */}
              <div className="absolute -inset-4 bg-indigo-500/5 rounded-2xl blur-xl" />

              <div
                ref={cvRef}
                className="relative bg-white shadow-2xl ring-1 ring-white/10"
                style={{ width: '750px', minHeight: '1060px', transform: 'scale(0.85)', transformOrigin: 'top center' }}
              >
                <ResumeView resumeData={resumeData} template={activeTemplate} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Download Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
        >
          {isDownloading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Download className="w-6 h-6 text-white" />}
        </button>
      </div>
    </div>
  );
};

export default SmartCV;
