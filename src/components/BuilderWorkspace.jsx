/* eslint-disable no-unused-vars */
import React, { useRef, useState, useMemo } from 'react';

import { ArrowLeft, Download, Loader2, ChevronDown, FileIcon, FileType, RotateCcw, Settings, Target, Command, ZoomIn, ZoomOut, FileText, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { generatePdfMakeDefinition } from '../services/pdfMakeDefinition';
import DataHub from './DataHub';
import MatchEngine from './MatchEngine';
import ResumeView from './ResumeView';

const BuilderWorkspace = ({ resumeData, onUpdate, onTailor, onReset, aiFeed, matchScore, missingKeywords, onBack }) => {
    const cvRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('data');
    const [zoom, setZoom] = useState(100);

    // Live document stats
    const docStats = useMemo(() => {
        const countWords = (obj) => {
            if (!obj) return 0;
            if (typeof obj === 'string') return obj.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
            if (Array.isArray(obj)) return obj.reduce((s, i) => s + countWords(i), 0);
            if (typeof obj === 'object') return Object.values(obj).reduce((s, v) => s + countWords(v), 0);
            return 0;
        };
        const words = countWords(resumeData);
        const pages = Math.max(1, Math.ceil(words / 480));
        return { words, pages };
    }, [resumeData]);

    const getSafeFilename = (ext) => {
        const titleName = resumeData.personal.name || "Untitled";
        const safeName = titleName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        return `${safeName}_CV.${ext}`;
    };

    // ═══ BULLETPROOF DOWNLOAD ═══
    // Chrome requires anchor IN the DOM for download attribute to work on blob URLs.
    // Without DOM append, Chrome navigates to blob URL instead of downloading.
    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        a.style.display = 'none';

        // MUST append to DOM for Chrome to respect download attribute
        document.body.appendChild(a);

        // Use MouseEvent dispatch for reliability
        a.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));

        // Clean up after delay — 10s ensures download has started
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 10000);
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        setShowDropdown(false);
        setDownloadSuccess(false);

        try {
            const filename = getSafeFilename('pdf');
            const cvElement = document.querySelector('.cv-document');
            if (!cvElement) throw new Error("Resume document not found in DOM");

            // Temporarily remove transforms for accurate capture
            const zoomWrapper = cvElement.closest('[style*="transform"]');
            let savedTransform = '';
            if (zoomWrapper) {
                savedTransform = zoomWrapper.style.transform;
                zoomWrapper.style.transform = 'none';
            }

            await new Promise(resolve => setTimeout(resolve, 200));

            console.log('[PDF] Capturing cv-document element directly...');

            const pdfBlob = await html2pdf()
                .set({
                    margin: [5, 0, 5, 0],
                    filename: filename,
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                })
                .from(cvElement)
                .outputPdf('blob');

            if (zoomWrapper && savedTransform) {
                zoomWrapper.style.transform = savedTransform;
            }

            console.log('[PDF] Blob ready. Size:', pdfBlob.size, 'Type:', pdfBlob.type);

            const finalBlob = new Blob([pdfBlob], { type: 'application/pdf' });
            console.log('[PDF] Final blob type:', finalBlob.type, 'size:', finalBlob.size);
            downloadBlob(finalBlob, filename);

            console.log('[PDF] Download triggered for:', filename);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (error) {
            console.error("[PDF] FATAL ERROR:", error);
            alert("PDF generation failed: " + error.message);
        } finally {
            setTimeout(() => setIsDownloading(false), 1500);
        }
    };

    const handleDownloadWord = () => {
        setShowDropdown(false);
        setDownloadSuccess(false);
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + cvRef.current.innerHTML + footer;
        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        downloadBlob(blob, getSafeFilename('doc'));
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
    };

    const zoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

    return (
        <div className="h-screen bg-aura-bg flex flex-col font-sans overflow-hidden text-aura-text relative">

            {/* ═══ Ambient Background Glows ═══ */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-aura-primary/10 rounded-full blur-[150px] mix-blend-screen"
                />
                <div
                    className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-aura-accent/10 rounded-full blur-[150px] mix-blend-screen"
                />
            </div>

            {/* ═══ COMMAND BAR ═══ */}
            <header
                className="bg-aura-bg/80 backdrop-blur-xl border-b border-white/5 flex flex-col z-20 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.3)] relative"
            >
                {/* Top decorative edge */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aura-primary/30 to-transparent"></div>

                {/* Primary Row */}
                <div className="h-16 flex flex-wrap items-center justify-between px-6 gap-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="text-white/50 hover:text-white transition-all p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 active:scale-95 group shadow-sm bg-black/20"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-aura-primary to-aura-glow p-2 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                <Command className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    value={resumeData.personal.name || 'Untitled Document'}
                                    onChange={(e) => onUpdate('personal.name', e.target.value)}
                                    className="bg-transparent font-bold text-white text-base leading-tight placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-aura-primary/50 focus:bg-white/5 rounded px-1 -ml-1 transition-all"
                                    placeholder="Resume Title"
                                />
                                <div className="flex items-center gap-2 mt-0.5 px-1">
                                    <span className="text-[10px] text-aura-primary/80 font-mono tracking-widest uppercase">Workspace Output</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Zoom Controls */}
                        <div className="hidden sm:flex items-center gap-1 bg-black/40 rounded-xl border border-white/10 p-1 backdrop-blur-sm shadow-inner shadow-black/50">
                            <button onClick={zoomOut} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom Out">
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono text-white/70 w-10 text-center font-bold">{zoom}%</span>
                            <button onClick={zoomIn} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom In">
                                <ZoomIn className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden sm:block" />

                        <button
                            onClick={onReset}
                            title="Restore Original Data"
                            className="text-white/50 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95 bg-black/20"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>

                        {/* Download */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                disabled={isDownloading}
                                className={`inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] border shadow-lg ${downloadSuccess
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                                    : 'bg-gradient-to-r from-aura-primary to-aura-glow border-white/10 text-white shadow-aura-primary/20 hover:shadow-aura-primary/40'
                                    }`}
                            >
                                {isDownloading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Rendering...</>
                                ) : downloadSuccess ? (
                                    <><CheckCircle className="h-4 w-4" /> Deployed!</>
                                ) : (
                                    <><Download className="h-4 w-4" /> Export Document <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} /></>
                                )}
                            </button>

                            {showDropdown && !isDownloading && (
                                <div
                                    className="absolute right-0 top-full mt-3 glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] w-56 p-2 backdrop-blur-2xl"
                                >
                                    <button onClick={handleDownloadPDF} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-left transition-colors group">
                                        <div className="bg-rose-500/20 p-2 rounded-lg mt-0.5 group-hover:scale-110 transition-transform">
                                            <FileIcon className="h-4 w-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white mb-0.5">High-Res PDF</p>
                                            <p className="text-[10px] text-white/50 leading-tight">Best for ATS parsing & email</p>
                                        </div>
                                    </button>
                                    <button onClick={handleDownloadWord} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/10 rounded-xl text-left transition-colors group mt-1">
                                        <div className="bg-blue-500/20 p-2 rounded-lg mt-0.5 group-hover:scale-110 transition-transform">
                                            <FileType className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white mb-0.5">MS Word (.doc)</p>
                                            <p className="text-[10px] text-white/50 leading-tight">Fully editable format</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header >

            {/* ═══ SPLIT LAYOUT ═══ */}
            < div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10" >

                {/* Editor Sidebar */}
                <div
                    className="w-full md:w-[480px] shrink-0 flex flex-col bg-aura-surface/40 backdrop-blur-3xl border-r border-white/10 h-full z-10 shadow-[20px_0_50px_rgba(0,0,0,0.3)]"
                >
                    {/* Workspace Tabs - Animated */}
                    < div className="flex p-4 bg-black/20 border-b border-white/5 gap-2 relative" >
                        {
                            ['data', 'match'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors relative z-10 ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/80'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <div
                                            className={`absolute inset-0 rounded-xl border shadow-lg ${tab === 'data'
                                                ? 'bg-aura-primary/20 border-aura-primary/30 shadow-aura-primary/20'
                                                : 'bg-aura-accent/20 border-aura-accent/30 shadow-aura-accent/20'
                                                }`}
                                        />
                                    )}
                                    {tab === 'data' ? <Settings className="h-4 w-4 z-10" /> : <Target className="h-4 w-4 z-10" />}
                                    <span className="z-10">{tab === 'data' ? 'Content Editor' : 'AI Match Audit'}</span>
                                </button>
                            ))
                        }
                    </div >

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {activeTab === 'data' ? (
                            <div
                                key="data"
                                className="p-5"
                            >
                                <DataHub data={resumeData} onUpdate={onUpdate} />
                            </div>
                        ) : (
                            <div
                                key="match"
                                className="p-5 h-full"
                            >
                                <MatchEngine onTailor={onTailor} aiFeed={aiFeed} matchScore={matchScore} missingKeywords={missingKeywords} />
                            </div>
                        )}
                    </div>

                    {/* Status Strip Footer */}
                    < div className="h-10 px-5 flex items-center justify-between bg-black/40 border-t border-white/5 text-[10px] font-mono text-white/40 backdrop-blur-md" >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                <FileText className="h-3 w-3 text-aura-primary" />
                                {docStats.words} words
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                {docStats.pages} {docStats.pages === 1 ? 'page' : 'pages'}
                            </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-aura-accent">
                            <div className="w-1.5 h-1.5 rounded-full bg-aura-accent shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                            Live Sync
                        </span>
                    </div >
                </div >

                {/* ═══ PREVIEW VIEWPORT ═══ */}
                <div
                    className="flex-1 bg-black/50 overflow-y-auto custom-scrollbar flex justify-center py-12 relative"
                >
                    {/* Subtle grid background */}
                    < div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                    <div className="relative z-10 transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                        {/* Paper Shadow Effect */}
                        <div className="relative group/preview">
                            <div className="absolute -inset-4 bg-gradient-to-b from-aura-primary/20 via-black/40 to-black/60 rounded-xl blur-2xl opacity-50 group-hover/preview:opacity-80 transition-opacity duration-500" />
                            <div className="absolute inset-y-0 -right-2 w-2 bg-gradient-to-r from-black/20 to-transparent" />

                            {/* The CV Document */}
                            <div
                                id="cv-preview-container"
                                ref={cvRef}
                                className="relative bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-transform duration-500"
                                style={{
                                    width: '850px',
                                    minHeight: '1100px',
                                }}
                            >
                                <div
                                    className="resume-print-container origin-top transform-gpu transition-transform duration-200"
                                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                                >
                                    <ResumeView resumeData={resumeData} />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Zoom Hint */}
                        <div className="flex sm:hidden justify-center mt-6">
                            <span className="text-[10px] font-mono text-white/30 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                Pinch to zoom preview
                            </span>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default BuilderWorkspace;
