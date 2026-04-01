/**
 * partTimeAlgorithm.js — Shared CV Writing Algorithm for Part-Time CV Generation
 *
 * Single source of truth for all AI prompts in the Part-Time CV pipeline.
 * Used by: pdfExtract.js (PDF extraction), PartTimeCVGenerator.jsx (Vision + Polish)
 *
 * @depends SECTOR_CONFIGS from PartTimeCVGenerator.jsx (sector labels only)
 */

// ─────────────────────────────────────────────────────────────
// SECTOR LANGUAGE MAPS
// ─────────────────────────────────────────────────────────────

const SECTOR_LANGUAGE = {
    warehouse: {
        label: 'Warehouse & Logistics',
        terms: 'throughput, SLA, pick accuracy, WMS, despatch, inbound/outbound, pallet, FLT, PPE, goods-in, stock rotation, batch picking, loading bay',
        verbs: 'Operated, Loaded, Processed, Picked, Packed, Dispatched, Maintained, Completed, Achieved, Reduced, Managed, Secured, Sorted, Handled',
        metrics: 'orders per shift, pick accuracy %, pallets moved, despatch targets, stock discrepancy %, error rate, units per hour',
    },
    carehome: {
        label: 'Care Home & Support Work',
        terms: 'person-centred, dignity-led, safeguarding, care plans, wellbeing, medication round, handover, risk assessment, moving and handling, personal care',
        verbs: 'Supported, Provided, Maintained, Assisted, Administered, Monitored, Documented, Reported, Encouraged, Ensured, Promoted, Delivered',
        metrics: 'residents supported, care plans maintained, medication rounds completed, handover accuracy, safeguarding reports filed, training hours',
    },
    freelance: {
        label: 'Freelance & Gig Work',
        terms: 'deliverables, client brief, scope, turnaround, retainer, milestone, deadline, revision, portfolio, invoice',
        verbs: 'Delivered, Managed, Negotiated, Completed, Built, Designed, Launched, Produced, Scoped, Invoiced, Coordinated, Secured',
        metrics: 'projects completed, client retention %, on-time delivery %, revenue generated, review rating, turnaround time',
    },
    retail: {
        label: 'Retail & Customer Service',
        terms: 'footfall, conversion, KPIs, visual merchandising, till reconciliation, stock replenishment, upselling, customer satisfaction, planogram',
        verbs: 'Served, Processed, Resolved, Exceeded, Merchandised, Replenished, Recommended, Handled, Achieved, Trained, Managed, Upsold',
        metrics: 'customers served daily, till accuracy %, upsell targets %, complaint resolution rate, footfall conversion %, stock accuracy',
    },
    kitchen: {
        label: 'Kitchen & Catering',
        terms: 'HACCP, allergens, mise en place, covers, food hygiene, prep, service period, deep clean, temperature log, portion control',
        verbs: 'Prepared, Maintained, Completed, Supported, Operated, Cleaned, Managed, Delivered, Ensured, Served, Produced, Monitored',
        metrics: 'covers per service, food hygiene score, prep volume, temperature checks, dishes sent, waste reduction %',
    },
    hospitality: {
        label: 'Hospitality & Bar Work',
        terms: 'covers, upselling, front-of-house, licencing, service periods, Challenge 25, EPOS, cellar management, table turn, average spend',
        verbs: 'Served, Operated, Applied, Managed, Delivered, Upsold, Maintained, Handled, Processed, Exceeded, Resolved, Stocked',
        metrics: 'customers per shift, average spend per head, upsell %, till accuracy, covers served, complaint resolution rate',
    },
};

// ─────────────────────────────────────────────────────────────
// BANNED WORDS (shared across all prompts)
// ─────────────────────────────────────────────────────────────

