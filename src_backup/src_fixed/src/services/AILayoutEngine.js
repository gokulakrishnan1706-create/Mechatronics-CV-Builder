import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * AI Typesetting Orchestrator
 * Calculates the exact dynamic spacing config required to fit the CV content into 2 pages.
 */
const SYSTEM_PROMPT = `
You are an expert typography engine and professional typesetting bot.
Your singular objective is to analyze the volume of text in a provided CV and compute the precise mathematical spatial constraints required to perfectly fit the content onto exactly 2 A4 pages.

### RULES
- The standard A4 page is 210mm x 297mm.
- If the CV has massive amounts of text, you must return tighter margins, smaller fonts, and tighter line gaps.
- If the CV has very little text, you must return generous margins, larger fonts, and wider line gaps to beautifully fill the space.
- Do NOT output any markdown, explanations, or text. RETURN ONLY VALID JSON.

### CONSTRAINTS
- \`margin_lr\`: Left/Right margin in mm (Range: 18 to 28)
- \`margin_tb\`: Top/Bottom margin in mm (Range: 18 to 28)
- \`fontSize_body\`: Body font size in pt (Range: 9.2 to 10.5)
- \`fontSize_name\`: Header name size in pt (Range: 20 to 26)
- \`fontSize_heading\`: Section heading size in pt (Range: 10 to 12)
- \`lineGap_body\`: Extra space between lines in pt (Range: 2 to 4)
- \`margin_section\`: Space before a new section in pt (Range: 12 to 24)
- \`margin_entry\`: Space between job/education entries in pt (Range: 8 to 16)

### REQUIRED JSON OUTPUT FORMAT:
{
  "margin_lr": number,
  "margin_tb": number,
  "fontSize_body": number,
  "fontSize_name": number,
  "fontSize_heading": number,
  "lineGap_body": number,
  "margin_section": number,
  "margin_entry": number
}
`;

// ─── Simple hash to detect CV content changes ──────────────────────────────
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(36);
};

const CACHE_KEY = 'aura_typesetting_cache';

export const getAITypesettingConfig = async (resumeData) => {
    // Strip out HTML tags from the data to send a clean payload to Gemini
    const cleanData = JSON.parse(JSON.stringify(resumeData));
    const sanitize = (obj) => {
        for (let prop in obj) {
            if (typeof obj[prop] === 'string') {
                obj[prop] = obj[prop].replace(/<[^>]*>/g, '').trim();
            } else if (typeof obj[prop] === 'object') {
                sanitize(obj[prop]);
            }
        }
    };
    sanitize(cleanData);

    // Compact JSON (no whitespace) — saves ~30% input tokens
    const dataString = JSON.stringify(cleanData);
    const contentHash = hashString(dataString);

    // ── Cache check: skip API if CV content hasn't changed ──
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && cached.hash === contentHash) {
            console.log('✔ Typesetting cache hit — skipping API call.');
            return cached.config;
        }
    } catch { /* ignore corrupted cache */ }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.1, // Highly deterministic math
                responseMimeType: "application/json",
            }
        });

        const approxCharCount = dataString.length;

        const requestPrompt = `
SYSTEM PROMPT:
${SYSTEM_PROMPT}

USER REQUEST:
Analyze the following CV data. Total character count: ${approxCharCount}.
Compute the optimal typography JSON so this content fills exactly 2 A4 pages.

CV DATA:
${dataString}
`;

        const result = await model.generateContent(requestPrompt);
        const response = await result.response;
        const text = response.text();

        // Ensure we extract only JSON if the model ignores the mimeType instruction somehow
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid output format from AI Typesetting Orchestrator.");
        }

        const config = JSON.parse(jsonMatch[0]);
        console.log("AI Typesetting Config Generated:", config);

        // ── Save to cache ──
        localStorage.setItem(CACHE_KEY, JSON.stringify({ hash: contentHash, config }));

        return config;

    } catch (error) {
        console.error("AI Typesetting Error:", error);

        // Fallback to safe, medium default config if API fails
        console.warn("Falling back to default tight-medium typography.");
        return {
            margin_lr: 22,
            margin_tb: 22,
            fontSize_body: 9.8,
            fontSize_name: 24,
            fontSize_heading: 10.5,
            lineGap_body: 2.5,
            margin_section: 15,
            margin_entry: 10
        };
    }
};
