import React, { useEffect, useState } from 'react';

const MatchScoreCard = ({ score }) => {
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
        if (score >= 80) return { color: '#06b6d4', label: 'OPTIMAL', desc: 'Strong alignment with role requirements' };
        if (score >= 60) return { color: '#8B5CF6', label: 'ALIGNED', desc: 'Core requirements matched. Gaps are minor.' };
        return { color: '#ef4444', label: 'LOW MATCH', desc: 'Key gaps identified in experience.' };
    };

    const impact = getImpactLevel();

    return (
        <div className="mb-5 relative">
            <div className="bg-[#0D0D0D] border border-[#222] rounded-xl p-5 flex items-center gap-5 overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: impact.color }} />

                {/* Circular Ring */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r={radius} fill="none" stroke="#1A1A1A" strokeWidth="5" />
                        <circle
                            cx="55" cy="55" r={radius} fill="none"
                            stroke={impact.color} strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ filter: `drop-shadow(0 0 8px ${impact.color}40)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <span className="text-2xl font-black tracking-tighter text-white">
                            {displayScore}<span className="text-sm opacity-40">%</span>
                        </span>
                    </div>
                    {/* Rotating dashed ring */}
                    <div className="absolute inset-[-6px] border border-dashed rounded-full animate-[spin_25s_linear_infinite] opacity-20 pointer-events-none" style={{ borderColor: impact.color }} />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: impact.color }} />
                        <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: impact.color }}>
                            {impact.label}
                        </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">Synthesis Complete</h3>
                    <p className="text-[11px] text-[#666] leading-relaxed">{impact.desc}</p>
                </div>
            </div>
        </div>
    );
};

export default MatchScoreCard;
