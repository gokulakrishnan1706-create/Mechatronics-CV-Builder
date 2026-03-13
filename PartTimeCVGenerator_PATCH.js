// ============================================================
// PartTimeCVGenerator.jsx — ATS Fix Mode Patch
// 
// These are the EXACT additions to make to the existing file.
// Do NOT replace the whole file — add/modify only the sections below.
// ============================================================

// ── SECTION 1: Add to imports at top of file ──────────────────────────────
// Find the existing import line that contains: useState, useEffect, useCallback, useRef
// ADD `useMemo` if not already there (may already be present)
// The import should look like:
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ADD this import after the existing imports (before the component starts):
import { saveCVVersion, saveCV, getUser } from '../services/supabase';

// ── SECTION 2: Add new state variables ────────────────────────────────────
// Inside the PartTimeCVGenerator function, AFTER the existing useState declarations, ADD:

  const [atsFix, setAtsFix] = useState(null);     // ATS Fix Mode context from sessionStorage
  const [currentUser, setCurrentUser] = useState(null);
  const [savedCvId, setSavedCvId] = useState(null); // ID of last saved CV in Supabase
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [atsRescanScore, setAtsRescanScore] = useState(null); // score after AI fix

// ── SECTION 3: Add useEffect to read ATS context on mount ─────────────────
// AFTER the existing useEffect hooks (e.g. the one that loads from localStorage), ADD:

  useEffect(() => {
    // Load ATS fix context if coming from the ATS Score Checker
    const raw = sessionStorage.getItem('gokulcv_ats_fix_context');
    if (raw) {
      try {
        const ctx = JSON.parse(raw);
        // Only use if less than 30 minutes old
        if (Date.now() - ctx.timestamp < 30 * 60 * 1000) {
          setAtsFix(ctx);
          // Auto-select sector if detected
          if (ctx.sector) {
            setSector(ctx.sector);
          }
        }
        sessionStorage.removeItem('gokulcv_ats_fix_context');
      } catch (e) {
        console.error('Failed to parse ATS context:', e);
      }
    }

    // Load current user
    getUser().then(setCurrentUser);
  }, []);

// ── SECTION 4: Add ATS Fix Mode Banner UI ─────────────────────────────────
// FIND the return statement in PartTimeCVGenerator.
// FIND the main container div (the outermost div of the component).
// ADD this banner as the FIRST CHILD inside that container, before the sector selector:

  {/* ATS Fix Mode Banner */}
  {atsFix && (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 24,
      border: '1px solid #3b82f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#93c5fd',
            letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase'
          }}>
            ATS Fix Mode Active
          </div>
          <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.5 }}>
            Your previous ATS score was{' '}
            <strong style={{ color: '#fbbf24' }}>{atsFix.previousScore}/100</strong>.
            The AI will target these missing keywords in your rewrite:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {atsFix.missingKeywords.map(kw => (
              <span key={kw} style={{
                background: '#1d4ed8', color: '#bfdbfe',
                fontSize: 12, fontWeight: 700,
                padding: '3px 10px', borderRadius: 20,
                border: '1px solid #3b82f6'
              }}>
                + {kw}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            After generating, go back to the ATS Checker to see your new score.
          </div>
        </div>
        <button
          onClick={() => setAtsFix(null)}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', fontSize: 18, padding: 4, flexShrink: 0
          }}
          title="Dismiss ATS Fix Mode"
        >✕</button>
      </div>
    </div>
  )}

// ── SECTION 5: Modify the AI generation function ───────────────────────────
// FIND the function that builds the AI prompt for CV generation.
// It will be something like: const prompt = `...` or a call to tailorResume/callGroq.
// 
// FIND where the system prompt or user prompt is constructed.
// It will contain something like "sector" keywords and instructions to write a CV.
//
// ADD this block BEFORE the existing prompt construction to modify it in ATS mode:

  const buildAtsFixInstructions = () => {
    if (!atsFix || !atsFix.missingKeywords.length) return '';
    return `
    
    CRITICAL ATS FIX INSTRUCTIONS:
    This CV is being rewritten to fix specific ATS failures. The following keywords 
    were MISSING from the previous version and MUST appear naturally in the output:
    ${atsFix.missingKeywords.join(', ')}
    
    Rules for keyword integration:
    - Weave them into bullet points naturally — do NOT keyword-stuff
    - Only include a keyword where the candidate's experience genuinely supports it
    - Use the exact keyword phrasing (e.g. "TPM" not "total productive maintenance" 
      unless you also include the abbreviation)
    - The goal is to go from ${atsFix.previousScore}/100 to 85+/100 on an ATS scan
    `;
  };

// Then in your AI prompt construction, ADD the result of buildAtsFixInstructions()
// to either:
// - The system prompt (preferred), at the end
// - The user message, before the CV content
//
// Example — if the prompt currently looks like:
//   const systemPrompt = `You are a professional CV writer for UK ${sector} jobs...`;
// Change it to:
//   const systemPrompt = `You are a professional CV writer for UK ${sector} jobs...${buildAtsFixInstructions()}`;

// ── SECTION 6: Save CV version after generation ────────────────────────────
// FIND the function that handles successful CV generation (likely handleGenerate or similar).
// AFTER the generated formData is set (after setFormData(result) or similar), ADD:

  // Save version to Supabase if logged in
  if (currentUser) {
    try {
      const versionData = await saveCVVersion({
        savedCvId: savedCvId,
        cvData: result, // or whatever the generated data variable is called
        sector: sector,
        atsScore: atsFix?.previousScore || null,
        atsJobType: atsFix?.jobType || null,
        notes: atsFix ? `ATS Fix Mode — was ${atsFix.previousScore}/100` : null,
      });
      console.log('CV version saved:', versionData?.id);
    } catch (e) {
      console.error('Version save failed silently:', e);
    }
  }

// ── SECTION 7: Add Save CV button UI ─────────────────────────────────────
// FIND where the Download PDF button is in the UI.
// ADD this button next to it (shown only when logged in and CV is generated):

  {currentUser && formData?.name && (
    <button
      onClick={async () => {
        setSaveStatus('saving');
        try {
          const saved = await saveCV({
            title: `${formData.name || 'My CV'} — ${sector} — ${new Date().toLocaleDateString('en-GB')}`,
            sector,
            cvData: formData,
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
      style={{
        background: saveStatus === 'saved' ? '#16a34a' : '#1e293b',
        color: 'white', border: 'none', borderRadius: 10,
        padding: '12px 20px', fontSize: 14, fontWeight: 700,
        cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
        opacity: saveStatus === 'saving' ? 0.7 : 1,
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      {saveStatus === 'saving' ? '💾 Saving...' 
       : saveStatus === 'saved' ? '✓ Saved!' 
       : '💾 Save CV'}
    </button>
  )}
