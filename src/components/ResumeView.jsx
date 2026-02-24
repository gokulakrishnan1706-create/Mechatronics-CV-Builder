import React from 'react';

/* ─── Print-Optimized, A4-Perfect Resume Template ─── */
const ResumeView = React.forwardRef(({ resumeData }, ref) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;

    return (
        <div
            ref={ref}
            className="cv-document"
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                fontSize: '10pt',
                lineHeight: '1.45',
                /* Exact A4: 210mm x 297mm. At 96dpi = 794px x 1123px */
                width: '794px',
                minHeight: '1123px',
                padding: '48px 56px',
                boxSizing: 'border-box',
                color: '#1a1a1a',
                position: 'relative',
                backgroundColor: '#ffffff',
                /* Ensure crisp text rendering for screenshots */
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
            }}
        >
            {/* ═══ DOCUMENT HEADER ═══ */}
            <header className="cv-section" style={{ marginBottom: '18px', borderBottom: '2.5px solid #111', paddingBottom: '14px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h1 style={{
                    fontFamily: "'Georgia', 'Merriweather', serif",
                    fontSize: '26pt',
                    fontWeight: 900,
                    color: '#000',
                    margin: '0 0 6px 0',
                    lineHeight: '1.1',
                    letterSpacing: '-0.3px'
                }}>
                    {personal?.name || 'Untitled Document'}
                </h1>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '8.5pt',
                    color: '#444',
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    letterSpacing: '0.2px'
                }}>
                    {personal?.email && (
                        <a href={`mailto:${personal.email}`} style={{ color: '#111', textDecoration: 'none' }}>
                            {personal.email}
                        </a>
                    )}
                    {(personal?.email && personal?.phone) && <span style={{ color: '#bbb' }}>•</span>}
                    {personal?.phone && <span style={{ color: '#111' }}>{personal.phone}</span>}
                    {(personal?.phone && personal?.location) && <span style={{ color: '#bbb' }}>•</span>}
                    {personal?.location && <span style={{ color: '#111' }}>{personal.location}</span>}
                    {(personal?.location && personal?.linkedin) && <span style={{ color: '#bbb' }}>•</span>}
                    {personal?.linkedin && (
                        <a href={personal.linkedin} target="_blank" rel="noreferrer" style={{ color: '#111', textDecoration: 'none' }}>
                            LinkedIn
                        </a>
                    )}
                </div>
            </header>

            {/* ═══ STRATEGIC PROFILE ═══ */}
            {personal_profile && (
                <section className="cv-section" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <p style={{
                        margin: 0,
                        fontSize: '9.5pt',
                        lineHeight: '1.55',
                        color: '#222',
                        textAlign: 'justify'
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
                        <div key={idx} className="cv-entry" style={{ marginBottom: '14px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <h3 style={{ margin: 0, fontSize: '10.5pt', fontWeight: 700, color: '#000' }}>
                                    {job.company}
                                </h3>
                                <span style={{ fontSize: '9pt', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                                    {job.period}
                                </span>
                            </div>

                            <div style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#333', marginBottom: '5px' }}>
                                {job.role}
                            </div>

                            {job.context && (
                                <p style={{ margin: '0 0 5px 0', fontSize: '9pt', color: '#444', lineHeight: '1.45' }}>
                                    {job.context}
                                </p>
                            )}

                            {job.achievements && job.achievements.length > 0 && (
                                <ul style={{ margin: '3px 0 0 14px', padding: 0, color: '#222', listStyleType: 'disc' }}>
                                    {job.achievements.map((achieve, aIdx) => (
                                        <li key={aIdx} style={{ marginBottom: '3px', paddingLeft: '3px', textAlign: 'justify', lineHeight: '1.45', fontSize: '9.5pt' }}>
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
                        <div key={idx} className="cv-entry" style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 700, color: '#000' }}>
                                    {edu.institution}
                                </h3>
                                <span style={{ fontSize: '9pt', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                                    {edu.period}
                                </span>
                            </div>
                            <div style={{ fontSize: '9.5pt', color: '#222', fontStyle: 'italic', marginBottom: '3px' }}>
                                {edu.degree}
                            </div>
                            {edu.bullets && edu.bullets.length > 0 && (
                                <ul style={{ margin: '3px 0 0 14px', padding: 0, color: '#333', listStyleType: 'circle' }}>
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
                <section className="cv-section" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <SectionHeader>Technical Expertise</SectionHeader>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, auto) 1fr', gap: '6px 14px' }}>
                        {professional_qualifications.map((qual, idx) => (
                            <React.Fragment key={idx}>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {qual.category}
                                </div>
                                <div style={{ fontSize: '9.5pt', color: '#222' }}>
                                    {qual.skills}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ LEADERSHIP & EXTRA-CURRICULAR ═══ */}
            {extra_curricular && extra_curricular.length > 0 && (
                <section className="cv-section" style={{ marginBottom: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <SectionHeader>Leadership & Initiatives</SectionHeader>
                    {extra_curricular.map((ec, idx) => (
                        <div key={idx} className="cv-entry" style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                                <div style={{ fontSize: '9.5pt', color: '#111' }}>
                                    <span style={{ fontWeight: 700 }}>{ec.role}</span>
                                    {ec.organization && <span>, {ec.organization}</span>}
                                </div>
                                <span style={{ fontSize: '9pt', fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>
                                    {ec.period}
                                </span>
                            </div>
                            {ec.bullets && ec.bullets.length > 0 && (
                                <ul style={{ margin: '3px 0 0 14px', padding: 0, color: '#333', listStyleType: 'square' }}>
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

/* ─── Premium Executive Section Header ─── */

const SectionHeader = ({ children }) => (
    <h2 style={{
        margin: '0 0 10px 0',
        paddingBottom: '3px',
        borderBottom: '1px solid #bbb',
        fontFamily: "'Inter', sans-serif",
        fontSize: '10pt',
        fontWeight: 800,
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid'
    }}>
        {children}
    </h2>
);

export default ResumeView;
