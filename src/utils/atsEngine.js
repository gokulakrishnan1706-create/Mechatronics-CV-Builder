// atsEngine.js
// Hybrid ATS scoring engine: fast JS structural checks + Groq semantic intelligence
// No pure string-match guesswork — Groq understands language the way a real recruiter would

import {
  UK_SYNONYMS,
  PART_TIME_SIGNALS,
  FULL_TIME_SIGNALS,
  FORMAT_SECTIONS,
  SOFT_SKILLS_LIST,
  IDF_WEIGHTS
} from './atsKeywords.js';

// ─────────────────────────────────────────────
// LAYER 1: Fast structural JS analysis (~50ms)
// ─────────────────────────────────────────────

export function detectJobType(jdText) {
  const lower = jdText.toLowerCase();
  const ptHits = PART_TIME_SIGNALS.filter(s => lower.includes(s)).length;
  const ftHits = FULL_TIME_SIGNALS.filter(s => lower.includes(s)).length;
  if (ptHits >= 2 && ptHits > ftHits) return 'part-time';
  if (ftHits >= 2) return 'full-time';
  return ptHits > 0 ? 'part-time' : 'full-time';
}

export function checkCVFormat(cvText) {
  const results = {
    score: 0,
    maxScore: 15,
    checks: {},
    missing: []
  };

  // Check sections present
  const foundSections = FORMAT_SECTIONS.filter(section =>
    section.patterns.some(p => p.test(cvText))
  );
  const missingSections = FORMAT_SECTIONS.filter(section =>
    !section.patterns.some(p => p.test(cvText))
  ).map(s => s.name);

  results.checks.sections = {
    found: foundSections.map(s => s.name),
    missing: missingSections,
    score: Math.round((foundSections.length / FORMAT_SECTIONS.length) * 6)
  };

  // Contact info
  const hasEmail = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(cvText);
  const hasPhone = /(\+44|0)[\d\s\-()]{9,13}/.test(cvText);
  results.checks.contact = { hasEmail, hasPhone, score: (hasEmail ? 2 : 0) + (hasPhone ? 1 : 0) };

  // Length check (ideal: 300-800 words)
  const wordCount = cvText.trim().split(/\s+/).length;
  const goodLength = wordCount >= 200 && wordCount <= 900;
  results.checks.length = { wordCount, goodLength, score: goodLength ? 2 : 1 };

  // No suspicious formatting (tables, columns mangle ATS parsing)
  const suspiciousPatterns = /\|{2,}|\t{3,}|_{10,}/.test(cvText);
  results.checks.formatting = { clean: !suspiciousPatterns, score: !suspiciousPatterns ? 2 : 0 };

  // Has skills section
  const hasSkills = /skills|competencies|expertise/i.test(cvText);
  results.checks.skillsSection = { present: hasSkills, score: hasSkills ? 2 : 0 };

  // Calculate total
  results.score = Object.values(results.checks).reduce((sum, c) => sum + (c.score || 0), 0);
  results.score = Math.min(results.score, results.maxScore);

  // Missing items for suggestions
  if (missingSections.length > 0) results.missing.push(...missingSections.map(s => `Add a ${s} section`));
  if (!hasEmail) results.missing.push('Add your email address');
  if (!hasPhone) results.missing.push('Add your phone number');
  if (!goodLength) {
    if (wordCount < 200) results.missing.push('CV is too short — aim for 300–500 words');
    if (wordCount > 900) results.missing.push('CV is too long — trim to 1–2 pages');
  }
  if (!hasSkills) results.missing.push('Add a dedicated Skills section');

  return results;
}

export function quickKeywordScan(cvText, jdText) {
  // Fast pre-scan before AI call — gives user instant partial feedback
  const cvLower = cvText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  const foundQuick = [];
  const missedQuick = [];

  Object.entries(UK_SYNONYMS).forEach(([primary, synonyms]) => {
    const allTerms = [primary, ...synonyms];
    const inJD = allTerms.some(t => jdLower.includes(t));
    if (!inJD) return;

    const inCV = allTerms.some(t => cvLower.includes(t));
    const weight = IDF_WEIGHTS[primary] || 1.0;

    if (inCV) {
      foundQuick.push({ keyword: primary, weight });
    } else {
      missedQuick.push({ keyword: primary, weight });
    }
  });

  return { foundQuick, missedQuick };
}

