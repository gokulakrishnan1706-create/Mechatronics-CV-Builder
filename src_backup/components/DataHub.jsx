/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { User, Briefcase, Award, GraduationCap, Trophy, ChevronDown, Plus, Trash2, GripVertical, CheckCircle2, AlertCircle, Wand2, RefreshCw } from 'lucide-react';


// ═══ SECTION WRAPPER (Collapsible Accordion) ═══
const Section = ({ title, icon, children, isOpen, onToggle, itemCount, hasContent }) => (
    <div className="mb-4 relative group/section">
        <div className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${isOpen
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-transparent border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}>
            <button
                onClick={onToggle}
                className="w-full relative flex items-center justify-between p-4.5 sm:p-5 text-left active:scale-[0.99] transition-transform z-10 cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${isOpen || hasContent
                        ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-400'
                        }`}>
                        {React.cloneElement(icon, {
                            className: `h-5 w-5 ${isOpen || hasContent ? 'text-brand-primary' : 'text-slate-400'}`
                        })}
                    </div>
                    <div>
                        <h3 className={`font-bold tracking-tight transition-colors ${isOpen ? 'text-slate-900 text-base' : 'text-slate-700 text-sm'}`}>
                            {title}
                        </h3>
                        {itemCount !== undefined && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-widest">
                                {itemCount} {itemCount === 1 ? 'Entry' : 'Entries'}
                            </p>
                        )}
                        {!itemCount && !hasContent && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-widest">Optional</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasContent && !isOpen && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                    <div
                        className={`p-1.5 rounded-lg ${isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div>
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100">
                        {children}
                    </div>
                </div>
            )}
        </div>
    </div>
);

// ═══ INPUT FIELD (with focus glow) ═══
const InputField = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1.5 group/input">
        <label className="text-[11px] font-bold px-1 block text-slate-500 group-focus-within/input:text-brand-primary transition-colors uppercase tracking-wider">{label}</label>
        <div className="relative">
            <input
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || ''}
                className="w-full bg-white text-slate-900 text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all duration-200 outline-none placeholder-slate-400 font-medium shadow-sm"
            />
        </div>
    </div>
);

// ═══ TEXTAREA FIELD (with character counter) ═══
const TextAreaField = ({ label, value, onChange, rows = 3, maxChars = 500 }) => {
    const charCount = (value || '').length;
    const isWarning = charCount > maxChars * 0.8;
    const isOver = charCount > maxChars;

    return (
        <div className="space-y-1.5 group/input flex flex-col h-full">
            <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 group-focus-within/input:text-brand-primary transition-colors uppercase tracking-wider">{label}</label>
                <span className={`text-[10px] font-mono transition-colors ${isOver ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-500'}`}>
                    {charCount}/{maxChars}
                </span>
            </div>
            <textarea
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                rows={rows}
                className="w-full bg-white text-slate-900 text-sm resize-y min-h-[70px] border border-slate-300 rounded-lg px-3 py-2.5 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all duration-200 outline-none placeholder-slate-400 font-medium custom-scrollbar leading-relaxed shadow-sm"
            />
        </div>
    );
};

// ═══ BULLET ITEM (individual bullet with delete) ═══
const BulletItem = ({ index, value, onChange, onDelete }) => (
    <div
        className="flex items-start gap-2 group/bullet"
    >
        <div className="flex items-center gap-1 mt-3 shrink-0">
            <GripVertical className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors cursor-grab" />
            <span className="text-[10px] font-mono text-slate-500 w-4 text-right">{index + 1}.</span>
        </div>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={2}
            className="w-full bg-white text-slate-900 text-sm resize-y leading-relaxed flex-1 border border-slate-300 rounded-lg px-3 py-2.5 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all duration-200 outline-none custom-scrollbar shadow-sm"
        />
        <button
            onClick={onDelete}
            className="mt-2.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/bullet:opacity-100 shrink-0 cursor-pointer"
            title="Remove bullet"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    </div>
);