export const BANNED_WORDS = [
    // Buzzwords and filler
    'passionate', 'passionate about', 'dynamic', 'exceptional', 'proactive',
    'synergy', 'leverage', 'utilise', 'spearheaded', 'collaborated',
    'demonstrated', 'hardworking', 'hard worker', 'dedicated', 'motivated',
    'team player', 'reliable', 'go-getter', 'results-driven', 'detail-oriented',
    'delve', 'embark', 'stakeholder engagement', 'value-add', 'bandwidth',
    'paradigm', 'holistic', 'thought leader', 'innovative thinker',
    'best-in-class', 'cutting-edge', 'world-class', 'self-starter',
    'proven track record', 'strong work ethic', 'attention to detail',
    'excellent communication skills',
    // Hollow AI intensifiers
    'effectively', 'efficiently', 'successfully', 'seamlessly',
    'significantly', 'substantially', 'tremendously',
    'consistently exceeded', 'consistently maintained',
    // AI-typical filler phrases
    'ensuring smooth operations', 'smooth running', 'day-to-day operations',
    'various tasks', 'multiple responsibilities', 'wide range of',
    'played a key role', 'played a vital role', 'played an integral role',
    'contributed to the overall', 'commitment to excellence',
    'both independently and as part of a team',
    'in a fast-paced environment',
];

// ─────────────────────────────────────────────────────────────
// CORE ALGORITHM — sector-aware CV writing rules
// ─────────────────────────────────────────────────────────────

