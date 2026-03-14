// ATSScoreChecker.jsx
// Full ATS Score Checker — upload CV, paste JD, get instant AI-powered score
// Replaces the "Smart Match UI" and "Live Gamified UI" buttons on Homepage

import { useState, useEffect, useRef, useCallback } from 'react';
import { analyseCV, detectJobType } from '../utils/atsEngine';
import { saveATSScan, getATSScoreTrend, getUser } from '../services/supabase';

// ── PDF text extraction (reuses existing pdfExtract.js logic) ──
async function extractPDFText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        if (!pdfjsLib) {
          // Fallback: load PDF.js from CDN if not already loaded
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script);
          await new Promise(res => script.onload = res);
          window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const pdf = await window['pdfjs-dist/build/pdf'].getDocument(typedArray).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Animated score circle ──
function ScoreCircle({ score, rating, animate }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg width={200} height={200} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={rating?.color || '#6366f1'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? offset : circumference}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <text x="100" y="88" textAnchor="middle" fontSize="44" fontWeight="800"
          fill="#111827" fontFamily="system-ui, sans-serif">
          {score}
        </text>
        <text x="100" y="112" textAnchor="middle" fontSize="13" fill="#6b7280"
          fontFamily="system-ui, sans-serif">
          out of 100
        </text>
        <text x="100" y="132" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={rating?.color || '#6366f1'} fontFamily="system-ui, sans-serif">
          {rating?.label}
        </text>
      </svg>
    </div>
  );
}

// ── Score breakdown bar ──
function BreakdownBar({ label, score, maxScore }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  const color = pct >= 80 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {score}/{maxScore}
        </span>
      </div>
      <div style={{
        height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 0.8s ease'
        }} />
      </div>
    </div>
  );
}

