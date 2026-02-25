import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const MECHATRONICS_TAXONOMY = {
  "CAD": ["SolidWorks", "AutoCAD", "CATIA", "Creo", "NX", "Fusion 360", "Inventor"],
  "Controls": ["PLC", "SCADA", "PID", "Allen Bradley", "Siemens", "Beckhoff", "Automation", "HMI", "Ladder Logic"],
  "Robotics": ["ROS", "Kinematics", "FANUC", "KUKA", "ABB", "UR", "Cobots", "Path Planning"],
  "Programming": ["C++", "Python", "MATLAB", "Simulink", "C", "IEC 61131-3", "Embedded C"],
  "Electronics": ["PCB Design", "Altium", "Eagle", "KiCad", "Microcontrollers", "Arduino", "Raspberry Pi", "FPGA", "VHDL", "Verilog"],
  "Systems Engineering": ["FMEA", "SysML", "Requirements Engineering", "MBSE", "Validation"],
  "Sensors & Actuators": ["Lidar", "Encoders", "Servos", "Stepper Motors", "Pneumatics", "Hydraulics"]
};

export const calculateImpactScore = (resumeText) => {
  const metricsRegex = /\b(\d+(?:\.\d+)?(?:%|\$|mm|cm|m|kg|g|ms|s|hours|hrs|mins|k|M|B)?)\b/gi;
  const actionVerbs = /\b(Led|Developed|Designed|Engineered|Reduced|Increased|Optimized|Implemented|Spearheaded|Managed|Automated|Resolved|Built|Created|Executed|Delivered)\b/gi;

  const metricsCount = (resumeText.match(metricsRegex) || []).length;
  const verbsCount = (resumeText.match(actionVerbs) || []).length;

  // Max out impact points at 20
  const impactScore = Math.min(20, (metricsCount * 1.5) + (verbsCount * 0.5));
  return Math.round(impactScore);
};

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
Return a complete JSON object matching the exact structure below. All text fields should contain your newly synthesized, human-sounding narrative.

{
  "semanticScore": 85,
  "foundSkills": ["SolidWorks", "Python"],
  "missingCrucialSkills": ["PLC Programming"],
  "impactCritique": "Bullet 2 lacks quantifiable metrics.",
  "contextualSuggestions": [
    {
      "target": "Experience Bullet 3",
      "suggestion": "Rewrite to include Agile Methodology: 'Led cross-functional Agile team to...'"
    }
  ],
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
    const parsedJSON = JSON.parse(jsonString);

    // Proprietary Math: Compute Impact & Ontology ATS Score
    const resumeTextStr = JSON.stringify(resumeData);
    const impactScore = calculateImpactScore(resumeTextStr);

    let ontologyMatches = 0;
    let requiredCategories = 0;
    const jdLower = jobDescription.toLowerCase();
    const resumeLower = resumeTextStr.toLowerCase();

    for (const [category, synonyms] of Object.entries(MECHATRONICS_TAXONOMY)) {
      const isCategoryInJD = synonyms.some(syn => jdLower.includes(syn.toLowerCase())) || jdLower.includes(category.toLowerCase());
      if (isCategoryInJD) {
        requiredCategories++;
        const isCategoryInResume = synonyms.some(syn => resumeLower.includes(syn.toLowerCase())) || resumeLower.includes(category.toLowerCase());
        if (isCategoryInResume) {
          ontologyMatches++;
        }
      }
    }

    // Base match score from ontology (0 to 40 points)
    const ontologyScore = requiredCategories > 0 ? Math.round((ontologyMatches / requiredCategories) * 40) : 40;

    // Semantic Score from LLM (0 to 100) mapped to 40 points
    const llmSemanticScore = parsedJSON.semanticScore || 80;
    const semanticContribution = Math.round(llmSemanticScore * 0.4);

    // Final Next-Gen ATS Score out of 100
    const finalMatchScore = Math.min(100, semanticContribution + ontologyScore + impactScore);

    // Inject the final algorithm metrics backward into the parsedJSON
    // App.jsx will automatically collect these via destructuring
    parsedJSON.match_score = finalMatchScore;
    parsedJSON.missing_keywords = parsedJSON.missingCrucialSkills || [];

    parsedJSON.extra_metrics = {
      semanticScore: llmSemanticScore,
      impactScore,
      ontologyScore,
      impactCritique: parsedJSON.impactCritique,
      contextualSuggestions: parsedJSON.contextualSuggestions || []
    };

    return parsedJSON;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
