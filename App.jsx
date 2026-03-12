/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Homepage from './components/Homepage';
import BuilderWorkspace from './components/BuilderWorkspace';
import SmartCV from './components/SmartCV';
import TemplatePicker from './components/TemplatePicker';
import PartTimeCVGenerator from './components/PartTimeCVGenerator';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import SavedCVs from './components/SavedCVs';
import { supabase } from './services/supabase';
import initialResumeData from './data/resumeData.json';

function App() {
  const [view, setView] = useState('home');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [showPartTime, setShowPartTime] = useState(false);

  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedCVs, setShowSavedCVs] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('aura_resume_cache');
    return saved ? JSON.parse(saved) : initialResumeData;
  });

  const [aiFeed, setAiFeed] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [extraMetrics, setExtraMetrics] = useState(null);
  const [showRevertModal, setShowRevertModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_resume_cache', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleDataUpdate = (path, value) => {
    setResumeData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      if (keys.length === 1) { newData[keys[0]] = value; return newData; }
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        const nextIsIndex = /^\d+$/.test(nextKey);
        if (!current[key]) current[key] = nextIsIndex ? [] : {};
        current = current[key];
      }
      const lastKey = keys[keys.length - 1];
      const finalKey = /^\d+$/.test(lastKey) ? parseInt(lastKey, 10) : lastKey;
      current[finalKey] = value;
      return newData;
    });
  };

  const confirmReset = () => {
    setResumeData(initialResumeData);
    localStorage.removeItem('aura_resume_cache');
    setMatchScore(0); setMissingKeywords([]); setExtraMetrics(null); setAiFeed([]);
    setShowRevertModal(false);
  };

  const handleTailor = async (jd) => {
    const addLog = (msg, type = 'info') => {
      setAiFeed(prev => [{ text: msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };
    try {
      addLog('Initializing Intelligent Brain...', 'info');
      const { tailorResume } = await import('./services/ai');
      addLog('Analyzing Job Description for high-impact keywords...', 'info');
      await new Promise(r => setTimeout(r, 600));
      addLog('Cross-referencing mechatronics experience with JD requirements...', 'info');
      const { match_score, missing_keywords, extra_metrics, ...synthesizedCV } = await tailorResume(resumeData, jd);
      addLog(`Analysis Complete. Final Match Score: ${match_score}%`, 'success');
      setMatchScore(match_score);
      setMissingKeywords(missing_keywords || []);
      setExtraMetrics(extra_metrics || null);
      if (missing_keywords?.length > 0) addLog(`${missing_keywords.length} missing keywords identified`, 'warning');
      setResumeData(synthesizedCV);
      addLog('Total Synthesis Complete. Review your new narrative.', 'success');
    } catch (err) {
      console.error(err);
      addLog('AI Engine Error. Check your connection or API key.', 'error');
    }
  };

  const goToBuilder = () => { setView('templatepicker'); window.scrollTo(0, 0); };
  const handleTemplateConfirm = (templateId) => { setSelectedTemplate(templateId); setView('builder'); window.scrollTo(0, 0); };

  const AuthBar = () => (
    <div style={{
      position: 'fixed', top: 12, right: 16, zIndex: 150,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {authLoading ? null : user ? (
        <UserMenu user={user} onViewSaved={() => setShowSavedCVs(true)} />
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            fontSize: 13, fontWeight: 600, color: '#2563eb',
            background: '#fff', border: '1.5px solid #bfdbfe',
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
            fontFamily: 'sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          Sign in / Save CVs
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-aura-surface font-sans text-aura-dark selection:bg-aura-primary/20 selection:text-aura-primary relative">
      <AuthBar />
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Homepage onStartBuilding={goToBuilder} onStartSmartCV={() => setView('smartcv')} onStartPartTime={() => setShowPartTime(true)} />
          </motion.div>
        ) : view === 'templatepicker' ? (
          <motion.div key="templatepicker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <TemplatePicker onConfirm={handleTemplateConfirm} onBack={() => setView('home')} />
          </motion.div>
        ) : view === 'builder' ? (
          <motion.div key="builder" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <BuilderWorkspace
              resumeData={resumeData} onUpdate={handleDataUpdate}
              onTailor={handleTailor} onReset={() => setShowRevertModal(true)}
              aiFeed={aiFeed} matchScore={matchScore}
              missingKeywords={missingKeywords} extraMetrics={extraMetrics}
              onBack={() => setView('templatepicker')} initialTemplate={selectedTemplate}
            />
          </motion.div>
        ) : (
          <motion.div key="smartcv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <SmartCV onBack={() => setView('home')} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPartTime && (
          <PartTimeCVGenerator
            onClose={() => setShowPartTime(false)}
            user={user}
            onSignInRequest={() => setShowAuthModal(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSavedCVs && user && <SavedCVs user={user} onClose={() => setShowSavedCVs(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showRevertModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
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
                <button onClick={() => setShowRevertModal(false)} className="flex-1 py-2.5 px-4 rounded-xl border border-[#333] text-white text-sm font-semibold hover:bg-[#222] transition-colors">Abort</button>
                <button onClick={confirmReset} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold hover:bg-red-500/30 hover:border-red-400 transition-all active:scale-95">Confirm Wipe</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
