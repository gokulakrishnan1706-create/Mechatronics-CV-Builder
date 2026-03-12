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

// ── Build Groq/OpenRouter prompt from extracted text ──
export const buildExtractionPrompt = (cvText, jd = '') => {
    const tailorSection = jd.trim() ? `
ALSO tailor the extracted data to this job description:
- Write a compelling personal statement (max 60 words, no first-person, no buzzwords, ends with value proposition)
- Rewrite bullet points with strong UK action verbs (Delivered/Led/Achieved/Drove/Built) and at least one metric per bullet
- Weave JD keywords naturally into bullets
- Add relevant skills from JD to skills array
- Keep all personal details, job titles, company names, dates EXACTLY as they appear

JOB DESCRIPTION:
${jd.substring(0, 2500)}` : '';

    return `You are a UK CV data extraction expert. Extract ALL information from this CV text into the exact JSON structure below.

CV TEXT:
${cvText.substring(0, 6000)}
${tailorSection}

Return ONLY this raw JSON, no markdown, no explanation:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "" },
  "objective": "",
  "skills": [],
  "work_experience": [{ "id": 1, "company": "", "role": "", "period": "", "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "period": "" }]
}

Extraction rules:
- Extract EVERY job, EVERY skill, EVERY education entry — miss nothing
- Put ALL duties, responsibilities and achievements into bullets arrays as separate strings
- If no personal statement exists in the CV, write a brief one from the person's experience
- Skills should be individual items, not paragraphs
- Return valid parseable JSON only`;
};

// ── Call Groq with extracted text ──
export const structureWithGroq = async (prompt) => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    const orKey   = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!groqKey && !orKey) {
        throw new Error('No AI API keys found. Add VITE_GROQ_API_KEY to your .env file.');
    }

    // Try Groq first
    if (groqKey) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2,
                    max_tokens: 3000,
                    response_format: { type: 'json_object' },
                }),
            });

            if (res.ok) {
                const data = await res.json();
                console.log('[pdfExtract] Structured via Groq ✓');
                return data.choices[0].message.content;
            }

            const errData = await res.json().catch(() => ({}));
            if (res.status !== 429) {
                throw new Error(`Groq error ${res.status}: ${errData?.error?.message || 'Unknown'}`);
            }
            console.warn('[pdfExtract] Groq rate limited, trying OpenRouter...');
        } catch (err) {
            if (!err.message.includes('rate') && !err.message.includes('429')) throw err;
            console.warn('[pdfExtract] Groq failed:', err.message);
        }
    }

    // Fallback: OpenRouter
    if (orKey) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${orKey}`,
                'HTTP-Referer': 'https://gokulcv.app',
                'X-Title': 'GokulCV',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 3000,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            console.log('[pdfExtract] Structured via OpenRouter ✓');
            return data.choices[0].message.content;
        }

        const errData = await res.json().catch(() => ({}));
        throw new Error(`OpenRouter error ${res.status}: ${errData?.error?.message || 'Unknown'}`);
    }

    throw new Error('All providers failed. Check your API keys.');
};

// ── Parse JSON response safely ──
export const parseExtractedJSON = (raw) => {
    const clean = raw.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1) throw new Error('No JSON found in AI response. Please try again.');
    return JSON.parse(clean.substring(start, end + 1));
};
