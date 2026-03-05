import React from 'react';

// ═══════════════════════════════════════════════
// TEMPLATE 1: CLASSIC (Harvard Executive Style)
// ═══════════════════════════════════════════════
export const ClassicTemplate = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <div className="cv-document" style={{ fontFamily: "'Georgia','Garamond','Times New Roman',serif", fontSize: '10pt', lineHeight: '1.4', width: '794px', minHeight: '1123px', padding: '50px 60px', boxSizing: 'border-box', color: '#0f172a', backgroundColor: '#ffffff', WebkitFontSmoothing: 'antialiased' }}>
            <header style={{ marginBottom: '14px', textAlign: 'center', pageBreakInside: 'avoid' }}>
                <h1 style={{ fontFamily: "'Georgia',serif", fontSize: '24pt', fontWeight: 700, color: '#000', margin: '0 0 6px 0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{personal?.name || 'Untitled'}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0', fontSize: '9pt', color: '#334155', lineHeight: '1.5' }}>
                    {[
                        personal?.email && <a key="email" href={`mailto:${personal.email}`} style={{ color: '#334155', textDecoration: 'none' }}>{personal.email}</a>,
                        personal?.phone && <span key="phone">{personal.phone}</span>,
                        personal?.location && <span key="location">{personal.location}</span>,
                        personal?.linkedin && <a key="linkedin" href={personal.linkedin} target="_blank" rel="noreferrer" style={{ color: '#334155', textDecoration: 'none' }}>LinkedIn</a>,
                    ].filter(Boolean).reduce((acc, el, i, arr) => { acc.push(el); if (i < arr.length - 1) acc.push(<span key={`s${i}`} style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>); return acc; }, [])}
                </div>
                <div style={{ borderBottom: '2px solid #000', marginTop: '12px' }} />
            </header>
            {personal_profile && <section style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}><p style={{ margin: 0, fontSize: '9.5pt', lineHeight: '1.5', color: '#1e293b', textAlign: 'justify' }}>{personal_profile}</p></section>}
            {work_experience?.length > 0 && <section style={{ marginBottom: '16px' }}><ClassicSectionHeader>Experience</ClassicSectionHeader>{work_experience.map((job, i) => (<div key={i} style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: '#000' }}>{job.company}</h3><span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap' }}>{job.period}</span></div><div style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#334155', marginBottom: '4px' }}>{job.role}</div>{job.context && <p style={{ margin: '0 0 4px 0', fontSize: '9pt', color: '#475569', lineHeight: '1.45', textAlign: 'justify' }}>{job.context}</p>}{job.achievements?.length > 0 && <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>{job.achievements.map((a, ai) => <li key={ai} style={{ marginBottom: '2px', paddingLeft: '2px', textAlign: 'justify', lineHeight: '1.45', fontSize: '9.5pt' }}>{a}</li>)}</ul>}</div>))}</section>}
            {education?.length > 0 && <section style={{ marginBottom: '16px' }}><ClassicSectionHeader>Education</ClassicSectionHeader>{education.map((edu, i) => (<div key={i} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: '#000' }}>{edu.institution}</h3><span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap' }}>{edu.period}</span></div><div style={{ fontSize: '9.5pt', color: '#334155', fontStyle: 'italic', marginBottom: '3px' }}>{edu.degree}</div>{edu.bullets?.length > 0 && <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>{edu.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '2px', textAlign: 'justify', fontSize: '9pt', lineHeight: '1.45' }} dangerouslySetInnerHTML={{ __html: b }} />)}</ul>}</div>))}</section>}
            {professional_qualifications?.length > 0 && <section style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}><ClassicSectionHeader>Technical Expertise</ClassicSectionHeader><div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px,auto) 1fr', gap: '4px 16px' }}>{professional_qualifications.map((q, i) => (<React.Fragment key={i}><div style={{ fontSize: '9pt', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{q.category}</div><div style={{ fontSize: '9.5pt', color: '#1e293b' }}>{q.skills}</div></React.Fragment>))}</div></section>}
            {extra_curricular?.length > 0 && <section style={{ marginBottom: '16px' }}><ClassicSectionHeader>Leadership & Initiatives</ClassicSectionHeader>{extra_curricular.map((ec, i) => (<div key={i} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div style={{ fontSize: '9.5pt', color: '#0f172a' }}><span style={{ fontWeight: 700 }}>{ec.role}</span>{ec.organization && <span style={{ fontStyle: 'italic' }}>, {ec.organization}</span>}</div><span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap' }}>{ec.period}</span></div>{ec.bullets?.length > 0 && <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>{ec.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '2px', fontSize: '9pt', lineHeight: '1.45' }}>{b}</li>)}</ul>}</div>))}</section>}
        </div>
    );
};
const ClassicSectionHeader = ({ children }) => (
    <h2 style={{ margin: '4px 0 8px 0', paddingBottom: '3px', borderBottom: '1px solid #000', fontFamily: "'Georgia',serif", fontSize: '10.5pt', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '2px', pageBreakAfter: 'avoid' }}>{children}</h2>
);

// ═══════════════════════════════════════════════
// TEMPLATE 2: MODERN (Clean sans-serif, blue accents)
// ═══════════════════════════════════════════════
export const ModernTemplate = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    const accent = '#2563EB';
    return (
        <div className="cv-document" style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", fontSize: '10pt', lineHeight: '1.5', width: '794px', minHeight: '1123px', padding: '48px 56px', boxSizing: 'border-box', color: '#1e293b', backgroundColor: '#ffffff' }}>
            {/* Header */}
            <header style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: '26pt', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{personal?.name || 'Untitled'}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '8.5pt', color: '#64748b', marginBottom: '16px' }}>
                    {personal?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉ {personal.email}</span>}
                    {personal?.phone && <span>📱 {personal.phone}</span>}
                    {personal?.location && <span>📍 {personal.location}</span>}
                    {personal?.linkedin && <a href={personal.linkedin} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'none' }}>🔗 LinkedIn</a>}
                </div>
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${accent}, #93c5fd, transparent)`, borderRadius: '2px' }} />
            </header>
            {personal_profile && <section style={{ marginBottom: '20px', background: '#f8fafc', borderRadius: '8px', padding: '14px 16px', borderLeft: `3px solid ${accent}` }}><p style={{ margin: 0, fontSize: '9.5pt', lineHeight: '1.6', color: '#334155' }}>{personal_profile}</p></section>}
            {work_experience?.length > 0 && <section style={{ marginBottom: '20px' }}><ModernSectionHeader accent={accent}>Experience</ModernSectionHeader>{work_experience.map((job, i) => (<div key={i} style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}><div><h3 style={{ margin: 0, fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{job.role}</h3><div style={{ fontSize: '9pt', color: accent, fontWeight: 600 }}>{job.company}</div></div><span style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap', background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px', marginTop: '2px' }}>{job.period}</span></div>{job.context && <p style={{ margin: '4px 0', fontSize: '9pt', color: '#475569', lineHeight: '1.45' }}>{job.context}</p>}{job.achievements?.length > 0 && <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#334155' }}>{job.achievements.map((a, ai) => <li key={ai} style={{ marginBottom: '3px', lineHeight: '1.45', fontSize: '9.5pt' }}>{a}</li>)}</ul>}</div>))}</section>}
            {education?.length > 0 && <section style={{ marginBottom: '20px' }}><ModernSectionHeader accent={accent}>Education</ModernSectionHeader>{education.map((edu, i) => (<div key={i} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><h3 style={{ margin: 0, fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{edu.institution}</h3><div style={{ fontSize: '9pt', color: accent, fontWeight: 600, marginBottom: '4px' }}>{edu.degree}</div></div><span style={{ fontSize: '8.5pt', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{edu.period}</span></div>{edu.bullets?.length > 0 && <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#334155' }}>{edu.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '3px', fontSize: '9pt', lineHeight: '1.45' }} dangerouslySetInnerHTML={{ __html: b }} />)}</ul>}</div>))}</section>}
            {professional_qualifications?.length > 0 && <section style={{ marginBottom: '20px' }}><ModernSectionHeader accent={accent}>Skills</ModernSectionHeader><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>{professional_qualifications.map((q, i) => (<div key={i} style={{ background: '#f8fafc', borderRadius: '6px', padding: '8px 12px', border: '1px solid #e2e8f0' }}><div style={{ fontSize: '8pt', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{q.category}</div><div style={{ fontSize: '8.5pt', color: '#475569', lineHeight: '1.4' }}>{q.skills}</div></div>))}</div></section>}
            {extra_curricular?.length > 0 && <section style={{ marginBottom: '20px' }}><ModernSectionHeader accent={accent}>Leadership</ModernSectionHeader>{extra_curricular.map((ec, i) => (<div key={i} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div><span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{ec.role}</span>{ec.organization && <span style={{ fontSize: '9pt', color: '#64748b' }}> · {ec.organization}</span>}</div><span style={{ fontSize: '8.5pt', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{ec.period}</span></div>{ec.bullets?.length > 0 && <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#334155' }}>{ec.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '3px', fontSize: '9pt', lineHeight: '1.45' }}>{b}</li>)}</ul>}</div>))}</section>}
        </div>
    );
};
const ModernSectionHeader = ({ children, accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '4px' }}>
        <h2 style={{ margin: 0, fontSize: '11pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{children}</h2>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
    </div>
);

// ═══════════════════════════════════════════════
// TEMPLATE 3: EXECUTIVE (Dark header, premium)
// ═══════════════════════════════════════════════
export const ExecutiveTemplate = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <div className="cv-document" style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: '10pt', lineHeight: '1.45', width: '794px', minHeight: '1123px', boxSizing: 'border-box', color: '#1a1a2e', backgroundColor: '#ffffff' }}>
            {/* Dark Header Band */}
            <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '36px 56px 28px', marginBottom: '0', pageBreakInside: 'avoid' }}>
                <h1 style={{ fontFamily: "'Georgia',serif", fontSize: '26pt', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>{personal?.name || 'Untitled'}</h1>
                <div style={{ width: '48px', height: '2px', background: '#f59e0b', marginBottom: '12px', borderRadius: '1px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', fontSize: '8.5pt', color: '#94a3b8' }}>
                    {[
                        personal?.email && <span key="e">{personal.email}</span>,
                        personal?.phone && <span key="p">{personal.phone}</span>,
                        personal?.location && <span key="l">{personal.location}</span>,
                        personal?.linkedin && <a key="li" href={personal.linkedin} target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'none' }}>LinkedIn</a>,
                    ].filter(Boolean).reduce((acc, el, i, arr) => { acc.push(el); if (i < arr.length - 1) acc.push(<span key={`s${i}`} style={{ margin: '0 10px', color: '#475569' }}>·</span>); return acc; }, [])}
                </div>
            </header>
            {/* Gold accent bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)', marginBottom: '0' }} />
            <div style={{ padding: '28px 56px' }}>
                {personal_profile && <section style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}><p style={{ margin: 0, fontSize: '9.5pt', lineHeight: '1.6', color: '#334155', fontStyle: 'italic', borderLeft: '3px solid #f59e0b', paddingLeft: '14px' }}>{personal_profile}</p></section>}
                {work_experience?.length > 0 && <section style={{ marginBottom: '20px' }}><ExecSectionHeader>Professional Experience</ExecSectionHeader>{work_experience.map((job, i) => (<div key={i} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: '#f8fafc', padding: '8px 12px', borderRadius: '4px', marginBottom: '4px' }}><div><h3 style={{ margin: 0, fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{job.company}</h3><div style={{ fontSize: '9pt', color: '#f59e0b', fontWeight: 600, fontStyle: 'italic' }}>{job.role}</div></div><span style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap', fontFamily: "'Georgia',serif" }}>{job.period}</span></div>{job.context && <p style={{ margin: '4px 0', fontSize: '9pt', color: '#475569', lineHeight: '1.45', paddingLeft: '12px' }}>{job.context}</p>}{job.achievements?.length > 0 && <ul style={{ margin: '4px 0 0 28px', padding: 0, color: '#334155' }}>{job.achievements.map((a, ai) => <li key={ai} style={{ marginBottom: '3px', lineHeight: '1.45', fontSize: '9.5pt' }}>{a}</li>)}</ul>}</div>))}</section>}
                {education?.length > 0 && <section style={{ marginBottom: '20px' }}><ExecSectionHeader>Education</ExecSectionHeader>{education.map((edu, i) => (<div key={i} style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h3 style={{ margin: 0, fontSize: '10.5pt', fontWeight: 700, color: '#0f172a' }}>{edu.institution}</h3><span style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap' }}>{edu.period}</span></div><div style={{ fontSize: '9pt', color: '#f59e0b', fontStyle: 'italic', marginBottom: '4px' }}>{edu.degree}</div>{edu.bullets?.length > 0 && <ul style={{ margin: '4px 0 0 20px', padding: 0, color: '#334155' }}>{edu.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '3px', fontSize: '9pt', lineHeight: '1.45' }} dangerouslySetInnerHTML={{ __html: b }} />)}</ul>}</div>))}</section>}
                {professional_qualifications?.length > 0 && <section style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}><ExecSectionHeader>Core Competencies</ExecSectionHeader><div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,auto) 1fr', gap: '5px 20px' }}>{professional_qualifications.map((q, i) => (<React.Fragment key={i}><div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid #f59e0b', paddingRight: '12px' }}>{q.category}</div><div style={{ fontSize: '9pt', color: '#334155' }}>{q.skills}</div></React.Fragment>))}</div></section>}
                {extra_curricular?.length > 0 && <section style={{ marginBottom: '20px' }}><ExecSectionHeader>Leadership & Affiliations</ExecSectionHeader>{extra_curricular.map((ec, i) => (<div key={i} style={{ marginBottom: '10px', pageBreakInside: 'avoid' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><div><span style={{ fontWeight: 700, fontSize: '10pt' }}>{ec.role}</span>{ec.organization && <span style={{ fontSize: '9pt', color: '#64748b', fontStyle: 'italic' }}> — {ec.organization}</span>}</div><span style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'nowrap' }}>{ec.period}</span></div>{ec.bullets?.length > 0 && <ul style={{ margin: '4px 0 0 20px', padding: 0, color: '#334155' }}>{ec.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '3px', fontSize: '9pt', lineHeight: '1.45' }}>{b}</li>)}</ul>}</div>))}</section>}
            </div>
        </div>
    );
};
const ExecSectionHeader = ({ children }) => (
    <div style={{ marginBottom: '10px', marginTop: '4px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '10pt', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Georgia',serif" }}>{children}</h2>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
    </div>
);

// ═══════════════════════════════════════════════
// TEMPLATE REGISTRY
// ═══════════════════════════════════════════════
export const TEMPLATES = {
    classic: { id: 'classic', name: 'Classic', subtitle: 'Harvard Executive', component: ClassicTemplate, colors: ['#000000', '#1e293b', '#64748b'], accent: '#000' },
    modern:  { id: 'modern',  name: 'Modern',  subtitle: 'Clean & Minimal',   component: ModernTemplate,   colors: ['#2563EB', '#f8fafc', '#e2e8f0'], accent: '#2563EB' },
    executive: { id: 'executive', name: 'Executive', subtitle: 'Premium Dark Header', component: ExecutiveTemplate, colors: ['#0f172a', '#f59e0b', '#ffffff'], accent: '#f59e0b' },
};

export const ResumeView = ({ resumeData, template = 'classic' }) => {
    const T = TEMPLATES[template]?.component || ClassicTemplate;
    return <T resumeData={resumeData} />;
};

export default ResumeView;
