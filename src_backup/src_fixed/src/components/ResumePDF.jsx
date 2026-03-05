import React from 'react';
import { Document, Page, View, Text, Link, StyleSheet, Font } from '@react-pdf/renderer';

/* ─── Disable Hyphenation ─── */
Font.registerHyphenationCallback(word => [word]);

/* ─── Tight, Professional Styles ─── */
const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.35,
        color: '#1a1a1a',
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 40,
        backgroundColor: '#ffffff',
    },

    /* ── Header ── */
    header: {
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        borderBottomStyle: 'solid',
        paddingBottom: 8,
    },
    name: {
        fontFamily: 'Times-Bold',
        fontSize: 22,
        color: '#000000',
        marginBottom: 4,
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    contactText: { fontSize: 8, color: '#333333' },
    contactSep: { fontSize: 8, color: '#999999', marginHorizontal: 4 },
    contactLink: { fontSize: 8, color: '#333333', textDecoration: 'none' },

    /* ── Section ── */
    sectionHeader: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 5,
        paddingBottom: 2,
        borderBottomWidth: 0.75,
        borderBottomColor: '#cccccc',
        borderBottomStyle: 'solid',
    },
    section: { marginBottom: 8 },

    /* ── Profile ── */
    profileText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#222222',
        textAlign: 'justify',
    },

    /* ── Entry (Job / Edu) ── */
    entry: { marginBottom: 7 },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 0,
    },
    entryTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#000000' },
    entryPeriod: { fontFamily: 'Helvetica', fontSize: 8, color: '#333333' },
    entryRole: { fontFamily: 'Helvetica-Oblique', fontSize: 9, color: '#333333', marginBottom: 2 },
    entryContext: { fontSize: 8.5, color: '#444444', lineHeight: 1.35, marginBottom: 2 },

    /* ── Bullet Lists ── */
    bulletList: { marginTop: 2, paddingLeft: 8 },
    bulletItem: { flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' },
    bulletDot: { fontSize: 8, color: '#444444', marginRight: 5, marginTop: 0.5 },
    bulletText: { fontSize: 9, color: '#222222', lineHeight: 1.35, flex: 1, textAlign: 'justify' },
    bulletTextSmall: { fontSize: 8.5, color: '#333333', lineHeight: 1.35, flex: 1 },

    /* ── Skills Grid ── */
    skillRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-start' },
    skillCat: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#000', textTransform: 'uppercase', letterSpacing: 0.4, width: 155, flexShrink: 0 },
    skillVal: { fontSize: 9, color: '#222222', flex: 1 },

    /* ── Leadership ── */
    leaderTitle: { fontSize: 9, color: '#111111' },
    leaderBold: { fontFamily: 'Helvetica-Bold' },
});

/* ── Bullet ── */
const B = ({ children, dot = '•', small = false }) => (
    <View style={s.bulletItem} wrap={false}>
        <Text style={s.bulletDot}>{dot}</Text>
        <Text style={small ? s.bulletTextSmall : s.bulletText}>{children}</Text>
    </View>
);

/* ═══════════════════════════════════════════════════════════════
   THE PDF DOCUMENT
   - Page-level `wrap` allows content to flow across pages
   - `wrap={false}` ONLY on individual entries (single job blocks)
     so a single job never splits mid-way, but the Experience 
     section as a whole CAN flow from page 1 to page 2
   ═══════════════════════════════════════════════════════════════ */
const ResumePDF = ({ resumeData }) => {
    const { personal, personal_profile, education, professional_qualifications, work_experience, extra_curricular } = resumeData;

    return (
        <Document title={`${personal?.name || 'CV'}`} author={personal?.name || ''}>
            <Page size="A4" style={s.page}>

                {/* HEADER */}
                <View style={s.header} wrap={false}>
                    <Text style={s.name}>{personal?.name || 'Untitled'}</Text>
                    <View style={s.contactRow}>
                        {personal?.email && <Link src={`mailto:${personal.email}`} style={s.contactLink}>{personal.email}</Link>}
                        {personal?.email && personal?.phone && <Text style={s.contactSep}>|</Text>}
                        {personal?.phone && <Text style={s.contactText}>{personal.phone}</Text>}
                        {personal?.phone && personal?.location && <Text style={s.contactSep}>|</Text>}
                        {personal?.location && <Text style={s.contactText}>{personal.location}</Text>}
                        {personal?.location && personal?.linkedin && <Text style={s.contactSep}>|</Text>}
                        {personal?.linkedin && <Link src={personal.linkedin} style={s.contactLink}>LinkedIn</Link>}
                    </View>
                </View>

                {/* PROFILE */}
                {personal_profile && (
                    <View style={s.section}>
                        <Text style={s.profileText}>{personal_profile}</Text>
                    </View>
                )}

                {/* EXPERIENCE — section wraps across pages, but each job entry stays intact */}
                {work_experience && work_experience.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionHeader}>Experience</Text>
                        {work_experience.map((job, idx) => (
                            <View key={idx} style={s.entry} wrap={false}>
                                <View style={s.entryRow}>
                                    <Text style={s.entryTitle}>{job.company}</Text>
                                    <Text style={s.entryPeriod}>{job.period}</Text>
                                </View>
                                <Text style={s.entryRole}>{job.role}</Text>
                                {job.context && <Text style={s.entryContext}>{job.context}</Text>}
                                {job.achievements && job.achievements.length > 0 && (
                                    <View style={s.bulletList}>
                                        {job.achievements.map((a, i) => <B key={i}>{a}</B>)}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* EDUCATION — section wraps, entries stay intact */}
                {education && education.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionHeader}>Education</Text>
                        {education.map((edu, idx) => (
                            <View key={idx} style={s.entry} wrap={false}>
                                <View style={s.entryRow}>
                                    <Text style={s.entryTitle}>{edu.institution}</Text>
                                    <Text style={s.entryPeriod}>{edu.period}</Text>
                                </View>
                                <Text style={s.entryRole}>{edu.degree}</Text>
                                {edu.bullets && edu.bullets.length > 0 && (
                                    <View style={s.bulletList}>
                                        {edu.bullets.map((b, i) => <B key={i} dot="-" small>{b.replace(/<[^>]*>/g, '')}</B>)}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* TECHNICAL EXPERTISE */}
                {professional_qualifications && professional_qualifications.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionHeader}>Technical Expertise</Text>
                        {professional_qualifications.map((q, i) => (
                            <View key={i} style={s.skillRow} wrap={false}>
                                <Text style={s.skillCat}>{q.category}</Text>
                                <Text style={s.skillVal}>{q.skills}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* LEADERSHIP */}
                {extra_curricular && extra_curricular.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionHeader}>Leadership & Initiatives</Text>
                        {extra_curricular.map((ec, idx) => (
                            <View key={idx} style={s.entry} wrap={false}>
                                <View style={s.entryRow}>
                                    <Text style={s.leaderTitle}>
                                        <Text style={s.leaderBold}>{ec.role}</Text>
                                        {ec.organization ? `, ${ec.organization}` : ''}
                                    </Text>
                                    <Text style={s.entryPeriod}>{ec.period}</Text>
                                </View>
                                {ec.bullets && ec.bullets.length > 0 && (
                                    <View style={s.bulletList}>
                                        {ec.bullets.map((b, i) => <B key={i} dot="-" small>{b}</B>)}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
};

export default ResumePDF;
