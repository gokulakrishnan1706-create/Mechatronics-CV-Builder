/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Homepage from './components/Homepage';
import BuilderWorkspace from './components/BuilderWorkspace';
import initialResumeData from './data/resumeData.json';

function App() {
  const [view, setView] = useState('home');
  // Persistence Logic: Load from localStorage on init
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('aura_resume_cache');
    return saved ? JSON.parse(saved) : initialResumeData;
  });

  const [aiFeed, setAiFeed] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [extraMetrics, setExtraMetrics] = useState(null);

  // Auto-Save: Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem('aura_resume_cache', JSON.stringify(resumeData));
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
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
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
    setShowRevertModal(false);
  };

  const handleTailor = async (jd) => {
    const addLog = (msg, type = 'info') => {
      setAiFeed(prev => [{ text: msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    try {
      addLog("Initializing Intelligent Brain...", "info");
      const { tailorResume } = await import('./services/ai');

      addLog("Analyzing Job Description for high-impact keywords...", "info");
      // Simulated steps for UX while AI processes
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

      // Overwrite the entire CV state with the newly synthesized, narrative-driven version
      setResumeData(synthesizedCV);

      addLog("Total Synthesis Complete. Review your new narrative.", "success");
    } catch (err) {
      console.error(err);
      addLog("AI Engine Error. Check your connection or API key.", "error");
    }
  };

  // Smooth transition handler
  const goToBuilder = () => {
    setView('builder');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-aura-surface font-sans text-aura-dark selection:bg-aura-primary/20 selection:text-aura-primary relative">
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Homepage onStartBuilding={() => setView('builder')} />
          </motion.div>
        ) : (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BuilderWorkspace
              resumeData={resumeData}
              onUpdate={handleDataUpdate}
              onTailor={handleTailor}
              onReset={triggerReset}
              aiFeed={aiFeed}
              matchScore={matchScore}
              missingKeywords={missingKeywords}
              extraMetrics={extraMetrics}
              onBack={() => setView('home')}
            />
          </motion.div>
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