// ─────────────────────────────────────────────
// LAYER 2: Groq semantic analysis (~1-2s)
// ─────────────────────────────────────────────

const GROQ_SYSTEM_PROMPT = `You are an expert UK ATS recruiter and CV analyst with 15 years of experience screening CVs for UK employers across all sectors. You understand:
- UK spelling and terminology (organisation, colour, behaviour, centre, labour)
- UK qualifications (NVQ, GCSE, A-Levels, HNC, HND, Apprenticeships)
- UK part-time job market (warehouse, retail, hospitality, care work, security)
- How real ATS systems score and filter CVs
- The difference between ATS optimisation and keyword stuffing

You analyse CVs against job descriptions with the precision of a real recruiter. You never guess — if a skill is implied but not stated, it counts as MISSING.

IMPORTANT: Always return valid JSON only. No markdown, no explanation outside the JSON.`;

function buildScoringPrompt(cvText, jdText, jobType, formatScore) {
  const weights = jobType === 'part-time'
    ? {
        keywordMatch: 25,
        skillsAlignment: 25,
        flexibilitySignals: 20,
        experienceRelevance: 15,
        formatStructure: 15
      }
    : {
        keywordMatch: 30,
        hardSkillsMatch: 25,
        experienceAlignment: 25,
        educationCerts: 10,
        formatStructure: 10
      };

  const partTimeExtra = jobType === 'part-time' ? `
PART-TIME SPECIFIC CHECKS:
- Does the CV mention availability (hours, weekends, evenings, shifts)?
- Are transferable skills highlighted (customer service, cash handling, teamwork)?
- Is there a clear indication of flexibility?
- Does the CV avoid over-qualifying for the role?` : `
FULL-TIME SPECIFIC CHECKS:
- Does the CV show career progression?
- Are years of experience clearly stated?
- Do qualifications match the requirements?
- Are hard technical skills explicitly listed?`;

  return `Analyse this CV against the job description. Job type: ${jobType.toUpperCase()}.

The format/structure score has already been calculated: ${formatScore}/15 (do NOT recalculate this).

${partTimeExtra}

SCORING WEIGHTS:
${JSON.stringify(weights, null, 2)}

CV TEXT:
---
${cvText.slice(0, 3000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 2000)}
---

Return ONLY this JSON structure (no markdown, no extra text):
{
  "overallScore": <weighted total 0-100, integer>,
  "breakdown": {
    ${jobType === 'part-time' ? `
    "keywordMatch": { "score": <0-25>, "maxScore": 25, "label": "Keyword Match" },
    "skillsAlignment": { "score": <0-25>, "maxScore": 25, "label": "Skills Alignment" },
    "flexibilitySignals": { "score": <0-20>, "maxScore": 20, "label": "Flexibility & Availability" },
    "experienceRelevance": { "score": <0-15>, "maxScore": 15, "label": "Experience Relevance" },
    "formatStructure": { "score": ${formatScore}, "maxScore": 15, "label": "Format & Structure" }
    ` : `
    "keywordMatch": { "score": <0-30>, "maxScore": 30, "label": "Keyword Match" },
    "hardSkillsMatch": { "score": <0-25>, "maxScore": 25, "label": "Hard Skills Match" },
    "experienceAlignment": { "score": <0-25>, "maxScore": 25, "label": "Experience Alignment" },
    "educationCerts": { "score": <0-10>, "maxScore": 10, "label": "Education & Certifications" },
    "formatStructure": { "score": ${formatScore}, "maxScore": 10, "label": "Format & Structure" }
    `}
  },
  "matchedKeywords": [
    { "keyword": "<term>", "importance": "high|medium|low", "foundIn": "skills|experience|summary|education" }
  ],
  "missingKeywords": [
    { "keyword": "<exact term from JD>", "importance": "high|medium|low", "reason": "<why it matters>", "timesInJD": <number> }
  ],
  "suggestions": [
    { "priority": "high|medium|low", "action": "<specific actionable advice in UK English>", "example": "<optional: show example wording>" }
  ],
  "verdict": "<2-3 sentence honest assessment of the CV's chances>",
  "detectedSector": "<warehouse|manufacturing|engineering|healthcare|retail|hospitality|careWork|security|office|other>"
}`;
}