export const getPartTimeAlgorithm = (sector = 'warehouse') => {
    const s = SECTOR_LANGUAGE[sector] || SECTOR_LANGUAGE.warehouse;

    return `You are a world-class UK CV writer specialising in part-time ${s.label} roles.
Every word you write must follow ALL of these rules without exception:

HUMAN VOICE — THIS IS THE MOST IMPORTANT SECTION:
Your writing must be indistinguishable from a skilled human CV writer. Follow these anti-AI rules strictly:
- Write like a real recruitment consultant who has edited 10,000 CVs — direct, specific, no fluff
- VARY your sentence structures. Mix short punchy fragments with slightly longer ones. Not every bullet should follow the same "Verb + object + metric" template
- Use NATURAL connectors sparingly: "whilst", "across", "within", "contributing to", "resulting in" — but never the same connector twice in a row
- Include IMPERFECT but real-sounding details: specific department names, shift patterns ("during peak Saturday shifts"), realistic tools ("using handheld RF scanner"), actual processes ("following COSHH protocols")
- NEVER use hollow intensifiers: "effectively", "efficiently", "successfully", "seamlessly", "consistently", "significantly", "substantially"
- NEVER use list-like constructions: "including A, B, and C" at the end of every bullet — use them sparingly, max once per job
- Vary bullet lengths: some 10 words, some 18 words — NOT all the same length
- Occasionally start a bullet with a gerund (e.g. "Trained on...", "Covering...") or with context first ("During peak periods, processed...")
- Use contractions where natural in personal statements: "who's built", "with an eye for" — but keep bullets formal
- NEVER produce formulaic output where every bullet reads: "[Verb] [number] [things] achieving [percentage] [improvement]" — this pattern screams AI

ANTI-AI PATTERNS — NEVER use these constructions:
- "Demonstrated ability to..." or "Demonstrated strong..."
- "Played a key role in..."
- "Contributed to the overall..."
- "Ensuring smooth operations"
- "In a fast-paced environment" at the end of bullets (use "fast-paced" only as a modifier before a noun)
- "Various" or "multiple" as filler ("handled various tasks" → say WHAT tasks)
- "Able to work..." or "Capable of..."
- "Both independently and as part of a team"
- "Excellent interpersonal skills"
- "Strong attention to detail"
- Starting 3+ bullets with "Managed..." or "Supported..." — vary your verbs
- Lists of more than 3 items separated by commas in one bullet
- Ending every bullet with a metric — some bullets can describe a process or responsibility without a number

TONE & VOICE:
- Confident professional who knows their worth, not trying too hard to impress
- Third-person implied: NEVER use "I", "my", "me", "we" anywhere
- Short punchy sentences — aim for 10–20 words per bullet, but VARY the lengths
- Never start two consecutive bullets with the same word
- Match seniority to part-time/entry-level: capable and grounded — not executive or strategic
- Sound like someone who DOES the work, not someone who DESCRIBES the work

REQUIRED ACTION VERBS (start MOST bullets with one of these, but vary):
${s.verbs}

QUANTIFICATION — REALISTIC:
- Most bullets should contain a number, percentage, or measurable result — but not ALL
- 1–2 bullets per job can describe a process or responsibility without a metric
- Use REALISTIC numbers — don't inflate. Part-time workers don't "increase revenue by 40%"
- Good qualifiers: "up to", "approximately", "averaging", "around", "typically"
- Acceptable metrics for ${s.label}: ${s.metrics}
- WRONG: "Helped with stock management" — too vague
- WRONG: "Managed stock rotation for 2,000+ SKUs, reducing expired items by 12%, improving efficiency by 25%, and saving £10,000 annually" — too many metrics in one bullet, sounds AI-generated
- RIGHT: "Rotated stock for around 2,000 SKUs across two warehouse zones, flagging short-dated items for markdown"
- RIGHT: "Picked and packed 200+ orders per shift with near-zero error rate"

BANNED WORDS — NEVER use any of these (automatic rejection if found):
${BANNED_WORDS.join(', ')}

UK ENGLISH — mandatory:
- Spelling: organised (not organized), recognised, optimised, analyse, colour, centre, behaviour
- Currency: £ not $
- Date format: "Jan 2024 – Present"

COMPOUND WORDS & HYPHENS — CRITICAL:
- ALWAYS preserve spaces between separate words. Never fuse words together
- ALWAYS hyphenate compound modifiers before nouns: safety-critical, fast-paced, hands-on, first-time, part-time, full-time
- WRONG: "fastpaced", "healthandsafety", "handson", "selfmotivated"
- RIGHT: "fast-paced", "health and safety", "hands-on", "self-motivated"

PERSONAL STATEMENT RULES:
- 80–120 words, 3–4 sentences — this is the MOST IMPORTANT section of the CV, give it real substance
- Must sound like the PERSON wrote it with a recruiter's guidance, not like AI generated it
- Structure across sentences:
  Sentence 1: Who you are — role title, experience level, sector context (e.g. "Warehouse operative with 18 months' experience across goods-in and pick-and-pack operations at a high-volume fulfilment centre.")
  Sentence 2: What you've built — specific skills, tools used, or areas you've developed (e.g. "Trained on WMS systems and handheld RF scanners, with a consistent focus on pick accuracy and despatch targets.")
  Sentence 3: How you work — working style, environment fit, reliability (e.g. "Comfortable with physical, shift-based work and quick to adapt to changing priorities during peak periods.")
  Sentence 4: What you're looking for — value proposition tied to the role (e.g. "Seeking a part-time role where attention to process and steady output are valued.")
- Must read as ONE flowing narrative — each sentence should connect naturally to the next, not feel like a bullet-point list converted to prose
- No first-person (no I/my/me), no buzzwords, specific and grounded
- GOOD: "Warehouse operative with 18 months' experience across goods-in and pick-and-pack operations at a high-volume fulfilment centre. Trained on WMS systems and handheld RF scanners, with a consistent focus on pick accuracy and meeting daily despatch targets. Comfortable with physical, shift-based work and quick to adapt to changing priorities during peak periods. Seeking a part-time role where attention to process and steady output are valued."
- BAD: "A dedicated and hardworking individual with a proven track record in warehouse operations. Demonstrates exceptional organisational skills and a commitment to excellence. Eager to leverage strong work ethic in a dynamic warehouse environment."

NARRATIVE COHERENCE — THE CV MUST TELL ONE STORY:
- The personal statement sets the THEME of the CV — the same theme should flow through work experience bullets and skills
- If the personal statement mentions "pick accuracy", at least one bullet should demonstrate pick accuracy with a metric
- If the personal statement mentions a tool or system, the work experience should show WHERE it was used
- Skills should reinforce what the personal statement and bullets already describe — not introduce random new topics
- The reader should finish the CV feeling they understand this person's career story, not just a list of tasks

SECTOR-SPECIFIC LANGUAGE FOR ${s.label.toUpperCase()}:
Use these terms naturally where relevant: ${s.terms}

SKILLS ARRAY:
- Return 5–8 specific, ATS-friendly skills relevant to ${s.label}
- Each skill should be a concise phrase (2–5 words), not a sentence
- Include both hard skills and sector-specific competencies
- Never include vague skills like "good communicator" or "team player"

CRITICAL: Return ONLY raw JSON. No markdown. No code blocks. No explanation. No preamble.`;
};

// ─────────────────────────────────────────────────────────────
// EXTRACTION PROMPT — for PDF text (replaces pdfExtract's version)
// ─────────────────────────────────────────────────────────────

