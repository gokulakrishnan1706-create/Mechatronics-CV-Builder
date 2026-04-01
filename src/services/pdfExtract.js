/**
 * pdfExtract.js — Browser-based PDF text extraction
 * Uses PDF.js via CDN — zero API calls, zero cost, works offline
 * Fallback: image CVs use base64 for vision API
 */

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

let pdfjsLib = null;

// ── Load PDF.js once, cache it ──
const loadPdfJs = async () => {
    if (pdfjsLib) return pdfjsLib;
    try {
        const mod = await import(/* @vite-ignore */ PDFJS_CDN);
        pdfjsLib = mod;
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        return pdfjsLib;
    } catch (err) {
        throw new Error('Failed to load PDF.js: ' + err.message);
    }
};

// ── Extract all text from a PDF File object ──
export const extractTextFromPDF = async (file) => {
    if (file.type !== 'application/pdf') {
        return null; // Not a PDF — caller should use vision API
    }

    const pdfjs = await loadPdfJs();

    // Read file as ArrayBuffer
    const arrayBuffer = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsArrayBuffer(file);
    });

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = '';
    const numPages = pdfDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Join items, preserving line breaks intelligently
        let pageText = '';
        let lastY = null;
        for (const item of textContent.items) {
            if ('str' in item) {
                // New line if Y position changed significantly
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    pageText += '\n';
                }
                pageText += item.str;
                if (item.hasEOL) pageText += '\n';
                lastY = item.transform[5];
            }
        }
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
};

// ── Build extraction prompt — sector-aware (delegates to shared algorithm) ──
export { getExtractionPrompt as buildExtractionPrompt } from './partTimeAlgorithm.js';


// ── Structure CV text via AI — routes through aiRouter for best key+model ──
export { callAI } from './aiRouter.js';

export const structureWithGroq = async (prompt) => {
    const { callAI, hasAnyKey } = await import('./aiRouter.js');
    if (!hasAnyKey()) {
        throw new Error('No AI API keys found. Add VITE_GROQ_API_KEY to your .env file.');
    }
    return callAI(prompt, 'extract');
};

// ── Entity sanitiser — strips HTML entities from AI output ──
const decodeEntities = (str) => {
    if (typeof str !== 'string') return str;
    return str
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
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-zA-Z0-9#]+;/gi, '');
};

const sanitiseDeep = (obj) => {
    if (typeof obj === 'string') return decodeEntities(obj);
    if (Array.isArray(obj)) return obj.map(sanitiseDeep);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, sanitiseDeep(v)])
        );
    }
    return obj;
};

// ── Parse JSON response safely ──
export const parseExtractedJSON = (raw) => {
    const clean = raw.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) throw new Error('No JSON found in AI response. Please try again.');
    try {
        return sanitiseDeep(JSON.parse(clean.substring(start, end + 1)));
    } catch {
        throw new Error('AI response contained malformed JSON. Please try again.');
    }
};