export async function runGroqAnalysis(cvText, jdText, jobType, formatScore) {
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  const prompt = buildScoringPrompt(cvText, jdText, jobType, formatScore);

  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            { role: 'system', content: GROQ_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0]?.message?.content || '';
        return parseAIResponse(text, formatScore);
      }
    } catch (err) {
      console.warn('Groq failed, trying OpenRouter...', err);
    }
  }

  // Fallback: OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'GokulCV ATS Scorer'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: GROQ_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0]?.message?.content || '';
        return parseAIResponse(text, formatScore);
      }
    } catch (err) {
      console.error('OpenRouter also failed:', err);
    }
  }

  throw new Error('All AI providers failed. Please check your API keys.');
}

function parseAIResponse(text, formatScore) {
  try {
    // Strip markdown code blocks if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    // Validate required fields exist
    if (!parsed.overallScore || !parsed.breakdown || !parsed.matchedKeywords) {
      throw new Error('Invalid response structure');
    }

    // Clamp score to 0-100
    parsed.overallScore = Math.min(100, Math.max(0, Math.round(parsed.overallScore)));

    return parsed;
  } catch (err) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Could not parse scoring results. Please try again.');
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT: Full analysis pipeline
// ─────────────────────────────────────────────

export async function analyseCV(cvText, jdText, jobTypeOverride = null) {
  if (!cvText || cvText.trim().length < 50) {
    throw new Error('CV text is too short. Please upload a valid CV.');
  }
  if (!jdText || jdText.trim().length < 50) {
    throw new Error('Please paste the full job description.');
  }

  // Step 1: Auto-detect job type (can be overridden by user)
  const detectedJobType = jobTypeOverride || detectJobType(jdText);

  // Step 2: Fast structural check (instant)
  const formatResult = checkCVFormat(cvText);

  // Step 3: Quick keyword pre-scan (instant feedback while AI loads)
  const quickScan = quickKeywordScan(cvText, jdText);

  // Step 4: Groq semantic analysis (the intelligence layer)
  const aiResult = await runGroqAnalysis(cvText, jdText, detectedJobType, formatResult.score);

  // Step 5: Merge everything
  return {
    jobType: detectedJobType,
    overallScore: aiResult.overallScore,
    breakdown: aiResult.breakdown,
    matchedKeywords: aiResult.matchedKeywords || [],
    missingKeywords: aiResult.missingKeywords || [],
    suggestions: [
      // Format suggestions first (from JS layer)
      ...formatResult.missing.map(action => ({ priority: 'high', action, example: null })),
      // Then AI suggestions
      ...(aiResult.suggestions || [])
    ],
    verdict: aiResult.verdict || '',
    detectedSector: aiResult.detectedSector || 'other',
    formatDetails: formatResult.checks,
    quickScan,
    // Score interpretation
    rating: scoreRating(aiResult.overallScore)
  };
}

function scoreRating(score) {
  if (score >= 85) return { label: 'Excellent', color: '#22c55e', desc: 'Very likely to pass ATS screening' };
  if (score >= 70) return { label: 'Good', color: '#84cc16', desc: 'Good chance — minor improvements recommended' };
  if (score >= 50) return { label: 'Needs Work', color: '#f59e0b', desc: 'Significant improvements needed before applying' };
  return { label: 'Poor Match', color: '#ef4444', desc: 'Major revisions required — consider if this role is right for you' };
}