// ── Keyword badge ──
function KeywordBadge({ keyword, importance, found, reason }) {
  const colors = found
    ? { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
    : importance === 'high'
      ? { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' }
      : importance === 'medium'
        ? { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' }
        : { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' };

  return (
    <span title={reason || ''} style={{
      display: 'inline-block',
      padding: '4px 10px',
      margin: '3px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      cursor: reason ? 'help' : 'default'
    }}>
      {found ? '✓' : '✗'} {keyword}
    </span>
  );
}

// ── Main component ──
export default function ATSScoreChecker() {
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jobType, setJobType] = useState(null); // null = auto-detect
  const [detectedType, setDetectedType] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [user, setUser] = useState(null);
  const [scanSaved, setScanSaved] = useState(false);
  const [scoreTrend, setScoreTrend] = useState(null);
  const fileInputRef = useRef();
  const resultsRef = useRef();

  useEffect(() => {
    getUser().then(u => {
      setUser(u);
      if (u) getATSScoreTrend().then(setScoreTrend);
    });
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setError('');

    if (file.type === 'application/pdf') {
      setProgress('Extracting CV text...');
      try {
        const text = await extractPDFText(file);
        setCvText(text);
        setCvFile(file);
        setProgress('');
      } catch {
        setError('Could not read PDF. Try copying and pasting your CV text below instead.');
        setProgress('');
      }
    } else if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt')
    ) {
      const reader = new FileReader();
      reader.onload = e => {
        setCvText(e.target.result);
        setCvFile(file);
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a PDF or plain text file. For DOCX, copy and paste the text below.');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleJDChange = (e) => {
    const text = e.target.value;
    setJdText(text);
    if (text.length > 100) {
      setDetectedType(detectJobType(text));
    }
  };

  const handleAnalyse = async () => {
    if (!cvText || !jdText) {
      setError('Please provide both your CV and the job description.');
      return;
    }

    setAnalysing(true);
    setError('');
    setResults(null);
    setScoreAnimated(false);

    try {
      setProgress('Checking CV structure...');
      await new Promise(r => setTimeout(r, 400));

      setProgress('Running AI semantic analysis...');
      const result = await analyseCV(cvText, jdText, jobType || null);

      setProgress('Calculating final score...');
      await new Promise(r => setTimeout(r, 300));

      setResults(result);
      setProgress('');

      // Scroll to results and trigger animation
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => setScoreAnimated(true), 300);
      }, 100);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setProgress('');
    } finally {
      setAnalysing(false);
    }
  };

  // ── Save scan to Supabase (logged-in users only) ──────────────────────────
  const handleSaveScan = async () => {
    if (!results || !user) return;
    try {
      await saveATSScan({
        score: results.overallScore,
        jobType: results.jobType,
        sector: results.detectedSector,
        matchedCount: results.matchedKeywords.length,
        missingCount: results.missingKeywords.length,
      });
      setScanSaved(true);
      // Refresh trend
      const trend = await getATSScoreTrend();
      setScoreTrend(trend);
    } catch (e) {
      console.error('Save scan failed:', e);
    }
  };

  // ── Fix My CV — passes full context to Part-Time CV builder ──────────────
  const handleFixCV = () => {
    if (!results) return;

    const highPriorityKeywords = results.missingKeywords
      .filter(k => k.importance === 'high')
      .map(k => k.keyword);

    const allMissingKeywords = results.missingKeywords
      .map(k => k.keyword);

    // Store full ATS context in sessionStorage for the builder to read
    const atsContext = {
      missingKeywords: highPriorityKeywords,
      allMissingKeywords,
      sector: results.detectedSector || 'manufacturing',
      jobType: results.jobType,
      previousScore: results.overallScore,
      rating: results.rating?.label,
      jdText: jdText,
      cvText: cvText.slice(0, 3000), // cap at 3k chars to stay under sessionStorage limits
      timestamp: Date.now(),
    };

    sessionStorage.setItem('gokulcv_ats_fix_context', JSON.stringify(atsContext));

    // Navigate to the Part-Time CV builder
    window.location.href = '/builder';
  };

  const canAnalyse = cvText.trim().length > 50 && jdText.trim().length > 50;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f0f9ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <a href="/" style={{ textDecoration: 'none', color: '#6b7280', fontSize: 14 }}>← Back</a>
        <span style={{ color: '#d1d5db' }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>ATS Score Checker</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 20, padding: '6px 16px', marginBottom: 20
          }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>
              AI-Powered • UK-Focused • Free
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 900, color: '#111827', margin: '0 0 12px',
            lineHeight: 1.15
          }}>
            Will Your CV Pass the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>ATS?</span>
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 520, margin: '0 auto' }}>
            Paste your job description and upload your CV. Our AI analyses it the same way real ATS systems do — then tells you exactly what to fix.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: 'white', borderRadius: 20,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
          padding: 32, marginBottom: 32
        }}>

          {/* Job type toggle */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
              Role Type
              {detectedType && !jobType && (
                <span style={{
                  marginLeft: 10, fontSize: 12, color: '#6b7280', fontWeight: 400
                }}>
                  (auto-detected from JD)
                </span>
              )}
            </label>
            <div style={{
              display: 'flex', background: '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: 12, padding: 4
            }}>
              {[
                { value: null, label: '🔍 Auto-detect' },
                { value: 'part-time', label: '⏰ Part-Time' },
                { value: 'full-time', label: '💼 Full-Time' }
              ].map(opt => (
                <button key={String(opt.value)} onClick={() => setJobType(opt.value)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: jobType === opt.value ? 'white' : 'transparent',
                    color: jobType === opt.value ? '#2563eb' : '#6b7280',
                    boxShadow: jobType === opt.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none'
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
            {detectedType && !jobType && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0' }}>
                Detected: <strong style={{ color: '#2563eb' }}>
                  {detectedType === 'part-time' ? 'Part-Time' : 'Full-Time'}
                </strong> role
                — <button onClick={() => setJobType(detectedType === 'part-time' ? 'full-time' : 'part-time')}
                  style={{
                    background: 'none', border: 'none', color: '#7c3aed',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0
                  }}>
                  Switch?
                </button>
              </p>
            )}
          </div>

          {/* CV Upload */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
              Your CV
            </label>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#2563eb' : cvFile ? '#22c55e' : '#d1d5db'}`,
                borderRadius: 12,
                padding: '20px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? '#eff6ff' : cvFile ? '#f0fdf4' : '#fafafa',
                transition: 'all 0.2s',
                marginBottom: 12
              }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {cvFile ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{cvFile.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {Math.round(cvText.split(/\s+/).length)} words extracted
                    <button onClick={e => { e.stopPropagation(); setCvFile(null); setCvText(''); }}
                      style={{
                        marginLeft: 10, background: 'none', border: 'none',
                        color: '#ef4444', cursor: 'pointer', fontSize: 12
                      }}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Drop your CV here or click to upload
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>PDF supported</div>
                </div>
              )}
            </div>

            {/* Text paste fallback */}
            {!cvFile && (
              <div>
                <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 8 }}>
                  or paste your CV text directly
                </div>
                <textarea
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                  placeholder="Paste your CV text here..."
                  style={{
                    width: '100%', minHeight: 140, padding: '12px 14px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10,
                    fontSize: 13, color: '#374151', resize: 'vertical',
                    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    lineHeight: 1.5
                  }}
                />
              </div>
            )}
          </div>

          {/* JD Input */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
              Job Description
              <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
                Copy the full JD from the job listing
              </span>
            </label>
            <textarea
              value={jdText}
              onChange={handleJDChange}
              placeholder="Paste the full job description here — include requirements, responsibilities, and any skills listed..."
              style={{
                width: '100%', minHeight: 180, padding: '14px 16px',
                border: `1.5px solid ${jdText.length > 100 ? '#bfdbfe' : '#e5e7eb'}`,
                borderRadius: 12, fontSize: 13, color: '#374151',
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.2s'
              }}
            />
            {jdText.length > 0 && (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, textAlign: 'right' }}>
                {jdText.split(/\s+/).filter(Boolean).length} words
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: '#991b1b'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Analyse button */}
          <button
            onClick={handleAnalyse}
            disabled={!canAnalyse || analysing}
            style={{
              width: '100%', padding: '16px 24px',
              background: canAnalyse && !analysing
                ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                : '#e5e7eb',
              color: canAnalyse && !analysing ? 'white' : '#9ca3af',
              border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: canAnalyse && !analysing ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canAnalyse && !analysing ? '0 4px 14px rgba(37,99,235,0.35)' : 'none'
            }}>
            {analysing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{
                  width: 18, height: 18, border: '2px solid white',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite'
                }} />
                {progress || 'Analysing...'}
              </span>
            ) : (
              '🎯 Analyse My CV'
            )}
          </button>
        </div>

        {/* ── RESULTS ── */}
        {results && (
          <div ref={resultsRef}>

            {/* Score header */}
            <div style={{
              background: 'white', borderRadius: 20,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
              padding: 32, marginBottom: 20,
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-block',
                background: results.jobType === 'part-time' ? '#eff6ff' : '#f5f3ff',
                border: `1px solid ${results.jobType === 'part-time' ? '#bfdbfe' : '#ddd6fe'}`,
                borderRadius: 20, padding: '4px 14px', fontSize: 12,
                fontWeight: 700, color: results.jobType === 'part-time' ? '#1d4ed8' : '#7c3aed',
                marginBottom: 20
              }}>
                {results.jobType === 'part-time' ? '⏰ Part-Time Algorithm' : '💼 Full-Time Algorithm'}
              </div>

              <ScoreCircle
                score={results.overallScore}
                rating={results.rating}
                animate={scoreAnimated}
              />

              <p style={{
                margin: '20px auto 0', maxWidth: 480,
                fontSize: 14, color: '#4b5563', lineHeight: 1.6
              }}>
                {results.verdict}
              </p>

              {/* Score trend (logged-in users) */}
              {user && scoreTrend?.history?.length > 0 && (
                <div style={{
                  marginTop: 16, padding: '12px 20px',
                  background: '#f9fafb', borderRadius: 10,
                  display: 'inline-flex', alignItems: 'center', gap: 16,
                  fontSize: 13
                }}>
                  <span style={{ color: '#6b7280' }}>Your best: <strong style={{ color: '#111' }}>{scoreTrend.best}</strong></span>
                  {scoreTrend.trend !== null && (
                    <span style={{ color: scoreTrend.trend >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                      {scoreTrend.trend >= 0 ? '↑' : '↓'} {Math.abs(scoreTrend.trend)} from last scan
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleFixCV} style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                }}>
                  🔧 Fix My CV with AI →
                </button>

                {user && !scanSaved && (
                  <button onClick={handleSaveScan} style={{
                    background: 'white', color: '#374151',
                    border: '1.5px solid #d1d5db', borderRadius: 10,
                    padding: '12px 20px', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    💾 Save Scan Result
                  </button>
                )}
                {scanSaved && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#16a34a', fontWeight: 600,
                    padding: '12px 16px'
                  }}>
                    ✓ Scan saved to your history
                  </span>
                )}
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{
              background: 'white', borderRadius: 20,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
              padding: 28, marginBottom: 20
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>
                📊 Score Breakdown
              </h2>
              {Object.values(results.breakdown).map((cat) => (
                <BreakdownBar
                  key={cat.label}
                  label={cat.label}
                  score={cat.score}
                  maxScore={cat.maxScore}
                />
              ))}
            </div>

            {/* Keywords */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20, marginBottom: 20
            }}>
              {/* Found keywords */}
              <div style={{
                background: 'white', borderRadius: 20,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                padding: 24
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#166534', margin: '0 0 14px' }}>
                  ✅ Keywords Found ({results.matchedKeywords.length})
                </h2>
                <div>
                  {results.matchedKeywords.map((k, i) => (
                    <KeywordBadge
                      key={i}
                      keyword={k.keyword}
                      importance={k.importance}
                      found={true}
                    />
                  ))}
                  {results.matchedKeywords.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>No matching keywords found.</p>
                  )}
                </div>
              </div>

              {/* Missing keywords */}
              <div style={{
                background: 'white', borderRadius: 20,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                padding: 24
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', margin: '0 0 14px' }}>
                  ❌ Missing Keywords ({results.missingKeywords.length})
                </h2>
                <div>
                  {results.missingKeywords
                    .sort((a, b) => {
                      const order = { high: 0, medium: 1, low: 2 };
                      return order[a.importance] - order[b.importance];
                    })
                    .map((k, i) => (
                      <KeywordBadge
                        key={i}
                        keyword={k.keyword}
                        importance={k.importance}
                        found={false}
                        reason={k.reason}
                      />
                    ))}
                  {results.missingKeywords.length === 0 && (
                    <p style={{ fontSize: 13, color: '#6b7280' }}>
                      Great — no critical keywords missing!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {results.suggestions.length > 0 && (
              <div style={{
                background: 'white', borderRadius: 20,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                padding: 28, marginBottom: 20
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>
                  💡 How to Improve Your Score
                </h2>
                {results.suggestions.map((s, i) => {
                  const priorityStyle = {
                    high: { bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', label: 'HIGH' },
                    medium: { bg: '#fff7ed', border: '#fed7aa', dot: '#f59e0b', label: 'MED' },
                    low: { bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af', label: 'LOW' }
                  }[s.priority] || { bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af', label: '' };

                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 14, padding: '14px 16px',
                      background: priorityStyle.bg,
                      border: `1px solid ${priorityStyle.border}`,
                      borderRadius: 10, marginBottom: 10
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: priorityStyle.dot, marginTop: 5, flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, lineHeight: 1.5 }}>
                          {s.action}
                        </div>
                        {s.example && (
                          <div style={{
                            fontSize: 12, color: '#6b7280', marginTop: 6,
                            padding: '6px 10px', background: 'white',
                            borderRadius: 6, fontStyle: 'italic'
                          }}>
                            e.g. {s.example}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: priorityStyle.dot,
                        letterSpacing: 0.5, alignSelf: 'flex-start', marginTop: 2
                      }}>
                        {priorityStyle.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              borderRadius: 20, padding: 32, textAlign: 'center', color: 'white'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
                Ready to fix your CV?
              </h2>
              <p style={{ fontSize: 14, opacity: 0.85, margin: '0 0 20px' }}>
                Our AI CV builder uses your missing keywords to rewrite your CV so it actually passes ATS.
              </p>
              <button onClick={handleFixCV} style={{
                background: 'white', color: '#2563eb',
                border: 'none', borderRadius: 10, padding: '12px 28px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer'
              }}>
                Build an ATS-Optimised CV →
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