export const getExtractionPrompt = (cvText, jd = '', sector = 'warehouse') => {
    const algorithm = getPartTimeAlgorithm(sector);
    const s = SECTOR_LANGUAGE[sector] || SECTOR_LANGUAGE.warehouse;

    const tailorSection = jd.trim() ? `

JOB DESCRIPTION TO TAILOR FOR:
${jd.substring(0, 3000)}

TAILORING INSTRUCTIONS:
- Rewrite the personal statement to target THIS specific role
- Weave exact keywords from the JD naturally into bullet points — do NOT keyword-stuff
- Match the JD's terminology exactly (if JD says "stock control", use "stock control" not "inventory management")
- Add relevant skills from the JD to the skills array
- Prioritise the most relevant experience for this role
- Keep all personal details (name, email, phone, dates, company names) EXACTLY as they appear in the source CV` : '';

    return `${algorithm}

YOUR TASK: Extract and rewrite all content from this CV text for a part-time ${s.label} role.

SOURCE CV TEXT:
${cvText.substring(0, 6000)}
${tailorSection}

EXTRACTION RULES:
- Extract EVERY job, EVERY education entry — miss nothing
- Keep personal details (name, email, phone, location) EXACTLY as written — do NOT change them
- Keep company names, job titles, and date periods EXACTLY as written
- Rewrite ALL bullet points following the algorithm above (action verb + metric + result)
- If the original CV has no bullets for a job, create 2–3 based on the role title and company
- Write a compelling personal statement even if the original has none
- Extract or generate 5–8 specific skills for ${s.label}

Return ONLY this raw JSON structure:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "" },
  "objective": "Personal statement here",
  "skills": ["skill1", "skill2"],
  "work_experience": [{ "id": 1, "company": "", "role": "", "period": "", "bullets": ["Action verb + metric bullet"] }],
  "education": [{ "institution": "", "degree": "", "period": "" }]
}`;
};

// ─────────────────────────────────────────────────────────────
// VISION PROMPT — for image CVs (Gemini)
// ─────────────────────────────────────────────────────────────

export const getVisionPrompt = (jd = '', sector = 'warehouse') => {
    const algorithm = getPartTimeAlgorithm(sector);
    const s = SECTOR_LANGUAGE[sector] || SECTOR_LANGUAGE.warehouse;

    const tailorSection = jd.trim() ? `

ALSO tailor to this job description — weave its keywords naturally into bullets and the personal statement:
${jd.substring(0, 2000)}` : '';

    return `${algorithm}

YOUR TASK: Extract ALL information from this CV image and rewrite it for a part-time ${s.label} role.
${tailorSection}

EXTRACTION RULES:
- Read EVERY piece of text visible in the image
- Keep personal details, company names, job titles, dates EXACTLY as shown
- Rewrite all bullet points with action verbs and metrics per the algorithm above
- Write a personal statement if none exists
- Generate 5–8 sector-specific skills

Return ONLY this raw JSON:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "" },
  "objective": "Personal statement here",
  "skills": ["skill1", "skill2"],
  "work_experience": [{ "id": 1, "company": "", "role": "", "period": "", "bullets": ["Verb-led bullet with metric"] }],
  "education": [{ "institution": "", "degree": "", "period": "" }]
}`;
};

// ─────────────────────────────────────────────────────────────
// POLISH PROMPT — for rewriting individual sections
// ─────────────────────────────────────────────────────────────

