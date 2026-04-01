/**
 * PDFTemplates.jsx — @react-pdf/renderer vector PDF generation
 * v3.0 — fixed part-time two-col collapse, gap bug, textTransform, generatePDF routing
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// Register Open Sans — clean, professional font similar to Calibri, ATS-friendly
Font.register({
    family: 'OpenSans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf', fontWeight: 'normal' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-normal.ttf', fontWeight: 'bold' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf', fontWeight: 'normal', fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-700-italic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
    ],
});

// Disable react-pdf's built-in hyphenation — it produces & artifacts with custom fonts
Font.registerHyphenationCallback(word => [word]);

const stripHtml = (str) => {
    if (!str) return '';
    return (str + '')
        .replace(/&amp;/gi, '&')
        .replace(/&ndash;/gi, '-')
        .replace(/&mdash;/gi, '-')
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&[a-zA-Z0-9#]+;/g, '')
        .replace(/<[^>]*>/g, '')
        .trim();
};

// Fix stray & that appears between compound words (e.g. "night&shift" → "night-shift")
// Preserves legitimate ampersands like "P&G" (single uppercase letters around &)
const sanitizeForPDF = (str) => {
    if (!str) return '';
    return (str + '').replace(/([a-z]{2,})&([a-z]{2,})/g, '$1-$2');
};

const buildContactLine = (personal) =>
    [personal?.email, personal?.phone, personal?.location, personal?.linkedin ? 'LinkedIn' : null]
        .filter(Boolean).map(s => stripHtml(String(s))).join('  |  ');

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 1 — CLASSIC
// ═══════════════════════════════════════════════════════════════
const C = StyleSheet.create({
    page:        { fontFamily: 'Times-Roman', fontSize: 10, lineHeight: 1.45, paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56, color: '#0f172a' },
    name:        { fontFamily: 'Times-Bold', fontSize: 26, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 },
    contactLine: { fontSize: 9.5, color: '#334155', textAlign: 'center', marginBottom: 16 },
    rule2:       { borderBottomWidth: 2.5, borderBottomColor: '#000', marginBottom: 20 },
    rule1:       { borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 6 },
    profile:     { fontSize: 9.5, lineHeight: 1.55, color: '#1e293b', textAlign: 'justify', marginBottom: 14 },
    secHead:     { fontFamily: 'Times-Bold', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6, marginBottom: 3 },
    jobWrap:     { marginBottom: 11 },
    row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold10:      { fontFamily: 'Times-Bold', fontSize: 10 },
    italic95:    { fontFamily: 'Times-Italic', fontSize: 9.5, color: '#334155', marginBottom: 3 },
    period:      { fontSize: 9, color: '#334155' },
    context:     { fontSize: 9.5, color: '#334155', lineHeight: 1.5, marginBottom: 4, textAlign: 'justify' },
    bul:         { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 10 },
    bulDot:      { width: 11, fontSize: 9.5 },
    bulTxt:      { flex: 1, fontSize: 9.5, lineHeight: 1.45, textAlign: 'justify' },
    skRow:       { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
    skLabel:     { fontFamily: 'Times-Bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3, width: 162, paddingRight: 8 },
    skValue:     { flex: 1, fontSize: 9.5, color: '#1e293b', lineHeight: 1.4 },
    ecWrap:      { marginBottom: 8 },
});

export const ClassicPDF = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <Document title={personal?.name || 'CV'} author={personal?.name}>
            <Page size="A4" style={C.page}>
                <Text style={C.name}>{stripHtml(personal?.name || '')}</Text>
                <Text style={C.contactLine}>{buildContactLine(personal)}</Text>
                <View style={C.rule2} />
                {personal_profile && <Text style={C.profile}>{stripHtml(personal_profile)}</Text>}
                {work_experience?.length > 0 && <View>
                    <Text style={C.secHead}>Experience</Text><View style={C.rule1} />
                    {work_experience.map((job, i) => (
                        <View key={i} style={C.jobWrap} wrap={false}>
                            <View style={C.row}>
                                <Text style={C.bold10}>{stripHtml(job.company)}</Text>
                                <Text style={C.period}>{stripHtml(job.period)}</Text>
                            </View>
                            <Text style={C.italic95}>{stripHtml(job.role)}</Text>
                            {job.context ? <Text style={C.context}>{stripHtml(job.context)}</Text> : null}
                            {(job.achievements || []).filter(a => stripHtml(a).trim()).map((a, ai) => (
                                <View key={ai} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{stripHtml(a)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
                {education?.length > 0 && <View>
                    <Text style={C.secHead}>Education</Text><View style={C.rule1} />
                    {education.map((edu, i) => (
                        <View key={i} style={{ marginBottom: 9 }} wrap={false}>
                            <View style={C.row}>
                                <Text style={C.bold10}>{stripHtml(edu.institution)}</Text>
                                <Text style={C.period}>{stripHtml(edu.period)}</Text>
                            </View>
                            <Text style={C.italic95}>{stripHtml(edu.degree)}</Text>
                            {(edu.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{stripHtml(b)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
                {professional_qualifications?.length > 0 && <View>
                    <Text style={C.secHead}>Technical Expertise</Text><View style={C.rule1} />
                    {professional_qualifications.map((q, i) => (
                        <View key={i} style={[C.skRow, { breakInside: 'avoid' }]}>
                            <Text style={C.skLabel}>{stripHtml(q.category)}</Text>
                            <Text style={C.skValue}>{stripHtml(q.skills)}</Text>
                        </View>
                    ))}
                </View>}
                {extra_curricular?.length > 0 && <View>
                    <Text style={C.secHead}>Leadership & Initiatives</Text><View style={C.rule1} />
                    {extra_curricular.map((ec, i) => (
                        <View key={i} style={C.ecWrap} wrap={false}>
                            <View style={C.row}>
                                <Text>
                                    <Text style={C.bold10}>{stripHtml(ec.role)}</Text>
                                    {ec.organization ? <Text style={{ fontFamily: 'Times-Italic', fontSize: 9.5, color: '#334155' }}>, {stripHtml(ec.organization)}</Text> : null}
                                </Text>
                                <Text style={C.period}>{stripHtml(ec.period)}</Text>
                            </View>
                            {(ec.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{stripHtml(b)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 2 — MODERN
// ═══════════════════════════════════════════════════════════════
const BLUE = '#2563EB';
const M = StyleSheet.create({
    page:        { fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5, paddingTop: 44, paddingBottom: 44, paddingHorizontal: 52, color: '#1e293b' },
    name:        { fontFamily: 'Helvetica-Bold', fontSize: 27, color: '#0f172a', marginBottom: 10 },
    contactLine: { fontSize: 9.5, color: '#64748b', marginBottom: 18 },
    accentBar:   { height: 3.5, backgroundColor: BLUE, borderRadius: 2, marginBottom: 20 },
    profileBox:  { backgroundColor: '#f8fafc', borderLeftWidth: 3, borderLeftColor: BLUE, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 18 },
    profileTxt:  { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5 },
    secTxt:      { fontFamily: 'Helvetica-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#0f172a' },
    secLine:     { flex: 1, height: 1, backgroundColor: '#e2e8f0', marginLeft: 8 },
    jobWrap:     { marginBottom: 13, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0' },
    topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
    role:        { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: '#0f172a' },
    company:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: BLUE, marginBottom: 3 },
    badge:       { fontSize: 8, color: '#64748b', backgroundColor: '#f1f5f9', paddingVertical: 2, paddingHorizontal: 7 },
    context:     { fontSize: 9, color: '#475569', lineHeight: 1.45, marginBottom: 3 },
    bul:         { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 4 },
    bulDot:      { width: 11, fontSize: 9.5 },
    bulTxt:      { flex: 1, fontSize: 9.5, lineHeight: 1.45 },
    skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap' },
    skillCard:   { width: '48%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 7, paddingHorizontal: 10, marginBottom: 6, marginRight: '2%' },
    skillLbl:    { fontFamily: 'Helvetica-Bold', fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.5, color: BLUE, marginBottom: 2 },
    skillVal:    { fontSize: 8.5, color: '#475569', lineHeight: 1.4 },
    ecWrap:      { marginBottom: 9, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0' },
});

const MSecHead = ({ children }) => (
    <View style={M.secRow}>
        <Text style={M.secTxt}>{children}</Text>
        <View style={M.secLine} />
    </View>
);

export const ModernPDF = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <Document title={personal?.name || 'CV'} author={personal?.name}>
            <Page size="A4" style={M.page}>
                <Text style={M.name}>{stripHtml(personal?.name || '')}</Text>
                <Text style={M.contactLine}>{buildContactLine(personal)}</Text>
                <View style={M.accentBar} />
                {personal_profile && <View style={M.profileBox}><Text style={M.profileTxt}>{stripHtml(personal_profile)}</Text></View>}
                {work_experience?.length > 0 && <View>
                    <MSecHead>Experience</MSecHead>
                    {work_experience.map((job, i) => (
                        <View key={i} style={M.jobWrap} wrap={false}>
                            <View style={M.topRow}>
                                <View><Text style={M.role}>{stripHtml(job.role)}</Text><Text style={M.company}>{stripHtml(job.company)}</Text></View>
                                <Text style={M.badge}>{stripHtml(job.period)}</Text>
                            </View>
                            {job.context ? <Text style={M.context}>{stripHtml(job.context)}</Text> : null}
                            {(job.achievements || []).filter(a => stripHtml(a).trim()).map((a, ai) => (
                                <View key={ai} style={M.bul}><Text style={M.bulDot}>•</Text><Text style={M.bulTxt}>{stripHtml(a)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
                {education?.length > 0 && <View>
                    <MSecHead>Education</MSecHead>
                    {education.map((edu, i) => (
                        <View key={i} style={M.jobWrap} wrap={false}>
                            <View style={M.topRow}>
                                <View><Text style={M.role}>{stripHtml(edu.institution)}</Text><Text style={M.company}>{stripHtml(edu.degree)}</Text></View>
                                <Text style={M.badge}>{stripHtml(edu.period)}</Text>
                            </View>
                            {(edu.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={M.bul}><Text style={M.bulDot}>•</Text><Text style={M.bulTxt}>{stripHtml(b)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
                {professional_qualifications?.length > 0 && <View wrap={false}>
                    <MSecHead>Skills</MSecHead>
                    <View style={M.skillsWrap}>
                        {professional_qualifications.map((q, i) => (
                            <View key={i} style={M.skillCard}>
                                <Text style={M.skillLbl}>{stripHtml(q.category)}</Text>
                                <Text style={M.skillVal}>{stripHtml(q.skills)}</Text>
                            </View>
                        ))}
                    </View>
                </View>}
                {extra_curricular?.length > 0 && <View>
                    <MSecHead>Leadership</MSecHead>
                    {extra_curricular.map((ec, i) => (
                        <View key={i} style={M.ecWrap} wrap={false}>
                            <View style={M.topRow}>
                                <Text>
                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{stripHtml(ec.role)}</Text>
                                    {ec.organization ? <Text style={{ fontSize: 9, color: '#64748b' }}> · {stripHtml(ec.organization)}</Text> : null}
                                </Text>
                                <Text style={M.badge}>{stripHtml(ec.period)}</Text>
                            </View>
                            {(ec.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={M.bul}><Text style={M.bulDot}>•</Text><Text style={M.bulTxt}>{stripHtml(b)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 3 — EXECUTIVE
// ═══════════════════════════════════════════════════════════════
const NAVY = '#0f172a';
const GOLD = '#f59e0b';
const E = StyleSheet.create({
    page:        { fontFamily: 'Times-Roman', fontSize: 10, lineHeight: 1.45, paddingBottom: 48, color: '#1e293b' },
    header:      { backgroundColor: NAVY, paddingTop: 34, paddingBottom: 26, paddingHorizontal: 56 },
    name:        { fontFamily: 'Times-Bold', fontSize: 27, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 8 },
    goldBar:     { width: 44, height: 2.5, backgroundColor: GOLD, marginBottom: 10 },
    contactLine: { fontSize: 8.5, color: '#94a3b8' },
    stripe:      { height: 4, backgroundColor: GOLD },
    body:        { paddingHorizontal: 56, paddingTop: 22 },
    profileBox:  { borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 13, marginBottom: 18 },
    profileTxt:  { fontFamily: 'Times-Italic', fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secHead:     { fontFamily: 'Times-Bold', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 2, color: NAVY, marginBottom: 3, marginTop: 5 },
    goldRule:    { height: 1, backgroundColor: GOLD, marginBottom: 8 },
    jobWrap:     { marginBottom: 13 },
    headerBox:   { backgroundColor: '#f8fafc', paddingVertical: 7, paddingHorizontal: 11, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    jobCo:       { fontFamily: 'Times-Bold', fontSize: 10.5, color: NAVY },
    jobRole:     { fontFamily: 'Times-Italic', fontSize: 9.5, color: GOLD },
    period:      { fontFamily: 'Times-Roman', fontSize: 8.5, color: '#64748b' },
    context:     { fontSize: 9, color: '#475569', lineHeight: 1.45, paddingLeft: 11, marginBottom: 3 },
    bul:         { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 20 },
    bulDot:      { width: 12, fontSize: 9.5 },
    bulTxt:      { flex: 1, fontSize: 9.5, lineHeight: 1.45 },
    skRow:       { flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' },
    skLabel:     { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.3, color: NAVY, width: 150, borderRightWidth: 1, borderRightColor: GOLD, paddingRight: 10, paddingTop: 1 },
    skValue:     { flex: 1, fontSize: 9, color: '#334155', paddingLeft: 12, lineHeight: 1.4 },
    ecWrap:      { marginBottom: 9 },
});

const ESecHead = ({ children }) => (
    <View><Text style={E.secHead}>{children}</Text><View style={E.goldRule} /></View>
);

export const ExecutivePDF = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <Document title={personal?.name || 'CV'} author={personal?.name}>
            <Page size="A4" style={E.page}>
                <View style={E.header}>
                    <Text style={E.name}>{stripHtml(personal?.name || '')}</Text>
                    <View style={E.goldBar} />
                    <Text style={E.contactLine}>{buildContactLine(personal)}</Text>
                </View>
                <View style={E.stripe} />
                <View style={E.body}>
                    {personal_profile && <View style={E.profileBox}><Text style={E.profileTxt}>{stripHtml(personal_profile)}</Text></View>}
                    {work_experience?.length > 0 && <View>
                        <ESecHead>Professional Experience</ESecHead>
                        {work_experience.map((job, i) => (
                            <View key={i} style={E.jobWrap} wrap={false}>
                                <View style={E.headerBox}>
                                    <View><Text style={E.jobCo}>{stripHtml(job.company)}</Text><Text style={E.jobRole}>{stripHtml(job.role)}</Text></View>
                                    <Text style={E.period}>{stripHtml(job.period)}</Text>
                                </View>
                                {job.context ? <Text style={E.context}>{stripHtml(job.context)}</Text> : null}
                                {(job.achievements || []).filter(a => stripHtml(a).trim()).map((a, ai) => (
                                    <View key={ai} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{stripHtml(a)}</Text></View>
                                ))}
                            </View>
                        ))}
                    </View>}
                    {education?.length > 0 && <View>
                        <ESecHead>Education</ESecHead>
                        {education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 11 }} wrap={false}>
                                <View style={E.headerBox}>
                                    <View><Text style={E.jobCo}>{stripHtml(edu.institution)}</Text><Text style={E.jobRole}>{stripHtml(edu.degree)}</Text></View>
                                    <Text style={E.period}>{stripHtml(edu.period)}</Text>
                                </View>
                                {(edu.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                    <View key={bi} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{stripHtml(b)}</Text></View>
                                ))}
                            </View>
                        ))}
                    </View>}
                    {professional_qualifications?.length > 0 && <View wrap={false}>
                        <ESecHead>Core Competencies</ESecHead>
                        {professional_qualifications.map((q, i) => (
                            <View key={i} style={E.skRow}>
                                <Text style={E.skLabel}>{stripHtml(q.category)}</Text>
                                <Text style={E.skValue}>{stripHtml(q.skills)}</Text>
                            </View>
                        ))}
                    </View>}
                    {extra_curricular?.length > 0 && <View>
                        <ESecHead>Leadership & Affiliations</ESecHead>
                        {extra_curricular.map((ec, i) => (
                            <View key={i} style={E.ecWrap} wrap={false}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text>
                                        <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}>{stripHtml(ec.role)}</Text>
                                        {ec.organization ? <Text style={{ fontFamily: 'Times-Italic', fontSize: 9.5, color: '#64748b' }}> — {stripHtml(ec.organization)}</Text> : null}
                                    </Text>
                                    <Text style={E.period}>{stripHtml(ec.period)}</Text>
                                </View>
                                {(ec.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                    <View key={bi} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{stripHtml(b)}</Text></View>
                                ))}
                            </View>
                        ))}
                    </View>}
                </View>
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// PART-TIME CV — fixed: no gap, no two-col flexWrap, uppercase via JS
// sector colours and labels
// ═══════════════════════════════════════════════════════════════
const SC = { warehouse: '#f59e0b', retail: '#10b981', carehome: '#ec4899', freelance: '#8b5cf6' };
const SL = { warehouse: 'Warehouse & Logistics', retail: 'Retail & Customer Service', carehome: 'Care Home & Support Work', freelance: 'Freelance & Gig Work' };

const PT = StyleSheet.create({
    page:       { fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5, paddingBottom: 40, color: '#1e293b' },
    header:     { paddingTop: 36, paddingBottom: 20, paddingHorizontal: 52 },
    name:       { fontFamily: 'Helvetica-Bold', fontSize: 22, color: '#0f172a', marginBottom: 3, letterSpacing: -0.3 },
    sectorLbl:  { fontSize: 8.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
    contact:    { fontSize: 8.5, color: '#64748b', marginTop: 2 },
    body:       { paddingHorizontal: 52, paddingTop: 22 },
    stmtBox:    { borderLeftWidth: 3, paddingLeft: 13, paddingVertical: 10, marginBottom: 18, backgroundColor: '#fafafa', borderRadius: 0 },
    stmtLbl:    { fontFamily: 'Helvetica-Bold', fontSize: 8.5, letterSpacing: 1.5, paddingBottom: 4, borderBottomWidth: 1.5, marginBottom: 8 },
    stmtTxt:    { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secLbl:     { fontFamily: 'Helvetica-Bold', fontSize: 8.5, letterSpacing: 1.5, paddingBottom: 4, borderBottomWidth: 1.5, marginBottom: 8 },
    // ── two-col: use fixed widths + marginRight instead of gap (gap not supported) ──
    twoCol:     { flexDirection: 'row' },
    leftCol:    { width: 200, marginRight: 24 },
    rightCol:   { flex: 1 },
    skillItem:  { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    skillDot:   { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 12 },
    skillTxt:   { flex: 1, fontSize: 9, color: '#334155' },
    jobWrap:    { marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    jobTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    jobRole:    { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: '#0f172a' },
    jobBadge:   { fontSize: 8, color: '#94a3b8', backgroundColor: '#f8fafc', paddingVertical: 2, paddingHorizontal: 7, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 999 },
    jobCo:      { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 4 },
    bul:        { flexDirection: 'row', marginBottom: 2, paddingLeft: 0, marginLeft: 16 },
    bulDot:     { width: 10, fontSize: 9.5 },
    bulTxt:     { flex: 1, fontSize: 9.5, lineHeight: 1.45, color: '#334155' },
    eduInst:    { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#0f172a' },
    eduDeg:     { fontFamily: 'Helvetica-Oblique', fontSize: 8.5, marginBottom: 1 },
    eduPeriod:  { fontSize: 8, color: '#94a3b8', marginBottom: 8 },
    footer:     { marginTop: 24, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', fontSize: 8, color: '#94a3b8', textAlign: 'center' },
});

export const PartTimePDF = ({ data, sector = 'warehouse' }) => {
    const color = SC[sector] || '#2563EB';
    const { personal, objective, skills, work_experience, education } = data || {};
    const sectorLabel = (SL[sector] || 'Part-Time').toUpperCase() + ' · PART-TIME';
    const contactParts = [];
    if (personal?.email) contactParts.push('✉ ' + personal.email);
    if (personal?.phone) contactParts.push('📱 ' + personal.phone);
    if (personal?.location) contactParts.push('📍 ' + personal.location);
    return (
        <Document title={`${personal?.name || 'CV'} - Part Time`} author={personal?.name}>
            <Page size="A4" style={PT.page}>
                <View style={[PT.header, { borderBottomWidth: 3, borderBottomColor: color }]}>
                    <Text style={PT.name}>{personal?.name || 'Your Name'}</Text>
                    <Text style={[PT.sectorLbl, { color }]}>{sectorLabel}</Text>
                    <Text style={PT.contact}>{contactParts.join('   ')}</Text>
                </View>

                <View style={PT.body}>
                    {objective?.trim() ? (
                        <View style={[PT.stmtBox, { borderLeftColor: color }]}>
                            <Text style={[PT.stmtLbl, { color, borderBottomColor: color }]}>{'PERSONAL STATEMENT'}</Text>
                            <Text style={PT.stmtTxt}>{objective}</Text>
                        </View>
                    ) : null}

                    <View style={PT.twoCol}>
                        <View style={PT.leftCol}>
                            {(skills || []).filter(s => s.trim()).length > 0 && (
                                <View style={{ marginBottom: 18 }}>
                                    <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>{'KEY SKILLS'}</Text>
                                    {skills.filter(s => s.trim()).map((sk, i) => (
                                        <View key={i} style={PT.skillItem}>
                                            <Text style={[PT.skillDot, { color }]}>▸</Text>
                                            <Text style={PT.skillTxt}>{sk}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {(education || []).length > 0 && (
                                <View>
                                    <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>{'EDUCATION'}</Text>
                                    {education.map((edu, i) => (
                                        <View key={i} style={{ marginBottom: 8 }}>
                                            <Text style={PT.eduInst}>{edu.institution || ''}</Text>
                                            {edu.degree ? <Text style={[PT.eduDeg, { color }]}>{edu.degree}</Text> : null}
                                            {edu.period ? <Text style={PT.eduPeriod}>{edu.period}</Text> : null}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={PT.rightCol}>
                            {(work_experience || []).length > 0 && (
                                <View>
                                    <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>{'WORK EXPERIENCE'}</Text>
                                    {work_experience.map((job, i) => (
                                        <View key={i} style={PT.jobWrap} wrap={false}>
                                            <View style={PT.jobTopRow}>
                                                <Text style={PT.jobRole}>{job.role || ''}</Text>
                                                {job.period ? <Text style={PT.jobBadge}>{job.period}</Text> : null}
                                            </View>
                                            {job.company ? <Text style={[PT.jobCo, { color }]}>{job.company}</Text> : null}
                                            {(job.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                                <View key={bi} style={PT.bul}><Text style={PT.bulDot}>•</Text><Text style={PT.bulTxt}>{b}</Text></View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={PT.footer}>References available upon request · Part-Time CV · Generated with GokulCV</Text>
                </View>
            </Page>
        </Document>
    );
};
// ═══════════════════════════════════════════════════════════════
// ATS PART-TIME — single column, plain text, no colours, fully parseable
// Styles precisely matched to the HTML PartTimeCVPreview (ATS layout)
// HTML px → react-pdf pt conversion: multiply by 0.75
// ═══════════════════════════════════════════════════════════════
const ATS = StyleSheet.create({
    page:    { fontFamily: 'OpenSans', fontSize: 10, lineHeight: 1.55, paddingTop: 36, paddingBottom: 36, paddingHorizontal: 46, color: '#000' },
    name:    { fontFamily: 'OpenSans', fontWeight: 'bold', fontSize: 22, marginBottom: 14, letterSpacing: -0.3 },
    contact: { fontSize: 9, color: '#333', marginBottom: 12 },
    secHead: { fontFamily: 'OpenSans', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, paddingBottom: 2 },
    rule:    { borderBottomWidth: 1.1, borderBottomColor: '#000', marginBottom: 6 },
    jobWrap: { marginTop: 10, marginBottom: 5 },
    row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold:    { fontFamily: 'OpenSans', fontWeight: 'bold', fontSize: 10.5 },
    small:   { fontSize: 9.5, color: '#333' },
    company: { fontFamily: 'OpenSans', fontWeight: 'bold', fontSize: 9.5, color: '#333', marginTop: 1, marginBottom: 4 },
    bul:     { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
    bulDot:  { width: 12, fontSize: 10 },
    bulTxt:  { flex: 1, fontSize: 10, lineHeight: 1.55 },
    profileTxt: { fontSize: 10, marginTop: 6, lineHeight: 2.0, color: '#000' },
    skillTxt: { fontSize: 10, lineHeight: 2.1, color: '#000', marginTop: 6 },
    eduWrap: { marginTop: 8, marginBottom: 4 },
    eduDeg:  { fontSize: 9.5, fontStyle: 'italic', marginTop: 1 },
    refTxt:  { fontSize: 10, marginTop: 6 },
});

export const ATSPartTimePDF = ({ data, sector = 'warehouse' }) => {
    const { personal, objective, skills, work_experience, education } = data || {};
    return (
        <Document title={personal?.name || 'CV'} author={personal?.name}>
            <Page size="A4" style={ATS.page} wrap>
                <Text style={ATS.name}>{(personal?.name || '').toUpperCase()}</Text>
                <Text style={ATS.contact}>{buildContactLine(personal)}</Text>

                {objective?.trim() ? <>
                    <Text style={ATS.secHead}>{'PERSONAL PROFILE'}</Text>
                    <View style={ATS.rule} />
                    <Text style={ATS.profileTxt}>{sanitizeForPDF(objective)}</Text>
                </> : null}

                {(skills || []).filter(s => s.trim()).length > 0 && <>
                    <Text style={ATS.secHead}>{'KEY SKILLS'}</Text>
                    <View style={ATS.rule} />
                    <Text style={ATS.skillTxt}>{skills.filter(s => s.trim()).join(', ')}</Text>
                </>}

                {(work_experience || []).length > 0 && <>
                    <Text style={ATS.secHead}>{'WORK EXPERIENCE'}</Text>
                    <View style={ATS.rule} />
                    {work_experience.map((job, i) => (
                        <View key={i} style={ATS.jobWrap} wrap={false}>
                            <View style={ATS.row}>
                                <Text style={ATS.bold}>{job.role || ''}</Text>
                                <Text style={ATS.small}>{job.period || ''}</Text>
                            </View>
                            <Text style={ATS.company}>{job.company || ''}</Text>
                            {(job.bullets || []).filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={ATS.bul}><Text style={ATS.bulDot}>•</Text><Text style={ATS.bulTxt}>{b}</Text></View>
                            ))}
                        </View>
                    ))}
                </>}

                {(education || []).length > 0 && <>
                    <Text style={ATS.secHead}>{'EDUCATION'}</Text>
                    <View style={ATS.rule} />
                    {education.map((edu, i) => (
                        <View key={i} style={ATS.eduWrap} wrap={false}>
                            <View style={ATS.row}>
                                <Text style={ATS.bold}>{edu.institution || ''}</Text>
                                <Text style={ATS.small}>{edu.period || ''}</Text>
                            </View>
                            {edu.degree ? <Text style={ATS.eduDeg}>{edu.degree}</Text> : null}
                        </View>
                    ))}
                </>}

                <Text style={ATS.secHead}>{'REFERENCES'}</Text>
                <View style={ATS.rule} />
                <Text style={ATS.refTxt}>Available upon request.</Text>
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// UNIFIED EXPORT — routes all templates including part-time
// ═══════════════════════════════════════════════════════════════
export const generatePDF = async (resumeData, template = 'classic', options = {}) => {
    const { sector = 'warehouse', data } = options;
    const cvData = data || resumeData;
    const docs = {
        'classic':   <ClassicPDF resumeData={cvData} />,
        'modern':    <ModernPDF resumeData={cvData} />,
        'executive': <ExecutivePDF resumeData={cvData} />,
        'two-col':   <PartTimePDF data={cvData} sector={sector} />,
        'one-col':   <PartTimePDF data={cvData} sector={sector} />,
        'ats':       <ATSPartTimePDF data={cvData} sector={sector} />,
    };
    const doc = docs[template] || docs['classic'];
    return await pdf(doc).toBlob();
};
