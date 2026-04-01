/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Homepage from './components/Homepage';
import BuilderWorkspace from './components/BuilderWorkspace';
import SmartCV from './components/SmartCV';
import TemplatePicker from './components/TemplatePicker';
import PartTimeCVGenerator from './components/PartTimeCVGenerator';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import SavedCVs from './components/SavedCVs';
const ATSScoreChecker = lazy(() => import('./components/ATSScoreChecker'));
import initialResumeData from './data/resumeData.json';
import { supabase, saveCV } from './services/supabase';
import { sanitiseDeep } from './services/ai';

function App() {
  // 'home' | 'templatepicker' | 'builder' | 'smartcv' | 'parttime'
  const [view, setView] = useState('home');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [showPartTime, setShowPartTime] = useState(false);

  // ─── Auth state ───
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [activeCvId, setActiveCvId] = useState(null);
  const [activeCvTitle, setActiveCvTitle] = useState('Untitled CV');
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved' | 'error'

  // ─── Resume state ───
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('aura_resume_cache');
    return saved ? sanitiseDeep(JSON.parse(saved)) : initialResumeData;
  });

  const [aiFeed, setAiFeed] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [extraMetrics, setExtraMetrics] = useState(null);

  // ─── Supabase auth listener ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Check for ATS route on mount
    if (window.location.pathname === '/ats' || window.location.hash === '#ats') {
      setView('ats');
    }

    return () => subscription.unsubscribe();
  }, []);

  // Auto-Save: Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('aura_resume_cache', JSON.stringify(sanitiseDeep(resumeData)));
  }, [resumeData]);

  const handleDataUpdate = (path, value) => {
    setResumeData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');

      if (keys.length === 1) {
        newData[keys[0]] = value;
        return newData;
      }

      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        const nextIsIndex = /^\d+$/.test(nextKey);
        if (!current[key]) {
          current[key] = nextIsIndex ? [] : {};
        }
        current = current[key];
      }

      const lastKey = keys[keys.length - 1];
      const finalKey = /^\d+$/.test(lastKey) ? parseInt(lastKey, 10) : lastKey;
      current[finalKey] = value;
      return newData;
    });
  };

  const [showRevertModal, setShowRevertModal] = useState(false);

  const triggerReset = () => {
    setShowRevertModal(true);
  };

  const confirmReset = () => {
    setResumeData(initialResumeData);
    localStorage.removeItem('aura_resume_cache');
    setMatchScore(0);
    setMissingKeywords([]);
    setExtraMetrics(null);
    setAiFeed([]);
    setActiveCvId(null);
    setActiveCvTitle('Untitled CV');
    setShowRevertModal(false);
  };

  // ─── Save CV to Supabase ───
  const handleSaveToCloud = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setSaveStatus('saving');
    try {
      const title = resumeData.personal?.name
        ? `${resumeData.personal.name} CV`
        : activeCvTitle;

      const result = await saveCV({
        title,
        sector: resumeData.personal?.sector || null,
        cvData: resumeData,
        savedCvId: activeCvId || null,
      });
      setActiveCvId(result.id);
      setActiveCvTitle(result.title);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [user, resumeData, activeCvId, activeCvTitle]);

  // ─── Load CV from Supabase ───
  const handleLoadFromCloud = (data, id, title) => {
    setResumeData(data);
    setActiveCvId(id);
    setActiveCvTitle(title);
    localStorage.setItem('aura_resume_cache', JSON.stringify(sanitiseDeep(data)));
  };

  const handleTailor = async (jd) => {
    const addLog = (msg, type = 'info') => {
      setAiFeed(prev => [{ text: msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    try {
      addLog("Initializing Intelligent Brain...", "info");
      const { tailorResume } = await import('./services/ai');

      addLog("Analyzing Job Description for high-impact keywords...", "info");
      await new Promise(r => setTimeout(r, 600));
      addLog("Cross-referencing mechatronics experience with JD requirements...", "info");

      const { match_score, missing_keywords, extra_metrics, ...synthesizedCV } = await tailorResume(resumeData, jd);

      addLog(`Analysis Complete. Final Match Score: ${match_score}%`, "success");
      setMatchScore(match_score);
      setMissingKeywords(missing_keywords || []);
      setExtraMetrics(extra_metrics || null);

      if (missing_keywords && missing_keywords.length > 0) {
        addLog(`${missing_keywords.length} missing keywords identified`, "warning");
      }

      setResumeData(synthesizedCV);
      addLog("Total Synthesis Complete. Review your new narrative.", "success");
    } catch (err) {
      console.error(err);
      addLog("AI Engine Error. Check your connection or API key.", "error");
    }
  };

  const goToBuilder = () => {
    setView('templatepicker');
    window.scrollTo(0, 0);
  };

  const handleTemplateConfirm = (templateId) => {
    setSelectedTemplate(templateId);
    setView('builder');
    window.scrollTo(0, 0);
  };



  return (
    <div className="min-h-screen bg-aura-surface font-sans text-aura-dark selection:bg-aura-primary/20 selection:text-aura-primary relative">

      {/* ═══ TOP-RIGHT AUTH BAR — hidden on homepage (navbar handles it) ═══ */}
      {view !== 'home' && (
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        {saveStatus === 'saved' && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full"
          >
            ✓ Saved
          </motion.span>
        )}
        {saveStatus === 'saving' && (
          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full animate-pulse">
            Saving…
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
            Save failed
          </span>
        )}

        {user ? (
          <UserMenu
            user={user}
            onSave={handleSaveToCloud}
            onOpenSaved={() => setShowSaved(true)}
            onSignOut={() => { setUser(null); setActiveCvId(null); }}
          />
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Homepage
              onStartBuilding={goToBuilder}
              onStartSmartCV={() => setView('smartcv')}
              onStartPartTime={() => setShowPartTime(true)}
              user={user}
              onSignIn={() => setShowAuth(true)}
              onSaveToCloud={handleSaveToCloud}
              onOpenSaved={() => setShowSaved(true)}
              onSignOut={() => { setUser(null); setActiveCvId(null); }}
              saveStatus={saveStatus}
            />
          </motion.div>
        ) : view === 'templatepicker' ? (
          <motion.div key="templatepicker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <TemplatePicker
              onConfirm={handleTemplateConfirm}
              onBack={() => setView('home')}
            />
          </motion.div>
        ) : view === 'builder' ? (
          <motion.div key="builder" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <BuilderWorkspace
              resumeData={resumeData}
              onUpdate={handleDataUpdate}
              onTailor={handleTailor}
              onReset={triggerReset}
              aiFeed={aiFeed}
              matchScore={matchScore}
              missingKeywords={missingKeywords}
              extraMetrics={extraMetrics}
              onBack={() => setView('templatepicker')}
              initialTemplate={selectedTemplate}
            />
          </motion.div>
          ) : view === 'ats' ? (
            <motion.div key="ats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <Suspense fallback={<div className="min-h-screen bg-aura-surface flex items-center justify-center text-aura-primary font-bold">Loading AI Engine...</div>}>
                <ATSScoreChecker />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div key="smartcv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <SmartCV
                onBack={() => setView('home')}
                resumeData={resumeData}
                onUpdate={handleDataUpdate}
                onTailor={handleTailor}
                aiFeed={aiFeed}
                matchScore={matchScore}
                missingKeywords={missingKeywords}
                extraMetrics={extraMetrics}
              />
            </motion.div>
          )}
      </AnimatePresence>

      {/* Part-Time CV Generator — Full-screen Overlay */}
      <AnimatePresence>
        {showPartTime && (
          <PartTimeCVGenerator onClose={() => setShowPartTime(false)} />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>

      {/* Saved CVs Modal */}
      <AnimatePresence>
        {showSaved && (
          <SavedCVs
            onClose={() => setShowSaved(false)}
            onLoad={handleLoadFromCloud}
          />
        )}
      </AnimatePresence>

      {/* Custom Revert Confirmation Modal */}
      <AnimatePresence>
        {showRevertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#111] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">!</span>
                System Restore Required?
              </h3>
              <p className="text-sm text-aura-muted mb-6 leading-relaxed">
                This will wipe all AI-synthesized narratives and your recent manual edits, permanently restoring the original Master Data core. Proceed?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRevertModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#333] text-white text-sm font-semibold hover:bg-[#222] transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold hover:bg-red-500/30 hover:border-red-400 focus:ring-2 focus:ring-red-500/50 transition-all active:scale-95"
                >
                  Confirm Wipe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