// ═══ ADD BUTTON ═══
const AddButton = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-300 hover:border-brand-primary/40 text-slate-500 hover:text-brand-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 hover:bg-brand-primary/5 active:scale-[0.98] group cursor-pointer"
    >
        <div className="bg-slate-50 p-1 rounded-md group-hover:bg-brand-primary/10 transition-colors">
            <Plus className="h-3.5 w-3.5" />
        </div>
        {label}
    </button>
);

// ═══ ENTRY CARD (wrapper for each experience/education/etc entry) ═══
const EntryCard = ({ index, onDelete, children }) => (
    <div
        className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4 relative group/card hover:border-slate-300 hover:shadow-md transition-all duration-300"
    >
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 group-hover/card:bg-slate-100 transition-colors">#{index + 1}</span>
            <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/card:opacity-100 border border-transparent hover:border-rose-200 cursor-pointer"
                title="Remove entry"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
        <div className="relative z-0 space-y-4">
            {children}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════
// MAIN DATAHUB COMPONENT
// ═══════════════════════════════════════════════════
const DataHub = ({ data, onUpdate }) => {
    const [openSection, setOpenSection] = React.useState('personal');
    const toggleSection = (s) => setOpenSection(openSection === s ? null : s);

    // --- Helper: update a specific field in an array entry ---
    const updateArrayField = (arrayKey, index, field, value) => {
        const updated = [...data[arrayKey]];
        updated[index] = { ...updated[index], [field]: value };
        onUpdate(arrayKey, updated);
    };

    // --- Helper: update a bullet/achievement in an array entry ---
    const updateBullet = (arrayKey, entryIndex, bulletKey, bulletIndex, value) => {
        const updated = [...data[arrayKey]];
        const bullets = [...updated[entryIndex][bulletKey]];
        bullets[bulletIndex] = value;
        updated[entryIndex] = { ...updated[entryIndex], [bulletKey]: bullets };
        onUpdate(arrayKey, updated);
    };

    // --- Helper: add a bullet to an array entry ---
    const addBullet = (arrayKey, entryIndex, bulletKey) => {
        const updated = [...data[arrayKey]];
        const bullets = [...(updated[entryIndex][bulletKey] || []), ''];
        updated[entryIndex] = { ...updated[entryIndex], [bulletKey]: bullets };
        onUpdate(arrayKey, updated);
    };

    // --- Helper: delete a bullet from an array entry ---
    const deleteBullet = (arrayKey, entryIndex, bulletKey, bulletIndex) => {
        const updated = [...data[arrayKey]];
        const bullets = [...updated[entryIndex][bulletKey]];
        bullets.splice(bulletIndex, 1);
        updated[entryIndex] = { ...updated[entryIndex], [bulletKey]: bullets };
        onUpdate(arrayKey, updated);
    };

    // --- Helper: delete an entire entry from an array ---
    const deleteEntry = (arrayKey, index) => {
        const updated = [...data[arrayKey]];
        updated.splice(index, 1);
        onUpdate(arrayKey, updated);
    };

    // --- Helper: add a new entry to an array ---
    const addWorkExperience = () => {
        const updated = [...(data.work_experience || []), { role: '', company: '', period: '', context: '', achievements: [''] }];
        onUpdate('work_experience', updated);
    };

    const addEducation = () => {
        const updated = [...(data.education || []), { degree: '', institution: '', period: '', bullets: [''] }];
        onUpdate('education', updated);
    };

    const addQualification = () => {
        const updated = [...(data.professional_qualifications || []), { category: '', skills: '' }];
        onUpdate('professional_qualifications', updated);
    };

    const addExtraCurricular = () => {
        const updated = [...(data.extra_curricular || []), { role: '', organization: '', period: '', bullets: [''] }];
        onUpdate('extra_curricular', updated);
    };

    // Section content checks
    const hasPersonal = !!(data.personal?.name || data.personal?.email);
    const hasExperience = data.work_experience?.length > 0;
    const hasEducation = data.education?.length > 0;
    const hasSkills = data.professional_qualifications?.length > 0;
    const hasExtra = data.extra_curricular?.length > 0;

    return (
        <div className="space-y-2">
            <div className="mb-5 px-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Document Structure</h3>
                <p className="text-[11px] text-slate-500 mt-1">Edit fields, add entries, and manage your CV content</p>
            </div>

            {/* ═══ PERSONAL ═══ */}
            <Section title="Personal Information" icon={<User />} isOpen={openSection === 'personal'} onToggle={() => toggleSection('personal')} hasContent={hasPersonal}>
                <InputField label="Full Name" value={data.personal?.name} onChange={v => onUpdate('personal.name', v)} placeholder="John Doe" />
                <InputField label="Location" value={data.personal?.location} onChange={v => onUpdate('personal.location', v)} placeholder="London, UK" />
                <div className="grid grid-cols-2 gap-3">
                    <InputField label="Phone" value={data.personal?.phone} onChange={v => onUpdate('personal.phone', v)} placeholder="+44 7xxx xxx" />
                    <InputField label="Email" value={data.personal?.email} onChange={v => onUpdate('personal.email', v)} placeholder="you@email.com" />
                </div>
                <InputField label="LinkedIn URL" value={data.personal?.linkedin} onChange={v => onUpdate('personal.linkedin', v)} placeholder="https://linkedin.com/in/..." />
                <TextAreaField label="Professional Summary" value={data.personal_profile} onChange={v => onUpdate('personal_profile', v)} rows={4} maxChars={600} />
            </Section>

            {/* ═══ WORK EXPERIENCE ═══ */}
            <Section title="Work Experience" icon={<Briefcase />} isOpen={openSection === 'experience'} onToggle={() => toggleSection('experience')} itemCount={data.work_experience?.length} hasContent={hasExperience}>
                {data.work_experience?.map((job, idx) => (
                    <EntryCard key={idx} index={idx} onDelete={() => deleteEntry('work_experience', idx)}>
                        <InputField label="Job Title" value={job.role} onChange={v => updateArrayField('work_experience', idx, 'role', v)} />
                        <InputField label="Company" value={job.company} onChange={v => updateArrayField('work_experience', idx, 'company', v)} />
                        <InputField label="Period" value={job.period} onChange={v => updateArrayField('work_experience', idx, 'period', v)} placeholder="Jan 2022 – Present" />
                        <TextAreaField label="Context" value={job.context} onChange={v => updateArrayField('work_experience', idx, 'context', v)} rows={2} maxChars={300} />

                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="text-[11px] font-medium px-1 block text-slate-500">Key Achievements</label>
                            {job.achievements?.map((a, ai) => (
                                <BulletItem
                                    key={ai}
                                    index={ai}
                                    value={a}
                                    onChange={v => updateBullet('work_experience', idx, 'achievements', ai, v)}
                                    onDelete={() => deleteBullet('work_experience', idx, 'achievements', ai)}
                                />
                            ))}
                            <AddButton onClick={() => addBullet('work_experience', idx, 'achievements')} label="Add Achievement" />
                        </div>
                    </EntryCard>
                ))}
                {(!data.work_experience || data.work_experience.length === 0) && (
                    <div className="py-8 text-center">
                        <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No work experience added yet</p>
                    </div>
                )}
                <AddButton onClick={addWorkExperience} label="Add Work Experience" />
            </Section>

            {/* ═══ EDUCATION ═══ */}
            <Section title="Education" icon={<GraduationCap />} isOpen={openSection === 'education'} onToggle={() => toggleSection('education')} itemCount={data.education?.length} hasContent={hasEducation}>
                {data.education?.map((edu, idx) => (
                    <EntryCard key={idx} index={idx} onDelete={() => deleteEntry('education', idx)}>
                        <InputField label="Degree / Qualification" value={edu.degree} onChange={v => updateArrayField('education', idx, 'degree', v)} />
                        <InputField label="Institution" value={edu.institution} onChange={v => updateArrayField('education', idx, 'institution', v)} />
                        <InputField label="Period" value={edu.period} onChange={v => updateArrayField('education', idx, 'period', v)} placeholder="Sept 2020 – Jun 2024" />

                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="text-[11px] font-medium px-1 block text-slate-500">Highlights</label>
                            {edu.bullets?.map((b, bi) => (
                                <BulletItem
                                    key={bi}
                                    index={bi}
                                    value={b}
                                    onChange={v => updateBullet('education', idx, 'bullets', bi, v)}
                                    onDelete={() => deleteBullet('education', idx, 'bullets', bi)}
                                />
                            ))}
                            <AddButton onClick={() => addBullet('education', idx, 'bullets')} label="Add Highlight" />
                        </div>
                    </EntryCard>
                ))}
                {(!data.education || data.education.length === 0) && (
                    <div className="py-8 text-center">
                        <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No education entries yet</p>
                    </div>
                )}
                <AddButton onClick={addEducation} label="Add Education" />
            </Section>

            {/* ═══ SKILLS ═══ */}
            <Section title="Skills & Technologies" icon={<Award />} isOpen={openSection === 'qualifications'} onToggle={() => toggleSection('qualifications')} itemCount={data.professional_qualifications?.length} hasContent={hasSkills}>
                {data.professional_qualifications?.map((q, idx) => (
                    <EntryCard key={idx} index={idx} onDelete={() => deleteEntry('professional_qualifications', idx)}>
                        <InputField label="Category" value={q.category} onChange={v => updateArrayField('professional_qualifications', idx, 'category', v)} placeholder="e.g. Programming Languages" />
                        <TextAreaField label="Skills (comma separated)" value={q.skills} onChange={v => updateArrayField('professional_qualifications', idx, 'skills', v)} rows={2} maxChars={300} />
                    </EntryCard>
                ))}
                {(!data.professional_qualifications || data.professional_qualifications.length === 0) && (
                    <div className="py-8 text-center">
                        <Award className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No skills categories yet</p>
                    </div>
                )}
                <AddButton onClick={addQualification} label="Add Skill Category" />
            </Section>

            {/* ═══ LEADERSHIP ═══ */}
            <Section title="Leadership & Activities" icon={<Trophy />} isOpen={openSection === 'extra'} onToggle={() => toggleSection('extra')} itemCount={data.extra_curricular?.length} hasContent={hasExtra}>
                {data.extra_curricular?.map((ec, idx) => (
                    <EntryCard key={idx} index={idx} onDelete={() => deleteEntry('extra_curricular', idx)}>
                        <InputField label="Role / Title" value={ec.role} onChange={v => updateArrayField('extra_curricular', idx, 'role', v)} />
                        <InputField label="Organization" value={ec.organization} onChange={v => updateArrayField('extra_curricular', idx, 'organization', v)} />
                        <InputField label="Period" value={ec.period} onChange={v => updateArrayField('extra_curricular', idx, 'period', v)} />

                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="text-[11px] font-medium px-1 block text-slate-500">Bullet Points</label>
                            {ec.bullets?.map((b, bi) => (
                                <BulletItem
                                    key={bi}
                                    index={bi}
                                    value={b}
                                    onChange={v => updateBullet('extra_curricular', idx, 'bullets', bi, v)}
                                    onDelete={() => deleteBullet('extra_curricular', idx, 'bullets', bi)}
                                />
                            ))}
                            <AddButton onClick={() => addBullet('extra_curricular', idx, 'bullets')} label="Add Bullet" />
                        </div>
                    </EntryCard>
                ))}
                {(!data.extra_curricular || data.extra_curricular.length === 0) && (
                    <div className="py-8 text-center">
                        <Trophy className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No activities yet</p>
                    </div>
                )}
                <AddButton onClick={addExtraCurricular} label="Add Activity" />
            </Section>
        </div>
    );
};

export default DataHub;
