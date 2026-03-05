import React from 'react';

/* ─── Harvard Business School / Top-Tier Executive Resume Template ─── */
const ResumeView = React.forwardRef(({ resumeData }, ref) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;

    return (
        <div
            ref={ref}
            className="cv-document"
            style={{
                fontFamily: "'Georgia', 'Garamond', 'Times New Roman', serif",
                fontSize: '10pt',
                lineHeight: '1.4',
                width: '794px',
                minHeight: '1123px',
                padding: '50px 60px',
                boxSizing: 'border-box',
                color: '#0f172a',
                position: 'relative',
                backgroundColor: '#ffffff',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
            }}
        >
            {/* ═══ DOCUMENT HEADER ═══ */}
            <header style={{ marginBottom: '14px', textAlign: 'center', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h1 style={{
                    fontFamily: "'Georgia', 'Garamond', serif",
                    fontSize: '24pt',
                    fontWeight: 700,
                    color: '#000',
                    margin: '0 0 6px 0',
                    lineHeight: '1.15',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}>
                    {personal?.name || 'Untitled Document'}
                </h1>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0',
                    fontSize: '9pt',
                    color: '#334155',
                    fontFamily: "'Georgia', serif",
                    lineHeight: '1.5',
                }}>
                    {[
                        personal?.email && (
                            <a key="email" href={`mailto:${personal.email}`} style={{ color: '#334155', textDecoration: 'none' }}>
                                {personal.email}
                            </a>
                        ),
                        personal?.phone && <span key="phone">{personal.phone}</span>,
                        personal?.location && <span key="location">{personal.location}</span>,
                        personal?.linkedin && (
                            <a key="linkedin" href={personal.linkedin} target="_blank" rel="noreferrer" style={{ color: '#334155', textDecoration: 'none' }}>
                                LinkedIn
                            </a>
                        ),
                    ].filter(Boolean).reduce((acc, el, i, arr) => {
                        acc.push(el);
                        if (i < arr.length - 1) {
                            acc.push(<span key={`sep-${i}`} style={{ margin: '0 8px', color: '#94a3b8' }}>|</span>);
                        }
                        return acc;
                    }, [])}
                </div>

                {/* Thick header rule */}
                <div style={{ borderBottom: '2px solid #000', marginTop: '12px' }} />
            </header>

            {/* ═══ PROFESSIONAL SUMMARY ═══ */}
            {personal_profile && (
                <section style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <p style={{
                        margin: 0,
                        fontSize: '9.5pt',
                        lineHeight: '1.5',
                        color: '#1e293b',
                        textAlign: 'justify',
                    }}>
                        {personal_profile}
                    </p>
                </section>
            )}

            {/* ═══ PROFESSIONAL EXPERIENCE ═══ */}
            {work_experience && work_experience.length > 0 && (
                <section style={{ marginBottom: '16px' }}>
                    <SectionHeader>Experience</SectionHeader>
                    {work_experience.map((job, idx) => (
                        <div key={idx} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            {/* Row 1: Company (bold) — Dates */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: '#000' }}>
                                    {job.company}
                                </h3>
                                <span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap', fontWeight: 400 }}>
                                    {job.period}
                                </span>
                            </div>

                            {/* Row 2: Role (italic) */}
                            <div style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#334155', marginBottom: '4px' }}>
                                {job.role}
                            </div>

                            {/* Context paragraph */}
                            {job.context && (
                                <p style={{ margin: '0 0 4px 0', fontSize: '9pt', color: '#475569', lineHeight: '1.45', textAlign: 'justify' }}>
                                    {job.context}
                                </p>
                            )}

                            {/* Bullet points */}
                            {job.achievements && job.achievements.length > 0 && (
                                <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>
                                    {job.achievements.map((achieve, aIdx) => (
                                        <li key={aIdx} style={{ marginBottom: '2px', paddingLeft: '2px', textAlign: 'justify', lineHeight: '1.45', fontSize: '9.5pt' }}>
                                            {achieve}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ═══ EDUCATION ═══ */}
            {education && education.length > 0 && (
                <section style={{ marginBottom: '16px' }}>
                    <SectionHeader>Education</SectionHeader>
                    {education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: '#000' }}>
                                    {edu.institution}
                                </h3>
                                <span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap', fontWeight: 400 }}>
                                    {edu.period}
                                </span>
                            </div>
                            <div style={{ fontSize: '9.5pt', color: '#334155', fontStyle: 'italic', marginBottom: '3px' }}>
                                {edu.degree}
                            </div>
                            {edu.bullets && edu.bullets.length > 0 && (
                                <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>
                                    {edu.bullets.map((b, bi) => (
                                        <li key={bi} style={{ marginBottom: '2px', textAlign: 'justify', fontSize: '9pt', lineHeight: '1.45' }} dangerouslySetInnerHTML={{ __html: b }} />
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ═══ TECHNICAL SKILLS / QUALIFICATIONS ═══ */}
            {professional_qualifications && professional_qualifications.length > 0 && (
                <section style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <SectionHeader>Technical Expertise</SectionHeader>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '4px 16px' }}>
                        {professional_qualifications.map((qual, idx) => (
                            <React.Fragment key={idx}>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                    {qual.category}
                                </div>
                                <div style={{ fontSize: '9.5pt', color: '#1e293b' }}>
                                    {qual.skills}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ LEADERSHIP & EXTRA-CURRICULAR ═══ */}
            {extra_curricular && extra_curricular.length > 0 && (
                <section style={{ marginBottom: '16px' }}>
                    <SectionHeader>Leadership & Initiatives</SectionHeader>
                    {extra_curricular.map((ec, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <div style={{ fontSize: '9.5pt', color: '#0f172a' }}>
                                    <span style={{ fontWeight: 700 }}>{ec.role}</span>
                                    {ec.organization && <span style={{ fontStyle: 'italic' }}>, {ec.organization}</span>}
                                </div>
                                <span style={{ fontSize: '9pt', color: '#334155', whiteSpace: 'nowrap', fontWeight: 400 }}>
                                    {ec.period}
                                </span>
                            </div>
                            {ec.bullets && ec.bullets.length > 0 && (
                                <ul style={{ margin: '2px 0 0 16px', padding: 0, color: '#1e293b', listStyleType: 'disc' }}>
                                    {ec.bullets.map((b, bi) => (
                                        <li key={bi} style={{ marginBottom: '2px', fontSize: '9pt', lineHeight: '1.45' }}>{b}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}

        </div>
    );
});

ResumeView.displayName = 'ResumeView';

/* ─── Harvard-Standard Section Header ─── */
const SectionHeader = ({ children }) => (
    <h2 style={{
        margin: '4px 0 8px 0',
        paddingBottom: '3px',
        borderBottom: '1px solid #000',
        fontFamily: "'Georgia', serif",
        fontSize: '10.5pt',
        fontWeight: 700,
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
    }}>
        {children}
    </h2>
);

export default ResumeView;
