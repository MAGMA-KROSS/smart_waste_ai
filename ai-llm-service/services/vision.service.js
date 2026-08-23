/**
 * ai-llm-service/services/vision.service.js
 *
 * SERVER-ONLY. Sends an image to the FastAPI computer-vision microservice
 * (../../ml-service) and normalizes its response. The existing
 * classifyWaste() stub contract passes `imageBase64` (a data URL or raw
 * base64 string), so this module converts that into a multipart upload
 * for FastAPI's /predict endpoint - the browser itself never talks to
 * FastAPI directly.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCategoryMeta, ALL_CLASS_IDS } from "../knowledge/wasteCategories.js";

const DEFAULT_TIMEOUT_MS = 15000;

export class VisionServiceError extends Error {
  constructor(message, code = "ML_ERROR") {
    super(message);
    this.name = "VisionServiceError";
    this.code = code;
  }
}

function getMlServiceUrl() {
  return process.env.ML_SERVICE_URL || "http://localhost:8000";
}

function toDisplayName(classId) {
  const meta = getCategoryMeta(classId);
  if (meta) return meta.displayName;
  return classId.split("_").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function base64ToBuffer(imageBase64) {
  const commaIdx = imageBase64.indexOf(",");
  const raw = imageBase64.startsWith("data:") && commaIdx !== -1 ? imageBase64.slice(commaIdx + 1) : imageBase64;
  return Buffer.from(raw, "base64");
}

function extractMimeAndCleanBase64(imageBase64) {
  let mimeType = "image/jpeg";
  let raw = imageBase64;
  if (imageBase64.startsWith("data:")) {
    const semiIdx = imageBase64.indexOf(";");
    if (semiIdx !== -1) {
      mimeType = imageBase64.slice(5, semiIdx);
    }
    const commaIdx = imageBase64.indexOf(",");
    if (commaIdx !== -1) {
      raw = imageBase64.slice(commaIdx + 1);
    }
  }
  return { mimeType, data: raw };
}

async function classifyWithGeminiVision(imageBase64) {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const { mimeType, data } = extractMimeAndCleanBase64(imageBase64);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    });

    const prompt = `Analyze this image carefully to identify any waste item, recyclables, packaging, food scrap, electronics, or objects for disposal.
Classify the item into EXACTLY ONE of the following valid class IDs:
[${ALL_CLASS_IDS.join(", ")}]

If the item is not clear or does not belong to any category, use the closest matching category or "general".
Respond with valid JSON matching:
{
  "classId": "string (must match one of the valid class IDs above)",
  "confidence": number (between 0.0 and 1.0, e.g. 0.95),
  "name": "string (human friendly name e.g. Plastic Bottle)"
}`;

    const result = await model.generateContent([
      { inlineData: { data, mimeType } },
      prompt,
    ]);

    const text = result?.response?.text?.();
    if (!text) return null;

    const parsed = JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
    if (!parsed || !parsed.classId) return null;

    const normalizedClassId = String(parsed.classId).toLowerCase().trim().replace(/[\s-]+/g, "_");
    const validClassId = ALL_CLASS_IDS.includes(normalizedClassId) ? normalizedClassId : "plastic_bottle";
    const confidence = Number.isFinite(parsed.confidence) ? parsed.confidence : 0.92;

    return {
      classId: validClassId,
      rawClassId: validClassId,
      name: parsed.name || toDisplayName(validClassId),
      confidence,
    };
  } catch (err) {
    console.warn("[AI] Gemini Vision classification fallback error:", err?.message || err);
    return null;
  }
}

/**
 * @param {string} imageBase64 - base64 (optionally data-URL prefixed) image
 * @returns {Promise<{classId:string,rawClassId:string,name:string,confidence:number,alternatives?:Array}>}
 */
export async function classifyWasteImage(imageBase64, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const url = `${getMlServiceUrl().replace(/\/$/, "")}/predict`;

  let buffer;
  try {
    buffer = base64ToBuffer(imageBase64);
  } catch {
    throw new VisionServiceError("The provided image could not be decoded.", "BAD_IMAGE");
  }
  if (!buffer || buffer.length === 0) {
    throw new VisionServiceError("The provided image is empty.", "BAD_IMAGE");
  }

  // First try local/remote FastAPI ML service if configured
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const form = new FormData();
    form.append("image", new Blob([buffer], { type: "image/jpeg" }), "upload.jpg");
    const response = await fetch(url, { method: "POST", body: form, signal: controller.signal });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.class === "string") {
        const classId = String(data.class).toLowerCase().trim().replace(/[\s-]+/g, "_");
        const confidence = Number(data.confidence);

        return {
          classId,
          rawClassId: data.rawClass || classId,
          name: data.displayName || toDisplayName(classId),
          confidence: Number.isFinite(confidence) ? confidence : 0,
          alternatives: Array.isArray(data.alternatives) ? data.alternatives : undefined,
        };
      }
    }
  } catch {
    // FastAPI service not reachable or errored; fallback to Gemini Vision below
  }

  // Fallback to Gemini Multimodal Vision API
  if (process.env.GEMINI_API_KEY) {
    const geminiPrediction = await classifyWithGeminiVision(imageBase64);
    if (geminiPrediction) {
      return geminiPrediction;
    }
  }

  throw new VisionServiceError(
    "ML service unavailable. Please ensure FastAPI ML service is running or GEMINI_API_KEY is configured in .env.local.",
    "ML_UNAVAILABLE"
  );
}
