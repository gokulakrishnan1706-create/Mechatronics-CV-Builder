/**
 * ai.js — GokulCV AI Layer v2.0
 * Primary:  Groq (gpt-oss-120b) — fast, free, reliable
 * Fallback: OpenRouter (llama-3.3-70b free) — automatic backup
 *
 * CV Writing Algorithm baked in:
 * - Strong UK action verbs, quantified achievements
 * - No buzzwords, no first-person, no AI clichés
 * - ATS keyword optimisation + JD tailoring
 * - Sector-specific language, seniority mirroring
 * - Natural human tone, short punchy sentences
 */

// ─────────────────────────────────────────────────────────────
// MECHATRONICS TAXONOMY (ATS scoring)
// ─────────────────────────────────────────────────────────────
export const MECHATRONICS_TAXONOMY = {
    'CAD':                ['SolidWorks', 'AutoCAD', 'CATIA', 'Creo', 'NX', 'Fusion 360', 'Inventor'],
    'Controls':           ['PLC', 'SCADA', 'PID', 'Allen Bradley', 'Siemens', 'Beckhoff', 'HMI', 'Ladder Logic'],
    'Robotics':           ['ROS', 'Kinematics', 'FANUC', 'KUKA', 'ABB', 'UR', 'Cobots', 'Path Planning'],
    'Programming':        ['C++', 'Python', 'MATLAB', 'Simulink', 'C', 'IEC 61131-3', 'Embedded C'],
    'Electronics':        ['PCB Design', 'Altium', 'Eagle', 'KiCad', 'Microcontrollers', 'Arduino', 'Raspberry Pi', 'FPGA'],
    'Systems Engineering':['FMEA', 'SysML', 'Requirements Engineering', 'MBSE', 'Validation'],
    'Sensors & Actuators':['Lidar', 'Encoders', 'Servos', 'Stepper Motors', 'Pneumatics', 'Hydraulics'],
};

// ─────────────────────────────────────────────────────────────
// IMPACT SCORE CALCULATOR
// ─────────────────────────────────────────────────────────────
export const calculateImpactScore = (resumeText) => {
    const metricsRegex = /\b(\d+(?:\.\d+)?(?:%|\$|£|mm|cm|m|kg|g|ms|s|hours|hrs|mins|k|M|B)?)\b/gi;
    const actionVerbs  = /\b(Led|Delivered|Achieved|Drove|Developed|Designed|Engineered|Reduced|Increased|Optimised|Implemented|Managed|Automated|Resolved|Built|Executed|Deployed|Streamlined|Improved|Launched|Negotiated|Trained|Mentored|Secured|Generated)\b/gi;
    const metricsCount = (resumeText.match(metricsRegex) || []).length;
    const verbsCount   = (resumeText.match(actionVerbs)  || []).length;
    return Math.min(20, Math.round((metricsCount * 1.5) + (verbsCount * 0.5)));
};

