import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { TEMPLATES } from './TemplateEngine';

const TemplateCard = ({ template, isSelected, onSelect }) => {
    const { name, subtitle, colors } = template;

    // Mini CV preview mockup per template
    const previews = {
        classic: (
            <div style={{ fontFamily: 'Georgia, serif', padding: '12px 14px', background: '#fff', height: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ height: '7px', background: '#000', borderRadius: '1px', width: '60%', margin: '0 auto 4px' }} />
                    <div style={{ height: '3px', background: '#94a3b8', borderRadius: '1px', width: '80%', margin: '0 auto 4px' }} />
                    <div style={{ borderBottom: '1.5px solid #000', marginTop: '6px' }} />
                </div>
                {['EXPERIENCE', 'EDUCATION', 'SKILLS'].map((s, i) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '5px', fontWeight: 700, letterSpacing: '1px', borderBottom: '0.5px solid #000', paddingBottom: '1px', marginBottom: '3px' }}>{s}</div>
                        <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '1px', marginBottom: '2px', width: '90%' }} />
                        <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '1px', marginBottom: '2px', width: '75%' }} />
                    </div>
                ))}
            </div>
        ),
        modern: (
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '10px 12px', background: '#fff', height: '100%' }}>
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ height: '8px', background: '#0f172a', borderRadius: '2px', width: '55%', marginBottom: '3px' }} />
                    <div style={{ height: '3px', background: '#e2e8f0', borderRadius: '1px', width: '75%', marginBottom: '4px' }} />
                    <div style={{ height: '2px', background: 'linear-gradient(90deg, #2563EB, #93c5fd, transparent)', borderRadius: '2px' }} />
                </div>
                <div style={{ background: '#f8fafc', borderLeft: '2px solid #2563EB', padding: '3px 5px', marginBottom: '6px', borderRadius: '0 3px 3px 0' }}>
                    <div style={{ height: '2.5px', background: '#cbd5e1', borderRadius: '1px', marginBottom: '1.5px' }} />
                    <div style={{ height: '2.5px', background: '#cbd5e1', borderRadius: '1px', width: '70%' }} />
                </div>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{ marginBottom: '5px', paddingLeft: '5px', borderLeft: '1.5px solid #e2e8f0' }}>
                        <div style={{ height: '3px', background: '#0f172a', borderRadius: '1px', width: '50%', marginBottom: '1.5px' }} />
                        <div style={{ height: '2.5px', background: '#2563EB', borderRadius: '1px', width: '35%', marginBottom: '2px', opacity: 0.7 }} />
                        <div style={{ height: '2px', background: '#e2e8f0', borderRadius: '1px', width: '85%' }} />
                    </div>
                ))}
            </div>
        ),
        executive: (
            <div style={{ fontFamily: 'Georgia, serif', background: '#fff', height: '100%' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '10px 12px', marginBottom: '0' }}>
                    <div style={{ height: '7px', background: '#fff', borderRadius: '1px', width: '60%', marginBottom: '3px', opacity: 0.9 }} />
                    <div style={{ height: '2px', background: '#f59e0b', borderRadius: '1px', width: '25%', marginBottom: '4px' }} />
                    <div style={{ height: '2.5px', background: '#475569', borderRadius: '1px', width: '80%' }} />
                </div>
                <div style={{ height: '2.5px', background: 'linear-gradient(90deg, #f59e0b, #fde68a)', marginBottom: '0' }} />
                <div style={{ padding: '6px 12px' }}>
                    <div style={{ borderLeft: '2px solid #f59e0b', paddingLeft: '5px', marginBottom: '6px' }}>
                        <div style={{ height: '2px', background: '#e2e8f0', marginBottom: '1.5px', width: '90%' }} />
                        <div style={{ height: '2px', background: '#e2e8f0', width: '70%' }} />
                    </div>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ marginBottom: '5px' }}>
                            <div style={{ background: '#f8fafc', padding: '3px 5px', borderRadius: '2px', marginBottom: '2px' }}>
                                <div style={{ height: '3px', background: '#0f172a', borderRadius: '1px', width: '45%', marginBottom: '1.5px' }} />
                                <div style={{ height: '2px', background: '#f59e0b', borderRadius: '1px', width: '35%', opacity: 0.8 }} />
                            </div>
                            <div style={{ height: '2px', background: '#e2e8f0', borderRadius: '1px', width: '85%', marginLeft: '8px' }} />
                        </div>
                    ))}
                </div>
            </div>
        ),
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template.id)}
            className="cursor-pointer"
        >
            <div className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-lg ${isSelected ? 'border-brand-primary shadow-brand-primary/20 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
                {/* Selected badge */}
                {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 z-20">
                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shadow-md">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                    </motion.div>
                )}

                {/* Template Thumbnail Preview */}
                <div className="h-52 bg-white relative overflow-hidden border-b border-slate-100">
                    <div style={{ transform: 'scale(0.48)', transformOrigin: 'top left', width: '208%', height: '208%', pointerEvents: 'none' }}>
                        {previews[template.id]}
                    </div>
                    {/* Subtle overlay at bottom to fade out the preview */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                </div>

                {/* Template Info */}
                <div className={`px-4 py-4 transition-colors ${isSelected ? 'bg-brand-primary/5' : 'bg-white'}`}>
                    {/* Colour swatches */}
                    <div className="flex gap-1.5 mb-3">
                        {colors.map((c, i) => (
                            <div key={i} style={{ background: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : 'none' }} className="w-4 h-4 rounded-full shadow-sm" />
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-bold text-base tracking-tight ${isSelected ? 'text-brand-primary' : 'text-slate-900'}`}>{name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-brand-primary' : 'text-slate-300'}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TemplatePicker = ({ onConfirm, onBack }) => {
    const [selected, setSelected] = useState('classic');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
                <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0">← Back</button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-primary" />
                        Choose Your Template
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Select a style — you can switch any time inside the builder</p>
                </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {Object.values(TEMPLATES).map(tmpl => (
                        <TemplateCard
                            key={tmpl.id}
                            template={tmpl}
                            isSelected={selected === tmpl.id}
                            onSelect={setSelected}
                        />
                    ))}
                </div>

                {/* Confirm CTA */}
                <div className="flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onConfirm(selected)}
                        className="inline-flex items-center gap-3 bg-brand-primary hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all text-base"
                    >
                        <span>Launch Builder with {TEMPLATES[selected]?.name} Template</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default TemplatePicker;
