import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Target, Zap, Layout, FileText, CheckCircle, ChevronDown, Star, Shield, Cpu, RefreshCw, XCircle, Users, Github, Linkedin } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Homepage({ onStartBuilding }) {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        { q: "How is this different from standard resume builders?", a: "Most builders just give you templates. Our engine actively rewrites and synthesizes your career history to match specific Job Descriptions, ensuring maximum ATS and human resonance." },
        { q: "Is my data secure?", a: "Yes. All processing happens locally in your browser and through secure API calls. We do not store your data on our servers." },
        { q: "Does the PDF export pass ATS systems?", a: "Absolutely. Our PDF engine (pdfMake) ensures true text extraction and semantic structuring, eliminating the parsing errors common in canvas-based exports." },
        { q: "Can I edit the AI-generated content?", a: "Yes, the Builder Workspace gives you complete control to tweak, revert, or regenerate any section before final export." }
    ];

    const companies = ['Tesla', 'SpaceX', 'Boston Dynamics', 'Rivian', 'Apple', 'Anduril', 'NVIDIA'];

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/20 selection:text-brand-text overflow-x-hidden">

            {/* Ambient Background Glows - Premium Soft Mesh */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[150px] opacity-60"></div>
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-border flex justify-between items-center px-8 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-brand-text">Gokul CV</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <a href="#features" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">Features</a>
                    <a href="#demo" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">Workflow</a>
                    <a href="#compare" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">Compare</a>
                    <a href="#faq" className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors">FAQ</a>
                </div>
                <button
                    onClick={onStartBuilding}
                    className="text-sm font-semibold tracking-wide text-white bg-brand-primary hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    Builder Access <ArrowRight className="w-4 h-4" />
                </button>
            </nav>

            {/* 1. Hero Section */}
            <section ref={heroRef} className="relative pt-40 pb-24 px-6 overflow-hidden flex flex-col items-center text-center z-10 min-h-screen justify-center">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="max-w-5xl mx-auto flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-primary text-sm font-medium tracking-wide mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>The Next Generation Resume Synthesizer</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-8 text-brand-text"
                    >
                        Crafted for the <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">Modern Executive</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-brand-muted max-w-2xl font-light leading-relaxed mb-10"
                    >
                        Beyond simple tailoring. We synthesize your career history into a high-impact, ATS-optimized narrative designed to win at the highest level.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                    >
                        <button
                            onClick={onStartBuilding}
                            className="bg-brand-text hover:bg-slate-800 text-white font-medium rounded-full px-8 py-3.5 flex items-center transition-all shadow-md active:scale-95 text-lg"
                        >
                            Launch Engine
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Hero Visual Mockup - Sleek macOS Window */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-5xl mx-auto mt-20 bg-brand-surface h-[350px] md:h-[500px] relative rounded-t-2xl overflow-hidden border border-brand-border border-b-0 shadow-2xl flex flex-col"
                >
                    {/* macOS Header Bar */}
                    <div className="w-full h-10 border-b border-brand-border bg-slate-50 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                    </div>
                    {/* Split Screen Interface */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar Mock */}
                        <div className="w-64 h-full border-r border-brand-border bg-slate-50 p-6 flex flex-col gap-5 hidden md:flex">
                            <div className="w-full h-8 rounded-md bg-slate-200/60"></div>
                            <div>
                                <div className="w-24 h-2 rounded bg-slate-300 mb-3"></div>
                                <div className="w-full h-8 rounded-md bg-white border border-slate-200 mb-2 shadow-sm"></div>
                                <div className="w-full h-8 rounded-md bg-transparent border border-transparent hover:bg-slate-200/50 mb-2"></div>
                                <div className="w-full h-8 rounded-md bg-transparent border border-transparent hover:bg-slate-200/50 mb-2"></div>
                            </div>
                            <div className="w-full h-32 rounded-md bg-white border border-brand-primary/20 shadow-sm mt-auto"></div>
                        </div>
                        {/* Content Mock - Resume Paper */}
                        <div className="flex-1 h-full bg-slate-100 p-8 md:p-12 overflow-hidden relative flex justify-center">
                            <div className="w-full max-w-2xl bg-white shadow-md rounded-md border border-slate-200 p-8 flex flex-col gap-6 h-full">
                                <div className="w-1/2 h-8 rounded bg-slate-100 mx-auto mb-4"></div>
                                <div className="w-full h-px bg-slate-200 mb-4"></div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="w-1/3 h-5 rounded bg-slate-200"></div>
                                    <div className="w-1/4 h-4 rounded bg-slate-100"></div>
                                </div>
                                <div className="w-1/4 h-4 rounded bg-slate-100 mb-2"></div>
                                <div className="w-full h-3 rounded bg-slate-50 mb-1"></div>
                                <div className="w-[90%] h-3 rounded bg-slate-50 mb-1"></div>
                                <div className="w-[95%] h-3 rounded bg-slate-50 mb-6"></div>

                                <div className="flex justify-between items-center mb-2">
                                    <div className="w-[30%] h-5 rounded bg-slate-200"></div>
                                    <div className="w-[20%] h-4 rounded bg-slate-100"></div>
                                </div>
                                <div className="w-[25%] h-4 rounded bg-slate-100 mb-2"></div>
                                <div className="w-[85%] h-3 rounded bg-slate-50 mb-1"></div>
                                <div className="w-[92%] h-3 rounded bg-slate-50 mb-1"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 2. Social Proof / Logos */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-12 border-y border-brand-border bg-white relative z-10 w-full overflow-hidden"
            >
                <p className="text-center text-xs text-brand-muted font-semibold mb-8 uppercase tracking-widest">Synthesized Resumes Hired By</p>
                <div className="flex overflow-hidden group">
                    <div className="flex space-x-12 md:space-x-24 animate-loop-scroll group-hover:paused">
                        {companies.map((company, num) => (
                            <div key={num} className="text-slate-400 hover:text-brand-primary transition-colors font-bold text-xl md:text-2xl flex items-center justify-center min-w-[140px] tracking-tight">
                                {company}
                            </div>
                        ))}
                        {/* Duplicate for seamless scroll */}
                        {companies.map((company, num) => (
                            <div key={`dup-${num}`} className="text-slate-400 hover:text-brand-primary transition-colors font-bold text-xl md:text-2xl flex items-center justify-center min-w-[140px] tracking-tight">
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* 3. Features / Bento Grid */}
            <section id="features" className="py-32 px-6 relative z-10 bg-brand-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-brand-primary text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                            Platform Features
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-text">Engineered for Success</h2>
                        <p className="text-lg text-brand-muted max-w-2xl mx-auto">Every component is meticulously designed to bypass ATS algorithms and captivate human recruiters.</p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Feature 1 */}
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 md:col-span-2 border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-brand-text">Neural Alignment Match Engine</h3>
                            <p className="text-brand-muted leading-relaxed text-base max-w-xl">Our proprietary AI engine reads your target job descriptions and dynamically restructures your professional history to hit the exact resonance frequency required by the role.</p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-brand-accent" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-brand-text">Instant Synthesis</h3>
                            <p className="text-brand-muted leading-relaxed text-base">Turn years of scattered experience into a focused, potent executive summary in milliseconds.</p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-brand-text">ATS-Flawless Vectors</h3>
                            <p className="text-brand-muted leading-relaxed text-base">Premium PDF generation built strictly with semantic structures guaranteeing zero parse errors in major ATS systems.</p>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div variants={fadeUp} className="bg-slate-900 rounded-2xl p-8 md:col-span-2 relative overflow-hidden shadow-lg group">
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-br from-brand-primary to-brand-accent blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative z-10 text-white flex flex-col justify-center h-full">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Layout className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold mb-3">Complete IDE-Style Control.</h3>
                                <p className="text-base text-white/80 max-w-md mb-6">Edit seamlessly in a professional workspace. View your raw data and the final rendered PDF side by side in perfect synthesis.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 4. Comparison Section (Us vs Them) */}
            <section id="compare" className="py-24 px-6 relative z-10 bg-white border-y border-brand-border">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-text">Why upgrade?</h2>
                        <p className="text-base text-brand-muted">Stop using outdated word processors.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* The Old Way */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-slate-300"></div>
                            <h3 className="text-xl font-bold mb-6 text-slate-700 flex items-center gap-3">
                                <XCircle className="w-6 h-6 text-slate-400" />
                                Standard Builders
                            </h3>
                            <ul className="space-y-4">
                                {['Static templates that break easily', 'Manual keyword stuffing required', 'No feedback on Job Description match', 'Fails ATS visual parsing systems', 'Generic, uninspiring layouts'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                                        <XCircle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Gokul CV */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white border-2 border-brand-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-brand-primary/5"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary"></div>
                            <h3 className="text-xl font-bold mb-6 text-brand-text flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-brand-primary" />
                                Gokul CV
                            </h3>
                            <ul className="space-y-4">
                                {['AI synthesizes dynamic narratives', 'Automated targeted keyword embedding', 'Live match score & missing keywords', 'Guaranteed ATS semantic vector exports', 'Premium minimalist aesthetic'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-brand-text font-medium text-sm">
                                        <CheckCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 5. How It Works / Stepper */}
            <section id="demo" className="py-32 px-6 relative z-10 bg-brand-bg">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                            Workflow
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight text-brand-text">The Deployment Process</h2>
                    </div>

                    <div className="space-y-8">
                        {[
                            { step: '01', title: 'Data Initialization', desc: 'Input your raw career history in our robust IDE workspace. Focus purely on data and metrics.', icon: <FileText className="w-6 h-6 text-brand-primary" /> },
                            { step: '02', title: 'Contextual Targeting', desc: 'Provide the specific job description. The Match Engine parses it to set algorithmic alignment vectors.', icon: <Target className="w-6 h-6 text-brand-accent" /> },
                            { step: '03', title: 'Executive Synthesis', desc: 'The AI rewrites and elevates your bullets, surfacing the most critical impacts and tracking missing keywords.', icon: <Cpu className="w-6 h-6 text-indigo-600" /> },
                            { step: '04', title: 'Production Export', desc: 'Review the side-by-side preview, make final tweaks, and export a flawless PDF ready for deployment.', icon: <CheckCircle className="w-6 h-6 text-emerald-600" /> }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -15 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="flex gap-6 md:gap-8 items-start relative"
                            >
                                {/* Vertical Line Connection */}
                                {idx !== 3 && <div className="absolute left-8 top-16 bottom-[-32px] w-px bg-slate-200 hidden md:block"></div>}

                                <div className="hidden md:flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-brand-border flex items-center justify-center font-mono text-xl font-bold text-slate-400 shadow-sm relative z-10">
                                        {item.step}
                                    </div>
                                </div>
                                <div className="flex-1 bg-white border border-brand-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 md:hidden">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-brand-text tracking-tight">{item.title}</h3>
                                    </div>
                                    <p className="text-brand-muted text-base leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Testimonials / Minimal Proof */}
            <section className="py-24 px-6 relative z-10 border-y border-brand-border bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-text">Results Speak</h2>
                    </motion.div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {[
                            { quote: "The AI didn't just add keywords, it completely rewrote my achievements to sound like a senior executive.", name: "Sarah J.", role: "Senior Product Manager" },
                            { quote: "Highest ATS match score I've ever gotten. Landed 4 interviews in the first week of using the generated PDF.", name: "Michael T.", role: "Lead Software Engineer" },
                            { quote: "Finally, a resume builder that treats you like a professional. The IDE-style interface is a game changer.", name: "Elena R.", role: "Data Scientist" }
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp} className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                    <p className="text-slate-700 leading-relaxed mb-8 text-sm italic">"{t.quote}"</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                        <Users className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-text text-sm">{t.name}</h4>
                                        <p className="text-xs text-brand-muted">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 7. FAQ Section */}
            <section id="faq" className="py-24 px-6 relative z-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-text">Frequently Asked Questions</h2>
                </motion.div>
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="space-y-4"
                >
                    {faqs.map((faq, idx) => (
                        <motion.div key={idx} variants={fadeUp} className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                            <button
                                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors focus:outline-none"
                            >
                                <span className="font-semibold text-base text-brand-text">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-brand-muted transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-brand-primary' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {activeFaq === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6 text-brand-muted text-sm leading-relaxed border-t border-slate-100 pt-4 bg-slate-50"
                                    >
                                        {faq.a}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* 8. Bottom CTA */}
            <section className="py-32 px-6 relative z-10 overflow-hidden border-t border-brand-border bg-brand-bg">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 bg-white p-12 md:p-20 rounded-3xl border border-brand-border shadow-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-brand-text">
                            Deploy your next <br /> career iteration.
                        </h2>
                        <p className="text-base text-brand-muted mb-10 max-w-xl mx-auto">Skip the manual formatting. Get a synthesized, high-impact resume in minutes.</p>
                        <button
                            onClick={onStartBuilding}
                            className="bg-brand-primary hover:bg-blue-700 text-white font-medium rounded-full text-lg px-10 py-4 transition-all shadow-md active:scale-95 flex items-center mx-auto"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Build Your CV Free
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* 9. Expanded Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="border-t border-brand-border pt-20 pb-10 px-6 bg-slate-50 relative z-10"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-xl text-brand-text">Gokul CV</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                                Premium AI-driven resume synthesis for the modern executive. Built for high-impact resonance and flawless ATS parsing.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-brand-text mb-4 text-sm uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-brand-primary transition-colors">Builder IDE</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">AI Match Engine</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">PDF Export Engine</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-brand-text mb-4 text-sm uppercase tracking-wider">Resources</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-brand-primary transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">ATS Guidelines</a></li>
                                <li><a href="#" className="hover:text-brand-primary transition-colors">Career Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-brand-text mb-4 text-sm uppercase tracking-wider">Connect</h4>
                            <div className="flex gap-4">
                                <a href="https://github.com/gokulakrishnan1706-create" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-primary transition-colors" aria-label="Github">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://www.linkedin.com/in/gokulakrishnan-balaiya" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-primary transition-colors" aria-label="LinkedIn">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-xs text-center md:text-left">© {new Date().getFullYear()} Gokulakrishnan Balaiya. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <span>Status:</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 relative">
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                            </div>
                            <span className="text-emerald-600 font-medium">All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
}
