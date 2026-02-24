import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Professional ATS Algorithm Prompt Engineering
 * Mimics industry-standard CV tailoring logic.
 */
const SYSTEM_PROMPT = `
You are a world-class Executive Career Strategist and Expert Copywriter specializing in Engineering.
Your mission is to synthesize a BRAND NEW, highly tailored CV that achieves two competing goals simultaneously:
1. ATS Optimization: Naturally integrate core technical keywords from the Job Description.
2. Compelling Human Narrative: Read like a confident, professional human executive. ZERO robotic fluff.

CRITICAL RULES:
- GROUNDING: You CANNOT invent new jobs, degrees, companies, or metrics. You can only reframe, emphasize, and highlight the existing facts to match the JD.
- PERSONA: Crisp, authoritative, metric-driven engineering professional. Do not use common AI cliches (e.g., "Spearheaded", "Dynamic", "Passionate about", "Delve", "Embark").
- TOTAL REWRITE: Rewrite the Profile, Experience bullets, and Project descriptions to align with the JD's core needs, but keep the core truth intact.

OUTPUT SPECIFICATIONS (JSON ONLY):
Return a complete JSON object matching the exact structure below. All text fields should contain your newly synthesized, human-sounding narrative. Include a match_score and missing_keywords for feedback.

{
  "match_score": number (0-100),
  "missing_keywords": ["keyword1", "keyword2"],
  "personal": {
    "name": "string", "location": "string", "phone": "string", "email": "string", "linkedin": "string"
  },
  "personal_profile": "A deeply compelling, human-sounding mission statement. No AI cliches.",
  "education": [
    { "degree": "string", "institution": "string", "period": "string", "bullets": ["string"] }
  ],
  "professional_qualifications": [
    { "category": "string", "skills": "string" }
  ],
  "work_experience": [
    {
      "role": "string", "company": "string", "period": "string",
      "context": "Short contextual intro",
      "achievements": [ "High-impact, metric-driven, human-sounding bullet 1", "Bullet 2" ]
    }
  ],
  "extra_curricular": [
    { "role": "string", "organization": "string", "period": "string", "bullets": ["string"] }
  ]
}
`;

export const tailorResume = async (resumeData, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `
INPUT MASTER RESUME DATA:
${JSON.stringify(resumeData)}

TARGET JOB DESCRIPTION:
${jobDescription.substring(0, 8000)}

Perform a Total Synthesis and return the specific JSON structure requested. DO NOT wrap the output in markdown code blocks. Just return the raw JSON object. Never invent facts.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Sanitize response: reliably extract the JSON object between the first '{' and last '}'
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON structure found in AI response");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
