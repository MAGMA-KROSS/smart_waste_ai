/**
 * ai-llm-service/services/gemini.service.js
 *
 * SERVER-ONLY. Wraps the Gemini API. Never throws to its caller - returns
 * null on any failure/missing key so classifyWaste()/getRecyclingRecommendations()
 * can degrade gracefully (per the AI service's own documented contract).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildWasteRecommendationPrompt } from "../prompts/wastePrompts.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function validateShape(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  const upcyclingIdeas = Array.isArray(parsed.upcyclingIdeas)
    ? parsed.upcyclingIdeas
        .filter((i) => i && typeof i.title === "string")
        .slice(0, 3)
        .map((i) => ({
          title: String(i.title).slice(0, 80),
          difficulty: ["Easy", "Medium", "Hard"].includes(i.difficulty) ? i.difficulty : "Easy",
          description: String(i.description || "").slice(0, 240),
        }))
    : [];

  return {
    recyclingRecommendation: String(parsed.recyclingRecommendation || "").slice(0, 400),
    upcyclingIdeas,
    youtubeSearchQuery: String(parsed.youtubeSearchQuery || "").slice(0, 120),
  };
}

export async function generateWasteRecommendations(verifiedWasteData) {
  if (!isConfigured()) return null;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 2048 },
    });

    const prompt = buildWasteRecommendationPrompt(verifiedWasteData);
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.();
    return validateShape(extractJson(text));
  } catch (err) {
    console.error("[AI] Gemini generation failed:", err?.message || err);
    return null;
  }
}
