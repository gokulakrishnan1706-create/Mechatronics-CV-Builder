// ============================================================
// PDF DOCUMENT DEFINITION GENERATOR
// Harvard Business School / Top-Tier Executive Standard
// Pure data — no pdfMake import. pdfMake is loaded dynamically
// in BuilderWorkspace.jsx to avoid Vite ESM deadlock.
// ============================================================

const LAYOUT = {
    PAGE_MARGIN: [45, 45, 45, 45],
    NAME_SIZE: 22,
    CONTACT_SIZE: 8.5,
    SECTION_HEADER_SIZE: 10,
    BODY_SIZE: 9,
    ENTRY_TITLE_SIZE: 9.5,
    ROLE_SIZE: 8.5,
    BULLET_SIZE: 8.5,
    LINE_HEIGHT: 1.4,
    SECTION_GAP: 14,
    ENTRY_GAP: 10,
    BULLET_GAP: 2,
};

const normalize = (resumeData) => {
    const d = { ...resumeData };
    d.personal = d.personal || {};

    if (d.work_experience) {
        d.work_experience = d.work_experience.map(job => ({
            ...job,
            role: job.role || job.title || '',
            company: job.company || job.organization || '',
            period: job.period || job.date || job.dates || '',
            context: job.context || job.summary || '',
            achievements: job.achievements || job.bullets || []
        }));
    }

    if (d.education) {
        d.education = d.education.map(edu => ({
            ...edu,
            degree: edu.degree || edu.title || '',
            institution: edu.institution || edu.school || edu.university || '',
            period: edu.period || edu.date || edu.dates || '',
            bullets: edu.bullets || edu.achievements || edu.highlights || []
        }));
    }

    if (d.professional_qualifications) {
        d.professional_qualifications = d.professional_qualifications.map(q => ({
            ...q,
            category: q.category || q.name || q.title || '',
            skills: typeof q.skills === 'string' ? q.skills : (Array.isArray(q.skills) ? q.skills.join(', ') : '')
        }));
    }

    if (d.extra_curricular) {
        d.extra_curricular = d.extra_curricular.map(ec => ({
            ...ec,
            role: ec.role || ec.title || '',
            organization: ec.organization || ec.company || '',
            period: ec.period || ec.date || ec.dates || '',
            bullets: ec.bullets || ec.achievements || ec.highlights || []
        }));
    }

    return d;
};

const stripHtml = (html) => {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, '').trim();
};

