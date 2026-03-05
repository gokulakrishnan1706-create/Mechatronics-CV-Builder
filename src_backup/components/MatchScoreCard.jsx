import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

const MatchScoreCard = ({ score, impactCritique }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Animated count-up
    const [displayScore, setDisplayScore] = useState(0);
    useEffect(() => {
        let current = 0;
        const step = Math.max(1, Math.ceil(score / 40));
        const interval = setInterval(() => {
            current += step;
            if (current >= score) {
                current = score;
                clearInterval(interval);
            }
            setDisplayScore(current);
        }, 30);
        return () => clearInterval(interval);
    }, [score]);

    const getImpactLevel = () => {
        if (score >= 80) return { color: '#10b981', label: 'OPTIMAL', desc: 'Strong alignment with role requirements' };
        if (score >= 60) return { color: '#4F46E5', label: 'ALIGNED', desc: 'Core requirements matched. Gaps are minor.' };
        return { color: '#ef4444', label: 'LOW MATCH', desc: 'Key gaps identified in experience.' };
    };

    const impact = getImpactLevel();

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center gap-5 overflow-hidden relative">

                {/* Circular Ring */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
                        <circle
                            cx="55" cy="55" r={radius} fill="none"
                            stroke={impact.color} strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <span className="text-2xl font-black tracking-tighter text-slate-900">
                            {displayScore}<span className="text-sm text-slate-500">%</span>
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: impact.color }} />
                        <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: impact.color }}>
                            {impact.label}
                        </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">Synthesis Complete</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{impact.desc}</p>
                </div>
            </div>

            {/* Impact Critique Insight Alert */}
            {impactCritique && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 flex gap-3 shadow-sm">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {impactCritique}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MatchScoreCard;
