import React, { useState, useEffect, useMemo } from 'react';

const SmartCV = ({ onBack }) => {
  // --- STATE ---
  const [cvData, setCvData] = useState({
    firstName: "John", lastName: "Doe", email: "john.doe@example.com",
    role: "Software Engineer", summary: "Passionate developer with experience in building scalable web applications."
  });

  const [jobDescription, setJobDescription] = useState("");
  const [isJdOpen, setIsJdOpen] = useState(true); // Toggle for the JD paste box

  // --- LOCAL INTELLIGENCE (Keyword Extraction Algorithm) ---
  const targetKeywords = useMemo(() => {
    if (!jobDescription) return [];
    // 1. Strip punctuation and make lowercase
    const words = jobDescription.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    // 2. Remove common filler words
    const stopWords = ['this', 'that', 'with', 'from', 'your', 'have', 'more', 'will', 'about', 'which', 'their', 'they', 'were', 'what', 'when', 'where', 'there', 'could', 'would', 'should', 'experience', 'ability', 'skills', 'working'];
    const filtered = words.filter(w => !stopWords.includes(w));
    // 3. Count frequency to find the most "important" words
    const counts = {};
    filtered.forEach(w => counts[w] = (counts[w] || 0) + 1);
    // 4. Return the top 12 keywords
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 12);
  }, [jobDescription]);

  // --- LIVE MATCH SCORING ---
  // Combine all CV text to check against
  const fullCvText = `${cvData.role} ${cvData.summary}`.toLowerCase();
  const matchedKeywords = targetKeywords.filter(keyword => fullCvText.includes(keyword));
  const matchScore = targetKeywords.length > 0 ? Math.round((matchedKeywords.length / targetKeywords.length) * 100) : 0;

  // Circular Progress Bar Math
  const circleRadius = 36;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circleCircumference - (matchScore / 100) * circleCircumference;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

      {/* HEADER: Sleek & Modern */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 tracking-tight">
              SmartCV
            </h1>
          </div>
          <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Download ATS PDF
          </button>
        </div>
      </header>

      <main className="flex flex-1 h-[calc(100vh-73px)]">

        {/* LEFT PANEL: The Gamified Workspace */}
        <section className="w-[55%] flex flex-col h-full bg-slate-50 border-r border-slate-200 relative">

          {/* THE GAMIFICATION HUD (Sticky Top) */}
          <div className="sticky top-0 bg-white shadow-sm border-b border-slate-200 p-6 z-10">

            {/* Score Ring & Title */}
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r={circleRadius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                  <circle cx="40" cy="40" r={circleRadius} stroke="currentColor" strokeWidth="6" fill="transparent"
                    className={`${matchScore >= 80 ? 'text-emerald-500' : matchScore >= 40 ? 'text-amber-400' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                    strokeDasharray={circleCircumference} strokeDashoffset={strokeOffset} strokeLinecap="round" />
                </svg>
                <span className="absolute text-xl font-black text-slate-700">{matchScore}%</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Target Job Match</h2>
                <p className="text-sm text-slate-500">Paste a job description to extract keywords and score your CV.</p>
              </div>
            </div>

            {/* Keyword Tag Cloud */}
            {targetKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                {targetKeywords.map(keyword => {
                  const isMatched = matchedKeywords.includes(keyword);
                  return (
                    <span key={keyword} className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-500 flex items-center gap-1
                      ${isMatched ? 'bg-emerald-50 text-emerald-700 border-emerald-200 scale-105' : 'bg-slate-100 text-slate-500 border-slate-200 border-dashed'}`}>
                      {isMatched && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {keyword}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* SCROLLABLE FORM AREA */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">

            {/* Job Description Input Accordion */}
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden transition-all">
              <button onClick={() => setIsJdOpen(!isJdOpen)} className="w-full p-4 flex justify-between items-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <span className="font-semibold text-indigo-900 flex items-center gap-2">
                  🎯 Target Job Description
                </span>
                <span className="text-indigo-400 text-sm font-medium">{isJdOpen ? 'Close' : 'Paste JD'}</span>
              </button>
              {isJdOpen && (
                <div className="p-4 pt-0 bg-indigo-50/50">
                  <textarea
                    placeholder="Paste the job requirements here to generate your target keywords..."
                    className="w-full h-32 bg-white border border-indigo-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Builder Form Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Personal Details</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                  <input type="text" className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" value={cvData.firstName} onChange={(e) => setCvData({ ...cvData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input type="text" className="w-full bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" value={cvData.lastName} onChange={(e) => setCvData({ ...cvData, lastName: e.target.value })} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Summary</label>
                  <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">✨ Improve with AI</span>
                </div>
                <textarea className="w-full bg-white border border-slate-300 rounded-xl p-3 h-40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm leading-relaxed" value={cvData.summary} onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}></textarea>
                <p className="text-xs text-slate-400 mt-2">Type your summary here. Watch the keywords light up in the HUD above as you hit the requirements!</p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Live ATS Preview */}
        <section className="w-[45%] bg-slate-200/50 p-8 overflow-y-auto flex justify-center custom-scrollbar">
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-12 transition-all">
            <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
              <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900">{cvData.firstName} {cvData.lastName}</h1>
              <p className="text-slate-600 mt-2 font-medium tracking-wide">{cvData.role} • {cvData.email}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold border-b border-slate-300 mb-3 text-slate-800 uppercase tracking-wider">Professional Summary</h3>
              {/* Highlight matched text slightly in preview */}
              <p className="text-sm text-slate-700 leading-relaxed text-justify">{cvData.summary}</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default SmartCV;
