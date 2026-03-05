/* eslint-disable no-unused-vars */
import React, { useRef, useState, useMemo } from 'react';

import { ArrowLeft, Download, Loader2, ChevronDown, FileIcon, FileType, RotateCcw, Settings, Target, Command, ZoomIn, ZoomOut, FileText, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import DataHub from './DataHub';
import MatchEngine from './MatchEngine';
import { ResumeView, TEMPLATES } from './TemplateEngine';

const BuilderWorkspace = ({ resumeData, onUpdate, onTailor, onReset, aiFeed, matchScore, missingKeywords, extraMetrics, onBack, initialTemplate = 'classic' }) => {
    const cvRef = useRef(null);
    const [activeTemplate, setActiveTemplate] = useState(initialTemplate);
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

            // Target the live .cv-document element directly (NOT the ref wrapper)
            // The ref points to the outer zoom wrapper — wrong element, produces blank PDFs
            const cvElement = document.querySelector('.cv-document');
            if (!cvElement) throw new Error("Resume element not found in DOM. Ensure the preview is visible.");

            // Strip zoom transform before capture — CSS transforms break html2canvas scaling
            const zoomWrapper = cvElement.closest('[style*="transform"]');
            let savedTransform = '';
            if (zoomWrapper) {
                savedTransform = zoomWrapper.style.transform;
                zoomWrapper.style.transform = 'none';
            }

            // Brief pause for DOM to repaint after transform removal
            await new Promise(resolve => setTimeout(resolve, 200));

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

            // Restore zoom transform
            if (zoomWrapper && savedTransform) {
                zoomWrapper.style.transform = savedTransform;
            }

            console.log('[PDF] Blob ready. Size:', pdfBlob.size);
            if (pdfBlob.size < 10000) {
                throw new Error("PDF is suspiciously small — the wrong element may have been captured.");
            }

            // Wrap in explicit PDF MIME type to prevent UUID filename bug in Chrome
            const finalBlob = new Blob([pdfBlob], { type: 'application/pdf' });
            downloadBlob(finalBlob, filename);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (error) {
            console.error("[PDF] FATAL ERROR:", error);
            alert("PDF generation failed: " + error.message);
        } finally {
            // Always clear downloading state, even on error
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
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-900 relative">

            {/* ═══ COMMAND BAR ═══ */}
            <header
                className="bg-white border-b border-slate-200 flex flex-col z-20 shrink-0 relative"
            >

                {/* Primary Row */}
                <div className="h-16 flex flex-wrap items-center justify-between px-6 gap-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="text-slate-500 hover:text-slate-900 transition-all p-2 rounded-lg hover:bg-slate-100 border border-slate-200 active:scale-95 group shadow-sm bg-white cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                                <Command className="h-4 w-4 text-slate-900" />
                            </div>
                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    value={resumeData.personal.name || 'Untitled Document'}
                                    onChange={(e) => onUpdate('personal.name', e.target.value)}
                                    className="bg-transparent font-bold text-slate-900 text-base leading-tight placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white rounded-md px-1.5 -ml-1 transition-all"
                                    placeholder="Resume Title"
                                />
                                <div className="flex items-center gap-2 mt-0.5 px-1">
                                    <span className="text-[10px] text-brand-primary font-mono tracking-widest uppercase">Workspace Output</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Zoom Controls */}
                        <div className="hidden sm:flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                            <button onClick={zoomOut} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Zoom Out">
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono text-slate-700 w-10 text-center font-bold">{zoom}%</span>
                            <button onClick={zoomIn} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Zoom In">
                                <ZoomIn className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                        {/* Template Switcher */}
                        <div className="hidden md:flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 p-1 shadow-sm">
                            {Object.values(TEMPLATES).map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id)} title={t.subtitle}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTemplate === t.id ? 'bg-white text-brand-primary shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
                                    {t.name}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={onReset}
                            title="Restore Original Data"
                            className="text-slate-500 hover:text-red-600 p-2.5 rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200 shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>

                        {/* Download */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                disabled={isDownloading}
                                className={`inline-flex items-center gap-2 py-2.5 px-5 rounded-lg text-sm font-bold transition-all active:scale-[0.97] border cursor-pointer ${downloadSuccess
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                                    : 'bg-brand-primary hover:bg-blue-700 border-transparent text-white shadow-sm'
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
                                    className="absolute right-0 top-full mt-3 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100] w-56 p-2"
                                >
                                    <button onClick={handleDownloadPDF} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer group">
                                        <div className="bg-rose-50 p-2 rounded-lg mt-0.5 group-hover:scale-110 transition-transform">
                                            <FileIcon className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 mb-0.5">High-Res PDF</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Best for ATS parsing & email</p>
                                        </div>
                                    </button>
                                    <button onClick={handleDownloadWord} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer group mt-1">
                                        <div className="bg-blue-50 p-2 rounded-lg mt-0.5 group-hover:scale-110 transition-transform">
                                            <FileType className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 mb-0.5">MS Word (.doc)</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Fully editable format</p>
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
                    className="w-full md:w-[480px] shrink-0 flex flex-col bg-white border-r border-slate-200 h-full z-10"
                >
                    {/* Workspace Tabs - Animated */}
                    < div className="flex p-4 bg-slate-50 border-b border-slate-200 gap-2 relative" >
                        {
                            ['data', 'match'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer relative z-10 ${activeTab === tab ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <div
                                            className="absolute inset-0 rounded-lg border shadow-sm bg-white border-slate-200"
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
                                <MatchEngine onTailor={onTailor} aiFeed={aiFeed} matchScore={matchScore} missingKeywords={missingKeywords} extraMetrics={extraMetrics} />
                            </div>
                        )}
                    </div>

                    {/* Status Strip Footer */}
                    < div className="h-10 px-5 flex items-center justify-between bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-500 shrink-0" >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                                <FileText className="h-3 w-3 text-brand-primary" />
                                {docStats.words} words
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                                {docStats.pages} {docStats.pages === 1 ? 'page' : 'pages'}
                            </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-brand-primary font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                            Live Sync
                        </span>
                    </div >
                </div >

                {/* ═══ PREVIEW VIEWPORT ═══ */}
                <div
                    className="flex-1 bg-slate-100 overflow-y-auto custom-scrollbar flex justify-center py-12 relative"
                >
                    {/* Subtle grid background */}
                    < div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                    <div className="relative z-10 transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                        {/* Paper Shadow Effect */}
                        <div className="relative group/preview">
                            <div className="absolute -inset-2 bg-black/5 rounded-xl blur-lg opacity-30" />

                            {/* The CV Document */}
                            <div
                                id="cv-preview-container"
                                ref={cvRef}
                                className="relative bg-white shadow-2xl ring-1 ring-slate-200 transition-transform duration-500"
                                style={{
                                    width: '850px',
                                    minHeight: '1100px',
                                }}
                            >
                                <div
                                    className="resume-print-container origin-top transform-gpu transition-transform duration-200"
                                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                                >
                                    <ResumeView resumeData={resumeData} template={activeTemplate} />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Zoom Hint */}
                        <div className="flex sm:hidden justify-center mt-6">
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
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
