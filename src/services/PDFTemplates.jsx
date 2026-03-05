/**
 * PDFTemplates.jsx — @react-pdf/renderer vector PDF generation
 * Fixes: contact row (single Text line), section headers, skills table, page breaks
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const stripHtml = (str) => (str || '').replace(/<[^>]*>/g, '');

// Single inline contact string — avoids React.Fragment flex-row bugs in react-pdf
const buildContactLine = (personal) =>
    [personal?.email, personal?.phone, personal?.location, personal?.linkedin ? 'LinkedIn' : null]
        .filter(Boolean).join('  |  ');

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 1 — CLASSIC (Harvard serif, Times-Roman)
// ═══════════════════════════════════════════════════════════════
const C = StyleSheet.create({
    page:        { fontFamily: 'Times-Roman', fontSize: 10, lineHeight: 1.45, paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56, color: '#0f172a' },
    name:        { fontFamily: 'Times-Bold', fontSize: 22, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
    contactLine: { fontSize: 9, color: '#334155', textAlign: 'center', marginBottom: 10 },
    rule2:       { borderBottomWidth: 2, borderBottomColor: '#000', marginBottom: 12 },
    rule1:       { borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 6 },
    profile:     { fontSize: 9.5, lineHeight: 1.55, color: '#1e293b', textAlign: 'justify', marginBottom: 14 },
    secHead:     { fontFamily: 'Times-Bold', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 5, marginBottom: 2 },
    jobWrap:     { marginBottom: 11 },
    row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold10:      { fontFamily: 'Times-Bold', fontSize: 10 },
    italic95:    { fontFamily: 'Times-Italic', fontSize: 9.5, color: '#334155', marginBottom: 3 },
    period:      { fontSize: 9, color: '#334155' },
    context:     { fontSize: 9, color: '#475569', lineHeight: 1.45, marginBottom: 3, textAlign: 'justify' },
    bul:         { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 10 },
    bulDot:      { width: 11, fontSize: 9.5 },
    bulTxt:      { flex: 1, fontSize: 9.5, lineHeight: 1.45, textAlign: 'justify' },
    skRow:       { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
    skLabel:     { fontFamily: 'Times-Bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3, width: 145, paddingRight: 8 },
    skValue:     { flex: 1, fontSize: 9.5, color: '#1e293b', lineHeight: 1.4 },
    ecWrap:      { marginBottom: 8 },
});

export const ClassicPDF = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;
    return (
        <Document title={personal?.name || 'CV'} author={personal?.name}>
            <Page size="A4" style={C.page}>
                <Text style={C.name}>{personal?.name || ''}</Text>
                <Text style={C.contactLine}>{buildContactLine(personal)}</Text>
                <View style={C.rule2} />
                {personal_profile && <Text style={C.profile}>{personal_profile}</Text>}

                {work_experience?.length > 0 && <View>
                    <Text style={C.secHead}>Experience</Text><View style={C.rule1} />
                    {work_experience.map((job, i) => (
                        <View key={i} style={C.jobWrap} wrap={false}>
                            <View style={C.row}>
                                <Text style={C.bold10}>{job.company}</Text>
                                <Text style={C.period}>{job.period}</Text>
                            </View>
                            <Text style={C.italic95}>{job.role}</Text>
                            {job.context ? <Text style={C.context}>{job.context}</Text> : null}
                            {job.achievements?.filter(a => a.trim()).map((a, ai) => (
                                <View key={ai} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{a}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}

                {education?.length > 0 && <View>
                    <Text style={C.secHead}>Education</Text><View style={C.rule1} />
                    {education.map((edu, i) => (
                        <View key={i} style={{ marginBottom: 9 }} wrap={false}>
                            <View style={C.row}>
                                <Text style={C.bold10}>{edu.institution}</Text>
                                <Text style={C.period}>{edu.period}</Text>
                            </View>
                            <Text style={C.italic95}>{edu.degree}</Text>
                            {edu.bullets?.filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{stripHtml(b)}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}

                {professional_qualifications?.length > 0 && <View wrap={false}>
                    <Text style={C.secHead}>Technical Expertise</Text><View style={C.rule1} />
                    {professional_qualifications.map((q, i) => (
                        <View key={i} style={C.skRow}>
                            <Text style={C.skLabel}>{q.category}</Text>
                            <Text style={C.skValue}>{q.skills}</Text>
                        </View>
                    ))}
                </View>}

                {extra_curricular?.length > 0 && <View>
                    <Text style={C.secHead}>Leadership & Initiatives</Text><View style={C.rule1} />
                    {extra_curricular.map((ec, i) => (
                        <View key={i} style={C.ecWrap} wrap={false}>
                            <View style={C.row}>
                                <Text>
                                    <Text style={C.bold10}>{ec.role}</Text>
                                    {ec.organization ? <Text style={{ fontFamily: 'Times-Italic', fontSize: 9.5, color: '#334155' }}>, {ec.organization}</Text> : null}
                                </Text>
                                <Text style={C.period}>{ec.period}</Text>
                            </View>
                            {ec.bullets?.filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={C.bul}><Text style={C.bulDot}>•</Text><Text style={C.bulTxt}>{b}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 2 — MODERN (Helvetica, blue accents)
// ═══════════════════════════════════════════════════════════════
const BLUE = '#2563EB';
const M = StyleSheet.create({
    page:        { fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5, paddingTop: 44, paddingBottom: 44, paddingHorizontal: 52, color: '#1e293b' },
    name:        { fontFamily: 'Helvetica-Bold', fontSize: 23, color: '#0f172a', marginBottom: 4 },
    contactLine: { fontSize: 8.5, color: '#64748b', marginBottom: 14 },
    accentBar:   { height: 3, backgroundColor: BLUE, borderRadius: 2, marginBottom: 18 },
    profileBox:  { backgroundColor: '#f8fafc', borderLeftWidth: 3, borderLeftColor: BLUE, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 18 },
    profileTxt:  { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5 },
    secTxt:      { fontFamily: 'Helvetica-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#0f172a' },
    secLine:     { flex: 1, height: 1, backgroundColor: '#e2e8f0', marginLeft: 8 },
    jobWrap:     { marginBottom: 13, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0' },
    topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
    role:        { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: '#0f172a' },
    company:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: BLUE, marginBottom: 3 },
    badge:       { fontSize: 8, color: '#64748b', backgroundColor: '#f1f5f9', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 99 },
    context:     { fontSize: 9, color: '#475569', lineHeight: 1.45, marginBottom: 3 },
    bul:         { flexDirection: 'row', marginBottom: 2.5, paddingLeft: 4 },
    bulDot:      { width: 11, fontSize: 9.5 },
    bulTxt:      { flex: 1, fontSize: 9.5, lineHeight: 1.45 },
    skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap' },
    skillCard:   { width: '48%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 5, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 6, marginRight: '2%' },
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
                <Text style={M.name}>{personal?.name || ''}</Text>
                <Text style={M.contactLine}>{buildContactLine(personal)}</Text>
                <View style={M.accentBar} />
                {personal_profile && <View style={M.profileBox}><Text style={M.profileTxt}>{personal_profile}</Text></View>}

                {work_experience?.length > 0 && <View>
                    <MSecHead>Experience</MSecHead>
                    {work_experience.map((job, i) => (
                        <View key={i} style={M.jobWrap} wrap={false}>
                            <View style={M.topRow}>
                                <View><Text style={M.role}>{job.role}</Text><Text style={M.company}>{job.company}</Text></View>
                                <Text style={M.badge}>{job.period}</Text>
                            </View>
                            {job.context ? <Text style={M.context}>{job.context}</Text> : null}
                            {job.achievements?.filter(a => a.trim()).map((a, ai) => (
                                <View key={ai} style={M.bul}><Text style={M.bulDot}>•</Text><Text style={M.bulTxt}>{a}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}

                {education?.length > 0 && <View>
                    <MSecHead>Education</MSecHead>
                    {education.map((edu, i) => (
                        <View key={i} style={M.jobWrap} wrap={false}>
                            <View style={M.topRow}>
                                <View><Text style={M.role}>{edu.institution}</Text><Text style={M.company}>{edu.degree}</Text></View>
                                <Text style={M.badge}>{edu.period}</Text>
                            </View>
                            {edu.bullets?.filter(b => b.trim()).map((b, bi) => (
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
                                <Text style={M.skillLbl}>{q.category}</Text>
                                <Text style={M.skillVal}>{q.skills}</Text>
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
                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{ec.role}</Text>
                                    {ec.organization ? <Text style={{ fontSize: 9, color: '#64748b' }}> · {ec.organization}</Text> : null}
                                </Text>
                                <Text style={M.badge}>{ec.period}</Text>
                            </View>
                            {ec.bullets?.filter(b => b.trim()).map((b, bi) => (
                                <View key={bi} style={M.bul}><Text style={M.bulDot}>•</Text><Text style={M.bulTxt}>{b}</Text></View>
                            ))}
                        </View>
                    ))}
                </View>}
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 3 — EXECUTIVE (navy header, gold accents)
// ═══════════════════════════════════════════════════════════════
const NAVY = '#0f172a';
const GOLD = '#f59e0b';
const E = StyleSheet.create({
    page:        { fontFamily: 'Times-Roman', fontSize: 10, lineHeight: 1.45, paddingBottom: 48, color: '#1e293b' },
    header:      { backgroundColor: NAVY, paddingTop: 34, paddingBottom: 26, paddingHorizontal: 56 },
    name:        { fontFamily: 'Times-Bold', fontSize: 23, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 },
    goldBar:     { width: 44, height: 2.5, backgroundColor: GOLD, marginBottom: 10, borderRadius: 1 },
    contactLine: { fontSize: 8.5, color: '#94a3b8' },
    stripe:      { height: 4, backgroundColor: GOLD },
    body:        { paddingHorizontal: 56, paddingTop: 22 },
    profileBox:  { borderLeftWidth: 3, borderLeftColor: GOLD, paddingLeft: 13, marginBottom: 18 },
    profileTxt:  { fontFamily: 'Times-Italic', fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secHead:     { fontFamily: 'Times-Bold', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 2, color: NAVY, marginBottom: 3, marginTop: 5 },
    goldRule:    { height: 1, backgroundColor: GOLD, marginBottom: 8 },
    jobWrap:     { marginBottom: 13 },
    headerBox:   { backgroundColor: '#f8fafc', paddingVertical: 7, paddingHorizontal: 11, borderRadius: 3, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
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
                    <Text style={E.name}>{personal?.name || ''}</Text>
                    <View style={E.goldBar} />
                    <Text style={E.contactLine}>{buildContactLine(personal)}</Text>
                </View>
                <View style={E.stripe} />

                <View style={E.body}>
                    {personal_profile && <View style={E.profileBox}><Text style={E.profileTxt}>{personal_profile}</Text></View>}

                    {work_experience?.length > 0 && <View>
                        <ESecHead>Professional Experience</ESecHead>
                        {work_experience.map((job, i) => (
                            <View key={i} style={E.jobWrap} wrap={false}>
                                <View style={E.headerBox}>
                                    <View><Text style={E.jobCo}>{job.company}</Text><Text style={E.jobRole}>{job.role}</Text></View>
                                    <Text style={E.period}>{job.period}</Text>
                                </View>
                                {job.context ? <Text style={E.context}>{job.context}</Text> : null}
                                {job.achievements?.filter(a => a.trim()).map((a, ai) => (
                                    <View key={ai} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{a}</Text></View>
                                ))}
                            </View>
                        ))}
                    </View>}

                    {education?.length > 0 && <View>
                        <ESecHead>Education</ESecHead>
                        {education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 11 }} wrap={false}>
                                <View style={E.headerBox}>
                                    <View><Text style={E.jobCo}>{edu.institution}</Text><Text style={E.jobRole}>{edu.degree}</Text></View>
                                    <Text style={E.period}>{edu.period}</Text>
                                </View>
                                {edu.bullets?.filter(b => b.trim()).map((b, bi) => (
                                    <View key={bi} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{stripHtml(b)}</Text></View>
                                ))}
                            </View>
                        ))}
                    </View>}

                    {professional_qualifications?.length > 0 && <View wrap={false}>
                        <ESecHead>Core Competencies</ESecHead>
                        {professional_qualifications.map((q, i) => (
                            <View key={i} style={E.skRow}>
                                <Text style={E.skLabel}>{q.category}</Text>
                                <Text style={E.skValue}>{q.skills}</Text>
                            </View>
                        ))}
                    </View>}

                    {extra_curricular?.length > 0 && <View>
                        <ESecHead>Leadership & Affiliations</ESecHead>
                        {extra_curricular.map((ec, i) => (
                            <View key={i} style={E.ecWrap} wrap={false}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text>
                                        <Text style={{ fontFamily: 'Times-Bold', fontSize: 10 }}>{ec.role}</Text>
                                        {ec.organization ? <Text style={{ fontFamily: 'Times-Italic', fontSize: 9.5, color: '#64748b' }}> — {ec.organization}</Text> : null}
                                    </Text>
                                    <Text style={E.period}>{ec.period}</Text>
                                </View>
                                {ec.bullets?.filter(b => b.trim()).map((b, bi) => (
                                    <View key={bi} style={E.bul}><Text style={E.bulDot}>•</Text><Text style={E.bulTxt}>{b}</Text></View>
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
// PART-TIME CV PDF
// ═══════════════════════════════════════════════════════════════
const SC = { warehouse: '#f59e0b', carehome: '#ec4899', freelance: '#8b5cf6' };
const SL = { warehouse: 'Warehouse & Logistics', carehome: 'Care Home & Support Work', freelance: 'Freelance & Gig Work' };

const PT = StyleSheet.create({
    page:      { fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.5, paddingBottom: 40, color: '#1e293b' },
    header:    { paddingTop: 32, paddingBottom: 20, paddingHorizontal: 50 },
    name:      { fontFamily: 'Helvetica-Bold', fontSize: 21, color: '#0f172a', marginBottom: 3 },
    sector:    { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 },
    contact:   { fontSize: 8.5, color: '#64748b' },
    body:      { paddingHorizontal: 50, paddingTop: 18 },
    stmtBox:   { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 8, marginBottom: 16, backgroundColor: '#fafafa' },
    stmtTxt:   { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },
    secLbl:    { fontFamily: 'Helvetica-Bold', fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 4, borderBottomWidth: 1.5, marginBottom: 8 },
    twoCol:    { flexDirection: 'row', gap: 18 },
    leftCol:   { width: 155 },
    rightCol:  { flex: 1 },
    skillItem: { flexDirection: 'row', paddingVertical: 3.5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 5 },
    skillDot:  { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 10 },
    skillTxt:  { flex: 1, fontSize: 8.5, color: '#334155' },
    jobWrap:   { marginBottom: 11, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
    jobRole:   { fontFamily: 'Helvetica-Bold', fontSize: 10 },
    jobBadge:  { fontSize: 7.5, color: '#64748b', backgroundColor: '#f8fafc', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 99, borderWidth: 1, borderColor: '#e2e8f0' },
    jobCo:     { fontFamily: 'Helvetica-Bold', fontSize: 8.5, marginBottom: 3 },
    bul:       { flexDirection: 'row', marginBottom: 2, paddingLeft: 8 },
    bulDot:    { width: 10, fontSize: 9 },
    bulTxt:    { flex: 1, fontSize: 9, lineHeight: 1.45 },
    eduInst:   { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#0f172a' },
    eduDeg:    { fontFamily: 'Helvetica-Oblique', fontSize: 8.5, marginBottom: 1 },
    eduPeriod: { fontSize: 8, color: '#94a3b8', marginBottom: 8 },
    footer:    { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', fontSize: 8, color: '#94a3b8', textAlign: 'center' },
});

export const PartTimePDF = ({ data, sector = 'warehouse' }) => {
    const color = SC[sector] || '#2563EB';
    const { personal, objective, skills, work_experience, education } = data;
    return (
        <Document title={`${personal?.name || 'CV'} - Part Time`} author={personal?.name}>
            <Page size="A4" style={PT.page}>
                <View style={[PT.header, { borderBottomWidth: 3, borderBottomColor: color }]}>
                    <Text style={PT.name}>{personal?.name || 'Your Name'}</Text>
                    <Text style={[PT.sector, { color }]}>{SL[sector]} · Part-Time</Text>
                    <Text style={PT.contact}>{buildContactLine(personal)}</Text>
                </View>
                <View style={PT.body}>
                    {objective?.trim() && (
                        <View style={[PT.stmtBox, { borderLeftColor: color }]}>
                            <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>Personal Statement</Text>
                            <Text style={PT.stmtTxt}>{objective}</Text>
                        </View>
                    )}
                    <View style={PT.twoCol}>
                        <View style={PT.leftCol}>
                            {skills?.filter(s => s.trim()).length > 0 && <View style={{ marginBottom: 16 }}>
                                <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>Key Skills</Text>
                                {skills.filter(s => s.trim()).map((sk, i) => (
                                    <View key={i} style={PT.skillItem}>
                                        <Text style={[PT.skillDot, { color }]}>▸</Text>
                                        <Text style={PT.skillTxt}>{sk}</Text>
                                    </View>
                                ))}
                            </View>}
                            {education?.length > 0 && <View>
                                <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>Education</Text>
                                {education.map((edu, i) => (
                                    <View key={i}>
                                        <Text style={PT.eduInst}>{edu.institution || '—'}</Text>
                                        {edu.degree ? <Text style={[PT.eduDeg, { color }]}>{edu.degree}</Text> : null}
                                        {edu.period ? <Text style={PT.eduPeriod}>{edu.period}</Text> : null}
                                    </View>
                                ))}
                            </View>}
                        </View>
                        <View style={PT.rightCol}>
                            {work_experience?.length > 0 && <View>
                                <Text style={[PT.secLbl, { color, borderBottomColor: color }]}>Work Experience</Text>
                                {work_experience.map((job, i) => (
                                    <View key={i} style={PT.jobWrap} wrap={false}>
                                        <View style={PT.jobTopRow}>
                                            <Text style={PT.jobRole}>{job.role || '—'}</Text>
                                            {job.period ? <Text style={PT.jobBadge}>{job.period}</Text> : null}
                                        </View>
                                        {job.company ? <Text style={[PT.jobCo, { color }]}>{job.company}</Text> : null}
                                        {job.bullets?.filter(b => b.trim()).map((b, bi) => (
                                            <View key={bi} style={PT.bul}><Text style={PT.bulDot}>•</Text><Text style={PT.bulTxt}>{b}</Text></View>
                                        ))}
                                    </View>
                                ))}
                            </View>}
                        </View>
                    </View>
                    <Text style={PT.footer}>References available upon request · Part-Time CV · Generated with GokulCV</Text>
                </View>
            </Page>
        </Document>
    );
};

// ═══════════════════════════════════════════════════════════════
// UNIFIED EXPORT
// ═══════════════════════════════════════════════════════════════
export const generatePDF = async (resumeData, template = 'classic') => {
    const docs = {
        classic:   <ClassicPDF resumeData={resumeData} />,
        modern:    <ModernPDF resumeData={resumeData} />,
        executive: <ExecutivePDF resumeData={resumeData} />,
    };
    return await pdf(docs[template] || docs.classic).toBlob();
};