export const generatePdfMakeDefinition = (resumeData) => {
    const d = normalize(resumeData);
    const p = d.personal;
    const L = LAYOUT;
    const LINE_W = 595.28 - L.PAGE_MARGIN[0] - L.PAGE_MARGIN[2];

    const content = [];

    // ═══ 1. NAME (Centered, Uppercase) ═══
    content.push({
        text: stripHtml(p.name || 'Untitled').toUpperCase(),
        fontSize: L.NAME_SIZE,
        bold: true,
        color: '#000000',
        alignment: 'center',
        characterSpacing: 0.8,
        margin: [0, 0, 0, 5]
    });

    // ═══ 2. CONTACT INFO (Centered, pipe-separated) ═══
    const contactParts = [
        p.email, p.phone, p.location, p.linkedin ? 'LinkedIn' : null
    ].filter(Boolean);

    if (contactParts.length > 0) {
        content.push({
            text: contactParts.join('  |  '),
            fontSize: L.CONTACT_SIZE,
            color: '#334155',
            alignment: 'center',
            margin: [0, 0, 0, 8]
        });
    }

    // ═══ 3. HEADER RULE (2pt solid black) ═══
    content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: LINE_W, y2: 0, lineWidth: 2, lineColor: '#000000' }],
        margin: [0, 0, 0, L.SECTION_GAP]
    });

    // ═══ 4. PROFILE ═══
    if (d.personal_profile) {
        content.push({
            text: stripHtml(d.personal_profile),
            fontSize: L.BODY_SIZE,
            color: '#1e293b',
            lineHeight: 1.5,
            alignment: 'justify',
            margin: [0, 0, 0, L.SECTION_GAP]
        });
    }

    // Helper: Section Header (ALL-CAPS, 1px solid black underline)
    const addSectionHeader = (title) => {
        content.push({
            text: title.toUpperCase(),
            fontSize: L.SECTION_HEADER_SIZE,
            bold: true,
            color: '#000000',
            characterSpacing: 1.8,
            margin: [0, 2, 0, 3]
        });
        content.push({
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: LINE_W, y2: 0, lineWidth: 0.75, lineColor: '#000000' }],
            margin: [0, 0, 0, 8]
        });
    };

    // ═══ 5. EXPERIENCE ═══
    if (d.work_experience && d.work_experience.length > 0) {
        addSectionHeader('Experience');

        d.work_experience.forEach((job, index) => {
            const isLast = index === d.work_experience.length - 1;

            // Build the entire entry block as an unbreakable stack
            const entryStack = [];

            // Row 1: Company (bold) — Dates (right)
            entryStack.push({
                columns: [
                    { text: stripHtml(job.company), fontSize: L.ENTRY_TITLE_SIZE, bold: true, color: '#000000' },
                    { text: stripHtml(job.period), fontSize: L.BODY_SIZE, color: '#334155', alignment: 'right' }
                ],
                margin: [0, 0, 0, 1]
            });

            // Row 2: Role (italic)
            entryStack.push({
                text: stripHtml(job.role),
                fontSize: L.ROLE_SIZE,
                italics: true,
                color: '#334155',
                margin: [0, 0, 0, 3]
            });

            // Context paragraph
            if (job.context) {
                entryStack.push({
                    text: stripHtml(job.context),
                    fontSize: L.BODY_SIZE - 0.5,
                    color: '#475569',
                    lineHeight: 1.45,
                    alignment: 'justify',
                    margin: [0, 0, 0, 3]
                });
            }

            // Bullet achievements
            const validAchievements = (job.achievements || []).filter(a => stripHtml(a).trim().length > 0);
            if (validAchievements.length > 0) {
                entryStack.push({
                    ul: validAchievements.map(a => ({
                        text: stripHtml(a),
                        fontSize: L.BULLET_SIZE,
                        color: '#1e293b',
                        lineHeight: 1.45,
                        margin: [0, 0, 0, L.BULLET_GAP]
                    })),
                    margin: [0, 2, 0, 0]
                });
            }

            // Push as UNBREAKABLE block
            content.push({
                unbreakable: true,
                stack: entryStack,
                margin: [0, 0, 0, isLast ? L.SECTION_GAP : L.ENTRY_GAP]
            });
        });
    }

    // ═══ 6. EDUCATION ═══
    if (d.education && d.education.length > 0) {
        addSectionHeader('Education');

        d.education.forEach((edu, index) => {
            const isLast = index === d.education.length - 1;

            const entryStack = [];

            entryStack.push({
                columns: [
                    { text: stripHtml(edu.institution), fontSize: L.ENTRY_TITLE_SIZE, bold: true, color: '#000000' },
                    { text: stripHtml(edu.period), fontSize: L.BODY_SIZE, color: '#334155', alignment: 'right' }
                ],
                margin: [0, 0, 0, 1]
            });

            entryStack.push({
                text: stripHtml(edu.degree),
                fontSize: L.ROLE_SIZE,
                italics: true,
                color: '#334155',
                margin: [0, 0, 0, 3]
            });

            const validBullets = (edu.bullets || []).filter(b => stripHtml(b).trim().length > 0);
            if (validBullets.length > 0) {
                entryStack.push({
                    ul: validBullets.map(b => ({
                        text: stripHtml(b),
                        fontSize: L.BULLET_SIZE,
                        color: '#1e293b',
                        lineHeight: 1.45,
                        margin: [0, 0, 0, L.BULLET_GAP]
                    })),
                    margin: [0, 2, 0, 0]
                });
            }

            content.push({
                unbreakable: true,
                stack: entryStack,
                margin: [0, 0, 0, isLast ? L.SECTION_GAP : L.ENTRY_GAP]
            });
        });
    }

    // ═══ 7. TECHNICAL EXPERTISE ═══
    if (d.professional_qualifications && d.professional_qualifications.length > 0) {
        addSectionHeader('Technical Expertise');

        const skillsStack = d.professional_qualifications.map((q, index) => {
            const isLast = index === d.professional_qualifications.length - 1;
            return {
                columns: [
                    {
                        width: 120,
                        text: stripHtml(q.category).toUpperCase(),
                        fontSize: L.BODY_SIZE - 0.5,
                        bold: true,
                        color: '#000000',
                        characterSpacing: 0.3
                    },
                    {
                        width: '*',
                        text: stripHtml(q.skills),
                        fontSize: L.BODY_SIZE,
                        color: '#1e293b'
                    }
                ],
                margin: [0, 0, 0, isLast ? L.SECTION_GAP : 4]
            };
        });

        // Skills section as unbreakable
        content.push({
            unbreakable: true,
            stack: skillsStack,
            margin: [0, 0, 0, 0]
        });
    }

    // ═══ 8. LEADERSHIP ═══
    if (d.extra_curricular && d.extra_curricular.length > 0) {
        addSectionHeader('Leadership & Initiatives');

        d.extra_curricular.forEach((ec, index) => {
            const isLast = index === d.extra_curricular.length - 1;
            const titleParts = [ec.role, ec.organization].filter(Boolean);

            const entryStack = [];

            entryStack.push({
                columns: [
                    {
                        text: [
                            { text: stripHtml(titleParts[0] || ''), bold: true },
                            titleParts[1] ? { text: `, ${stripHtml(titleParts[1])}`, italics: true } : null
                        ].filter(Boolean),
                        fontSize: L.BODY_SIZE,
                        color: '#0f172a'
                    },
                    { text: stripHtml(ec.period), fontSize: L.BODY_SIZE, color: '#334155', alignment: 'right' }
                ],
                margin: [0, 0, 0, 1]
            });

            const validBullets = (ec.bullets || []).filter(b => stripHtml(b).trim().length > 0);
            if (validBullets.length > 0) {
                entryStack.push({
                    ul: validBullets.map(b => ({
                        text: stripHtml(b),
                        fontSize: L.BULLET_SIZE,
                        color: '#1e293b',
                        lineHeight: 1.45,
                        margin: [0, 0, 0, L.BULLET_GAP]
                    })),
                    margin: [0, 2, 0, 0]
                });
            }

            content.push({
                unbreakable: true,
                stack: entryStack,
                margin: [0, 0, 0, isLast ? 0 : L.ENTRY_GAP]
            });
        });
    }

    return {
        content: content,
        pageMargins: L.PAGE_MARGIN,
        defaultStyle: {
            font: 'Roboto',
            fontSize: L.BODY_SIZE,
            lineHeight: L.LINE_HEIGHT,
            color: '#0f172a'
        }
    };
};
