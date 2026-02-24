/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { Target, BrainCircuit, Loader2, Terminal, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import MatchScoreCard from './MatchScoreCard';

const MatchEngine = ({ onTailor, aiFeed, matchScore, missingKeywords }) => {
    const [jd, setJd] = useState('');

    const hasResults = matchScore !== null && matchScore > 0;

    return (
        <div className="h-full flex flex-col relative z-10">

            <div className="mb-5 px-1 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">AI Match Engine</h3>
                    <p className="text-[11px] text-white/50 mt-1">Paste a Job Description to tailor your CV</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-2.5 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Target className="h-4 w-4 text-amber-400" />
                </div>
            </div>

            {/* ═══ SCORE CARD ═══ */}
            {hasResults && <MatchScoreCard score={matchScore} />}

            {/* ═══ MISSING KEYWORDS ═══ */}
            {missingKeywords && missingKeywords.length > 0 && (
                <div
                    className="mb-6 p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-amber-500/20 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Keywords Required</span>
                        </div>
                        <div className="flex flex-wrap gap-2 cursor-default">
                            {missingKeywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm"
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* ═══ STATUS FEED (Terminal) ═══ */}
            {aiFeed.length > 0 && (
                <div
                    className="mb-8 relative group"
                >
                    {/* Glowing Background Blur */}
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-aura-primary/30 to-aura-accent/30 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* Terminal Header */}
                        <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-4 w-4 text-white/50" />
                                <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                                    System Analysis
                                    {aiFeed[0]?.type !== 'success' && aiFeed[0]?.type !== 'error' && (
                                        <span className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1.5 h-1.5 bg-aura-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
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
                                    <span className="text-white/30 shrink-0 w-16 select-none font-bold">[{msg.time?.split(' ')[0]}]</span>
                                    <span className={`shrink-0 ${msg.type === 'success' ? 'text-emerald-400' :
                                        msg.type === 'error' ? 'text-rose-400' :
                                            msg.type === 'warning' ? 'text-amber-400' :
                                                'text-aura-primary'
                                        }`}>
                                        {msg.type === 'success' ? '✔' : msg.type === 'error' ? '✖' : msg.type === 'warning' ? '⚠' : '❯'}
                                    </span>
                                    <span className={`leading-snug ${msg.type === 'success' ? 'text-white/90' :
                                        msg.type === 'error' ? 'text-rose-300' :
                                            'text-white/70'
                                        }`}>
                                        {msg.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        {aiFeed[0]?.type !== 'success' && aiFeed[0]?.type !== 'error' && (
                            <div className="h-[2px] w-full bg-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-aura-primary via-aura-glow to-aura-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]"
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
                    <div className="text-center py-8 px-6 bg-white/5 border border-white/5 rounded-2xl mb-4">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                            <Sparkles className="h-6 w-6 text-amber-400" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-3">How it Works</h4>
                        <div className="space-y-3 text-xs text-white/50 text-left max-w-[240px] mx-auto">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 font-mono flex items-center justify-center text-white/60 font-bold shadow-inner">1</span>
                                <span>Paste target Job Description</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 font-mono flex items-center justify-center text-white/60 font-bold shadow-inner">2</span>
                                <span>AI rewrites your CV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 font-mono flex items-center justify-center text-white/60 font-bold shadow-inner">3</span>
                                <span>Review the match score</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative flex-1 group/jd">
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-aura-primary/20 to-transparent rounded-2xl blur-sm opacity-0 group-focus-within/jd:opacity-100 transition-opacity duration-500" />
                    <textarea
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="Paste target Job Description here..."
                        maxLength={15000}
                        className="relative w-full h-full min-h-[200px] bg-black/40 backdrop-blur-md border border-white/10 group-focus-within/jd:border-aura-primary/50 group-focus-within/jd:bg-black/60 rounded-2xl text-sm text-white p-5 resize-none focus:outline-none focus:ring-0 placeholder:text-white/20 custom-scrollbar transition-all font-medium leading-relaxed"
                    />
                    {jd.length > 0 && (
                        <span className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-white/30 bg-black/60 px-2 py-1 rounded-md border border-white/10 backdrop-blur-sm z-10">{jd.split(/\s+/).filter(Boolean).length} words</span>
                    )}
                </div>

                {/* Engage Button */}
                <button
                    onClick={() => onTailor(jd)}
                    disabled={!jd.trim()}
                    className="w-full py-4 px-6 bg-gradient-to-r from-aura-primary to-aura-glow border border-white/20 hover:border-white/40 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:hover:border-white/20 disabled:active:scale-100 group/btn relative overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                >
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <BrainCircuit className="h-5 w-5 text-white group-hover/btn:rotate-12 transition-transform drop-shadow-md" />
                    <span className="text-sm tracking-wide drop-shadow-md">Run AI Synthesis</span>
                    <ArrowRight className="h-4 w-4 text-white/70 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div >
    );
};

export default MatchEngine;
