// test-ai.js — Run with: node test-ai.js
// Reads the API key from .env and tests gemini-2.0-flash

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";

// --- Parse .env manually (no dotenv needed) ---
const envFile = readFileSync(".env", "utf-8");
const apiKey = envFile
    .split("\n")
    .find((l) => l.startsWith("VITE_GEMINI_API_KEY="))
    ?.split("=")[1]
    ?.trim();

if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY not found in .env");
    process.exit(1);
}

console.log(`✔ API Key loaded: ${apiKey.slice(0, 10)}...`);
console.log("🚀 Testing gemini-2.0-flash ...\n");

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const result = await model.generateContent(
    "Reply with exactly: AI_ENGINE_OK"
);
const text = result.response.text().trim();

if (text.includes("AI_ENGINE_OK")) {
    console.log("✅ SUCCESS — Gemini API is working correctly.");
    console.log(`   Model response: "${text}"`);
} else {
    console.warn("⚠️  Unexpected response (but API did respond):");
    console.warn(`   "${text}"`);
}