// ─────────────────────────────────────────────────────────────
// CV WRITING ALGORITHM — the "brain" injected into every call
// ─────────────────────────────────────────────────────────────
const CV_WRITING_ALGORITHM = `
You are a world-class UK CV writer. Every word must pass ALL of these rules:

TONE & VOICE:
- Natural human tone — confident professional, not robotic
- Third-person implied: never use "I", "my", "me" anywhere
- Short punchy sentences — aim for under 20 words per bullet
- Never start two consecutive bullets with the same verb
- Match seniority: junior = eager and developing, senior = authoritative and strategic

REQUIRED ACTION VERBS (start every bullet with one):
Delivered, Led, Achieved, Drove, Built, Deployed, Streamlined, Improved, Reduced, Increased,
Managed, Developed, Designed, Executed, Launched, Resolved, Implemented, Negotiated,
Trained, Mentored, Secured, Generated, Optimised, Automated

QUANTIFICATION RULES:
- Every bullet must contain at least one number, %, £ value, or time metric
- Use realistic estimates with qualifiers if no metric exists in source data
- Format: % for percentages, £ for money (UK), plain numbers for counts

BANNED WORDS — never use these:
passionate about, synergy, leverage, utilise, dynamic, proactive, go-getter, results-driven,
detail-oriented, team player, hard worker, motivated, dedicated, delve, embark,
stakeholder engagement, value-add, bandwidth, paradigm, holistic, thought leader,
innovative thinker, best-in-class, cutting-edge, spearheaded, world-class

UK ENGLISH:
- Spelling: optimised, organised, recognised, analyse, colour, centre
- Currency: £ not $
- Dates: "Jan 2024 – Present" format

COMPOUND WORDS:
- Never fuse compound words or phrases into single words. Always preserve spaces and hyphens exactly as standard UK English requires.
- WRONG: healthandsafety, safetycritical, fastpaced, handson, firsttime
- RIGHT: health and safety, safety-critical, fast-paced, hands-on, first-time

HYPHENS:
- Always hyphenate compound modifiers before nouns (safety-critical, health-and-safety, first-time, closed-loop, fast-paced, high-voltage)
- Always hyphenate fused technical compounds (pressure-cycling, root-cause, start-up, cross-functional)
- Preserve all hyphens in model numbers and standards references (S7-1200, IEC 62061, ISO 13849)
- Never fuse two words that should be hyphenated into a single word. Examples: safety-critical, fast-paced, hands-on, first-time, closed-loop, real-time, root-cause, start-up, pressure-cycling, cross-functional

PERSONAL STATEMENT RULES:
- Max 60 words, 3 sentences maximum
- Structure: [Who you are] + [What you bring] + [Value to this employer]
- End with a clear value proposition
- No first-person, no buzzwords, specific and compelling

ATS OPTIMISATION:
- When JD provided: weave in exact JD keywords naturally — no keyword stuffing
- Match the JD terminology exactly
- Include sector-specific technical terms

SECTOR LANGUAGE:
- Warehouse: throughput, SLA, pick accuracy, WMS, despatch, inbound/outbound
- Care: person-centred, dignity-led, safeguarding, care plans, wellbeing
- Hospitality: covers, upselling, front-of-house, licencing, service periods
- Retail: footfall, conversion, KPIs, visual merchandising, till reconciliation
- Kitchen: HACCP, allergens, mise en place, covers, food hygiene
- Freelance: deliverables, client brief, scope, turnaround, retainer

CRITICAL: Return ONLY raw JSON. No markdown. No code blocks. No explanation.
`;

// ─────────────────────────────────────────────────────────────
// GROQ CLIENT (primary)
// ─────────────────────────────────────────────────────────────
const callGroq = async (messages, systemPrompt) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_KEY_MISSING');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.4,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) throw new Error('RATE_LIMIT');
        if (res.status === 401) throw new Error('GROQ_KEY_INVALID');
        throw new Error(`GROQ_ERROR_${res.status}: ${err?.error?.message || 'Unknown'}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
};

// ─────────────────────────────────────────────────────────────
// OPENROUTER CLIENT (fallback)
// ─────────────────────────────────────────────────────────────
const callOpenRouter = async (messages, systemPrompt) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_KEY_MISSING');

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://gokulcv.app',
            'X-Title': 'GokulCV',
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.4,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`OPENROUTER_ERROR_${res.status}: ${err?.error?.message || 'Unknown'}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
};

// ─────────────────────────────────────────────────────────────
// UNIFIED AI CALL — Groq first, OpenRouter fallback
// ─────────────────────────────────────────────────────────────
const callAI = async (messages, systemPrompt) => {
    try {
        const result = await callGroq(messages, systemPrompt);
        console.log('[GokulCV AI] Provider: Groq ✓');
        return result;
    } catch (err) {
        const shouldFallback = ['RATE_LIMIT', 'GROQ_KEY_MISSING'].includes(err.message) || err.message.startsWith('GROQ_ERROR');
        if (!shouldFallback) throw err;
        console.warn('[GokulCV AI] Groq failed:', err.message, '→ trying OpenRouter...');
    }

    try {
        const result = await callOpenRouter(messages, systemPrompt);
        console.log('[GokulCV AI] Provider: OpenRouter fallback ✓');
        return result;
    } catch (err) {
        console.error('[GokulCV AI] Both providers failed:', err.message);
        throw new Error('Both AI providers are unavailable. Check your API keys in .env and try again.');
    }
};