export const getPolishPrompt = (target, data, sector = 'warehouse', atsFix = null) => {
    const algorithm = getPartTimeAlgorithm(sector);
    const s = SECTOR_LANGUAGE[sector] || SECTOR_LANGUAGE.warehouse;

    // ATS Fix instructions if applicable
    const atsSection = atsFix && atsFix.missingKeywords?.length
        ? `\n\nCRITICAL ATS FIX — these keywords MUST appear naturally in the rewritten text:
${atsFix.missingKeywords.join(', ')}
Rules: weave them in where the candidate's experience supports them. Do NOT keyword-stuff. Goal: improve ATS score from ${atsFix.previousScore}/100 to 85+/100.`
        : '';

    if (target === 'objective') {
        // Build context from work experience to ensure narrative coherence
        const jobContext = (data.work_experience || [])
            .filter(j => j.role?.trim() || j.company?.trim())
            .map(j => `${j.role} at ${j.company} (${j.period}): ${(j.bullets || []).filter(b => b.trim()).join('; ')}`)
            .join(' | ');

        return `${algorithm}${atsSection}

Rewrite this personal statement for a part-time ${s.label} role.
Requirements:
- 80–120 words, 3–4 flowing sentences that read as one natural narrative
- Sentence 1: Who they are (role, experience level, sector)
- Sentence 2: What they've built (specific skills, tools, areas developed)
- Sentence 3: How they work (style, environment, reliability)
- Sentence 4: What they seek (value proposition tied to ${s.label})
- Must connect naturally to this person's actual work experience below
- No first-person. No buzzwords. Specific and grounded.

Original statement: ${data.objective}

This person's work history for context (use this to make the statement authentic):
${jobContext || 'No work experience provided yet'}

Return ONLY the improved personal statement text. No JSON. No quotes. No explanation. Write the COMPLETE statement — do not cut it short.`;
    }

    // Target is a job index
    const job = data.work_experience[target];
    const bullets = (job.bullets || []).filter(b => b.trim());

    return `${algorithm}${atsSection}

Rewrite these bullet points for a ${s.label} role.
Same number of bullets (${bullets.length}). Each MUST start with a DIFFERENT action verb and contain at least one metric.

Role: ${job.role} at ${job.company} (${job.period})
Original bullets: ${JSON.stringify(bullets)}

Return ONLY a JSON array of strings. No markdown. No explanation.
Example: ["Processed 200+ orders daily achieving 99.5% pick accuracy", "Maintained warehouse safety standards across a 30,000 sq ft facility"]`;
};

// ─────────────────────────────────────────────────────────────
// OUTPUT VALIDATOR — repairs malformed AI responses
// ─────────────────────────────────────────────────────────────

export const validateCVOutput = (parsed) => {
    const result = { ...parsed };

    // Ensure personal object
    if (!result.personal || typeof result.personal !== 'object') {
        result.personal = { name: '', email: '', phone: '', location: '' };
    } else {
        result.personal = {
            name: result.personal.name || '',
            email: result.personal.email || '',
            phone: result.personal.phone || '',
            location: result.personal.location || '',
        };
    }

    // Ensure objective is a string
    if (typeof result.objective !== 'string') {
        result.objective = result.objective ? String(result.objective) : '';
    }
    result.objective = result.objective.trim();

    // Ensure skills is an array of non-empty strings
    if (!Array.isArray(result.skills)) {
        result.skills = [];
    }
    result.skills = result.skills
        .map(s => (typeof s === 'string' ? s.trim() : ''))
        .filter(s => s.length > 0);

    // Ensure work_experience is a valid array
    if (!Array.isArray(result.work_experience)) {
        result.work_experience = [];
    }
    result.work_experience = result.work_experience
        .filter(j => j && (j.role?.trim() || j.company?.trim()))
        .map((j, i) => ({
            id: j.id || Date.now() + i,
            company: (j.company || '').trim(),
            role: (j.role || '').trim(),
            period: (j.period || '').trim(),
            bullets: Array.isArray(j.bullets)
                ? j.bullets.map(b => (typeof b === 'string' ? b.trim() : '')).filter(b => b.length > 0)
                : [],
        }));

    // Ensure at least one job entry exists
    if (result.work_experience.length === 0) {
        result.work_experience = [{ id: Date.now(), company: '', role: '', period: '', bullets: [''] }];
    }

    // Ensure education is a valid array
    if (!Array.isArray(result.education)) {
        result.education = [];
    }
    result.education = result.education
        .filter(e => e && (e.institution?.trim() || e.degree?.trim()))
        .map(e => ({
            institution: (e.institution || '').trim(),
            degree: (e.degree || '').trim(),
            period: (e.period || '').trim(),
        }));

    // Strip banned words from objective (light pass)
    const bannedRegex = new RegExp(`\\b(${BANNED_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    if (result.objective) {
        result.objective = result.objective.replace(bannedRegex, '').replace(/\s{2,}/g, ' ').trim();
    }

    return result;
};
