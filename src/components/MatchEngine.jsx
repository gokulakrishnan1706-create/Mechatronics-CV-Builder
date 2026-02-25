import React, { useState } from 'react';

import { Target, BrainCircuit, Loader2, Terminal, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import MatchScoreCard from './MatchScoreCard';

const MatchEngine = ({ onTailor, aiFeed, matchScore, missingKeywords, extraMetrics }) => {
    const [jd, setJd] = useState('');

    const hasResults = matchScore !== null && matchScore > 0;

    return (
        <div className="h-full flex flex-col relative z-10">

            <div className="mb-5 px-1 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">AI Match Engine</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Paste a Job Description to tailor your CV</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <Target className="h-4 w-4 text-amber-600" />
                </div>
            </div>

            {hasResults && (
                <div className="space-y-6 mb-8">
                    {/* ═══ SCORE CARD & CRITIQUE ═══ */}
                    <MatchScoreCard score={matchScore} impactCritique={extraMetrics?.impactCritique} />

                    {/* ═══ SEMANTIC INSIGHTS ═══ */}
                    {extraMetrics && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Semantic Match</span>
                                <span className="text-2xl font-black text-brand-primary">{extraMetrics.semanticScore}%</span>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Impact Density</span>
                                <span className="text-2xl font-black text-emerald-600">+{extraMetrics.impactScore}</span>
                            </div>
                        </div>
                    )}

                    {/* ═══ MISSING KEYWORDS ═══ */}
                    {missingKeywords && missingKeywords.length > 0 && (
                        <div className="p-5 bg-white rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Keywords Required</span>
                                </div>
                                <div className="flex flex-wrap gap-2 cursor-default">
                                    {missingKeywords.map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 transition-colors"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ CONTEXTUAL AI SUGGESTIONS ═══ */}
                    {extraMetrics?.contextualSuggestions?.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Sparkles className="h-4 w-4 text-brand-primary" />
                                <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">AI Rewrite Suggestions</h4>
                            </div>
                            {extraMetrics.contextualSuggestions.map((sug, i) => (
                                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-brand-primary/30 transition-colors">
                                    <div className="flex gap-3">
                                        <Sparkles className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                                        <div>
                                            <h5 className="text-slate-900 font-semibold text-sm">{sug.target}</h5>
                                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                                {sug.suggestion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* ═══ STATUS FEED (Terminal) ═══ */}
            {aiFeed.length > 0 && (
                <div
                    className="mb-8 relative group"
                >
                    {/* Background border glow */}
                    <div className="absolute -inset-[1px] bg-slate-200/50 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Terminal Header */}
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    System Analysis
                                    {aiFeed[0]?.type !== 'success' && aiFeed[0]?.type !== 'error' && (
                                        <span className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                            ))}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50 group-hover:bg-rose-500/60 transition-colors" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50 group-hover:bg-amber-500/60 transition-colors" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 group-hover:bg-emerald-500/60 transition-colors" />
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="p-4 space-y-3 font-mono text-xs max-h-[160px] overflow-y-auto custom-scrollbar">
                            {aiFeed.map((msg, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 justify-start"
                                >
                                    <span className="text-slate-400 shrink-0 w-16 select-none font-bold">[{msg.time?.split(' ')[0]}]</span>
                                    <span className={`shrink-0 ${msg.type === 'success' ? 'text-emerald-500' :
                                        msg.type === 'error' ? 'text-rose-500' :
                                            msg.type === 'warning' ? 'text-amber-500' :
                                                'text-brand-primary'
                                        }`}>
                                        {msg.type === 'success' ? '✔' : msg.type === 'error' ? '✖' : msg.type === 'warning' ? '⚠' : '❯'}
                                    </span>
                                    <span className={`leading-snug ${msg.type === 'success' ? 'text-slate-900' :
                                        msg.type === 'error' ? 'text-rose-600' :
                                            'text-slate-600'
                                        }`}>
                                        {msg.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        {aiFeed[0]?.type !== 'success' && aiFeed[0]?.type !== 'error' && (
                            <div className="h-[2px] w-full bg-slate-200">
                                <div
                                    className="h-full bg-brand-primary shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )
            }
            {/* ═══ JD INPUT ═══ */}
            <div className="flex flex-col flex-1 space-y-4">
                {!hasResults && aiFeed.length === 0 && (
                    <div className="text-center py-8 px-6 bg-white border border-slate-200 rounded-xl mb-4 shadow-sm">
                        <div className="mx-auto w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-3">How it Works</h4>
                        <div className="space-y-3 text-xs text-slate-500 text-left max-w-[240px] mx-auto">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 font-mono flex items-center justify-center text-slate-500 font-bold">1</span>
                                <span>Paste target Job Description</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 font-mono flex items-center justify-center text-slate-500 font-bold">2</span>
                                <span>AI rewrites your CV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 font-mono flex items-center justify-center text-slate-500 font-bold">3</span>
                                <span>Review the match score</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative flex-1 group/jd">
                    <div className="absolute -inset-[1px] bg-slate-200/50 rounded-xl blur-sm opacity-0 group-focus-within/jd:opacity-100 transition-opacity duration-500" />
                    <textarea
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="Paste target Job Description here..."
                        maxLength={15000}
                        className="relative w-full h-full min-h-[200px] bg-white border border-slate-300 group-focus-within/jd:border-brand-primary rounded-xl text-sm text-slate-900 p-5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 placeholder-slate-400 shadow-sm custom-scrollbar transition-all font-medium leading-relaxed"
                    />
                    {jd.length > 0 && (
                        <span className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 z-10">{jd.split(/\s+/).filter(Boolean).length} words</span>
                    )}
                </div>

                {/* Engage Button */}
                <button
                    onClick={() => onTailor(jd)}
                    disabled={!jd.trim()}
                    className="w-full py-4 px-6 bg-brand-primary hover:bg-blue-700 border border-transparent text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:hover:bg-brand-primary disabled:active:scale-100 group/btn relative overflow-hidden shadow-sm cursor-pointer"
                >
                    <BrainCircuit className="h-5 w-5 text-white group-hover/btn:rotate-12 transition-transform" />
                    <span className="text-sm tracking-wide">Run AI Synthesis</span>
                    <ArrowRight className="h-4 w-4 text-white/80 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div >
    );
};

export default MatchEngine;