// ─────────────────────────────────────────────────────────────
// ENTITY SANITISER — strips HTML entities from AI output
// ─────────────────────────────────────────────────────────────
export const decodeEntities = (str) => {
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

export const sanitiseDeep = (obj) => {
    if (typeof obj === 'string') return decodeEntities(obj);
    if (Array.isArray(obj)) return obj.map(sanitiseDeep);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, sanitiseDeep(v)])
        );
    }
    return obj;
};

// ─────────────────────────────────────────────────────────────
// JSON PARSER
// ─────────────────────────────────────────────────────────────
const parseJSON = (text) => {
    const clean = text.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) throw new Error('AI returned no JSON. Please try again.');
    return sanitiseDeep(JSON.parse(clean.substring(start, end + 1)));
};

// ─────────────────────────────────────────────────────────────
// MAIN: tailorResume
// ─────────────────────────────────────────────────────────────
export const tailorResume = async (resumeData, jobDescription) => {
    const systemPrompt = CV_WRITING_ALGORITHM + `

Return this exact JSON structure — no other text:
{
  "semanticScore": 85,
  "foundSkills": ["skill1"],
  "missingCrucialSkills": ["skill2"],
  "impactCritique": "Brief critique",
  "contextualSuggestions": [{ "target": "Bullet 3", "suggestion": "..." }],
  "personal": { "name": "", "location": "", "phone": "", "email": "", "linkedin": "" },
  "personal_profile": "3-sentence profile per algorithm rules.",
  "education": [{ "degree": "", "institution": "", "period": "", "bullets": [""] }],
  "professional_qualifications": [{ "category": "", "skills": "" }],
  "work_experience": [{
    "role": "", "company": "", "period": "",
    "context": "One-line role context",
    "achievements": ["Verb-led bullet with metric", "Another bullet"]
  }],
  "extra_curricular": [{ "role": "", "organization": "", "period": "", "bullets": [""] }]
}

Ensure all text values contain proper spacing between words.
Never concatenate words that should be separate or hyphenated.`;

    const userMessage = `MASTER CV DATA:\n${JSON.stringify(resumeData)}\n\nTARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 6000)}\n\nApply the CV Writing Algorithm fully. Return raw JSON only.`;

    try {
        const raw    = await callAI([{ role: 'user', content: userMessage }], systemPrompt);
        const parsed = parseJSON(raw);

        // ── ATS Score ──
        const resumeStr   = JSON.stringify(resumeData);
        const impactScore = calculateImpactScore(resumeStr);
        const jdLower     = jobDescription.toLowerCase();
        const resLower    = resumeStr.toLowerCase();

        let ontologyMatches = 0, requiredCategories = 0;
        for (const [cat, synonyms] of Object.entries(MECHATRONICS_TAXONOMY)) {
            const inJD = synonyms.some(s => jdLower.includes(s.toLowerCase())) || jdLower.includes(cat.toLowerCase());
            if (inJD) {
                requiredCategories++;
                if (synonyms.some(s => resLower.includes(s.toLowerCase())) || resLower.includes(cat.toLowerCase())) {
                    ontologyMatches++;
                }
            }
        }

        const ontologyScore    = requiredCategories > 0 ? Math.round((ontologyMatches / requiredCategories) * 40) : 40;
        const llmSemantic      = parsed.semanticScore || 80;
        const finalMatchScore  = Math.min(100, Math.round(llmSemantic * 0.4) + ontologyScore + impactScore);

        parsed.match_score      = finalMatchScore;
        parsed.missing_keywords = parsed.missingCrucialSkills || [];
        parsed.extra_metrics    = {
            semanticScore:         llmSemantic,
            impactScore,
            ontologyScore,
            impactCritique:        parsed.impactCritique,
            contextualSuggestions: parsed.contextualSuggestions || [],
        };

        return parsed;

    } catch (error) {
        console.error('[GokulCV] tailorResume error:', error);
        if (error.message?.includes('KEY_INVALID') || error.message?.includes('API key')) {
            throw new Error('Invalid API key. Check VITE_GROQ_API_KEY in your .env file.');
        }
        if (error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
            throw new Error('Rate limit hit. Wait a few seconds and try again.');
        }
        if (error.message?.includes('JSON')) {
            throw new Error('AI returned malformed data. Try again — usually transient.');
        }
        throw error;
    }
};
