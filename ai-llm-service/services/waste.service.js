/**
 * ai-llm-service/services/waste.service.js
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  ✅ AI/LLM IMPLEMENTATION — real vision model + Gemini + YouTube
 *  Function signatures and every field of the ORIGINAL stub's return shape
 *  are preserved exactly (material, category, confidence, isStub for
 *  classifyWaste; category, recommendations, upcyclingIdeas,
 *  nearestBinCategory for getRecyclingRecommendations) so nothing that
 *  already calls this service breaks. New fields were added additively.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pipeline:
 *   image -> vision.service (FastAPI/YOLO11s-cls) -> confidence check ->
 *   wasteKnowledgeBase (verified facts) -> wasteSafetyRules (hazard/DIY
 *   gate) -> gemini.service (recommendation text + DIY ideas + YouTube
 *   search query, only when safety allows) -> youtube.service (real videos).
 *
 * Every external step degrades gracefully: if Gemini or YouTube fail, the
 * verified prediction/knowledge-base data is still returned - nothing is
 * ever fabricated (see class docs in vision.service.js / gemini.service.js
 * / youtube.service.js for the "never fake data" guarantees).
 */

import { classifyWasteImage, VisionServiceError } from "./vision.service.js";
import { generateWasteRecommendations } from "./gemini.service.js";
import { searchTutorialVideos } from "./youtube.service.js";
import { getKnowledgeBaseEntry } from "../knowledge/wasteKnowledgeBase.js";
import { evaluateSafety, enforceSafetyOnAiOutput } from "../knowledge/wasteSafetyRules.js";
import { resolveClassId, getCategoryMeta } from "../knowledge/wasteCategories.js";

function getConfidenceThreshold() {
  const parsed = parseFloat(process.env.WASTE_CONFIDENCE_THRESHOLD);
  return Number.isFinite(parsed) ? parsed : 0.7;
}

/**
 * Classifies a waste item from image data or description.
 *
 * @param {object} params
 * @param {string} [params.imageBase64] - Base64 encoded image (optional)
 * @param {string} [params.description] - Text description of item (optional)
 * @param {string} [params.material]    - Known material type (optional)
 * @returns {Promise<WasteClassificationResult>}
 */
export async function classifyWaste({ imageBase64, description, material }) {
  // ── Path 1: real image classification via the FastAPI ML service ──────────
  if (imageBase64) {
    let prediction;
    try {
      prediction = await classifyWasteImage(imageBase64);
    } catch (err) {
      const isVisionError = err instanceof VisionServiceError;
      return {
        // original stub fields
        material: material || "unknown",
        category: "recyclable",
        confidence: 0.0,
        isStub: false,
        // additive fields - honest error, never a fabricated prediction
        success: false,
        error: isVisionError ? err.message : "Waste identification failed. Please try again.",
        errorCode: isVisionError ? err.code : "ML_ERROR",
      };
    }

    if (prediction.confidence < getConfidenceThreshold()) {
      return {
        // original stub fields
        material: material || "unknown",
        category: "recyclable",
        confidence: prediction.confidence,
        isStub: false,
        // additive fields
        success: false,
        uncertain: true,
        wasteName: prediction.name,
        message: "Unable to confidently identify this waste. Please upload a clearer photo.",
      };
    }

    const kbEntry = getKnowledgeBaseEntry(prediction.classId);
    const meta = getCategoryMeta(prediction.classId);
    const safety = evaluateSafety(prediction.classId, kbEntry);

    return {
      // original stub fields, now populated with REAL verified data
      material: meta?.materialFamily || (kbEntry?.material || "unknown").toLowerCase(),
      category: kbEntry?.recyclable ? "recyclable" : safety.hazardous ? "hazardous" : "general",
      confidence: prediction.confidence,
      isStub: false,
      // additive fields
      success: true,
      classId: prediction.classId,
      rawClassId: prediction.rawClassId,
      wasteName: kbEntry?.name || prediction.name,
      materialDetail: kbEntry?.material || "Unknown",
      recyclable: Boolean(kbEntry?.recyclable),
      hazardous: safety.hazardous,
      safeReuse: safety.allowDIY,
      disposalMethod: kbEntry?.disposalMethod || safety.safetyMessage || "Dispose responsibly",
      recommendedAction: kbEntry?.recommendedAction || safety.safetyMessage || "Dispose responsibly.",
      nearestBinCategory: meta?.binCategory || (safety.hazardous ? "ewaste" : "general"),
    };
  }

  // ── Path 2: no image, but a known material name was passed directly ───────
  // (manual-entry fallback - still uses the real, verified knowledge base,
  // just skips the vision-model step since there's no image to classify.)
  if (material) {
    const classId = resolveClassId(material);
    const kbEntry = getKnowledgeBaseEntry(classId);
    if (kbEntry) {
      const meta = getCategoryMeta(classId);
      const safety = evaluateSafety(classId, kbEntry);
      return {
        material,
        category: kbEntry.recyclable ? "recyclable" : safety.hazardous ? "hazardous" : "general",
        confidence: 1.0,
        isStub: false,
        success: true,
        classId,
        wasteName: kbEntry.name,
        materialDetail: kbEntry.material,
        recyclable: kbEntry.recyclable,
        hazardous: safety.hazardous,
        safeReuse: safety.allowDIY,
        disposalMethod: kbEntry.disposalMethod,
        recommendedAction: kbEntry.recommendedAction,
        nearestBinCategory: meta?.binCategory || "general",
      };
    }
  }

  // ── Path 3: nothing usable was provided ────────────────────────────────────
  return {
    material: material || "unknown",
    category: "recyclable",
    confidence: 0.0,
    isStub: false,
    success: false,
    error: description
      ? "Text-only description classification is not supported yet - please provide an image."
      : "No image or material was provided to classify.",
  };
}

/**
 * Returns recycling and upcycling recommendations for a material.
 *
 * @param {string} material - a fine-grained classId (e.g. "plastic_bottle")
 *   OR one of the original 5 coarse keys ("aluminium", "plastic", "glass",
 *   "organic", "ewaste") for backward compatibility with any existing caller.
 * @param {object} [options]
 * @param {number} [options.quantity]
 * @returns {Promise<RecyclingRecommendation>}
 */
export async function getRecyclingRecommendations(material, options = {}) {
  const quantity = Math.max(1, Number(options.quantity) || 1);
  const classId = resolveClassId(material);
  const kbEntry = getKnowledgeBaseEntry(classId);
  const meta = getCategoryMeta(classId);

  if (!kbEntry) {
    // Honest fallback for an unrecognized material - matches the
    // original stub's default branch exactly, never fabricated.
    return {
      category: "general",
      recommendations: ["If unsure, use the general waste bin", "Check local municipal guidelines"],
      upcyclingIdeas: [],
      nearestBinCategory: "general",
      videos: [],
      aiAvailable: false,
    };
  }

  const safety = evaluateSafety(classId, kbEntry);

  let aiOutput = null;
  try {
    aiOutput = await generateWasteRecommendations({
      wasteName: kbEntry.name,
      material: kbEntry.material,
      category: kbEntry.category,
      recyclable: kbEntry.recyclable,
      hazardous: safety.hazardous,
      safeReuse: safety.allowDIY,
      allowDIY: safety.allowDIY,
      disposalMethod: kbEntry.disposalMethod,
      recommendedAction: kbEntry.recommendedAction,
      quantity,
    });
  } catch (err) {
    console.error("[AI] Gemini step failed, continuing without it:", err);
  }

  // Never trust Gemini output blindly - enforce safety as the final word.
  const safeAiOutput = aiOutput ? enforceSafetyOnAiOutput(aiOutput, safety) : null;
  const upcyclingIdeas = safety.allowDIY ? safeAiOutput?.upcyclingIdeas || [] : [];

  let videos = [];
  if (safety.allowDIY) {
    const query = safeAiOutput?.youtubeSearchQuery || `how to recycle ${kbEntry.name.toLowerCase()}`;
    try {
      videos = await searchTutorialVideos(query);
    } catch (err) {
      console.error("[AI] YouTube step failed, continuing without it:", err);
    }
  }

  return {
    // original stub fields, kept exact shape (recommendations/upcyclingIdeas
    // as string arrays, same as the static stub produced)
    category: meta?.binCategory || (safety.hazardous ? "ewaste" : "general"),
    recommendations: safeAiOutput?.recyclingRecommendation
      ? [safeAiOutput.recyclingRecommendation, kbEntry.recommendedAction]
      : [kbEntry.recommendedAction],
    upcyclingIdeas: upcyclingIdeas.map((i) => `${i.title} (${i.difficulty}): ${i.description}`),
    nearestBinCategory: meta?.binCategory || (safety.hazardous ? "ewaste" : "general"),
    // additive fields - the new scan-waste UI reads these directly
    wasteName: kbEntry.name,
    material: kbEntry.material,
    recyclable: kbEntry.recyclable,
    hazardous: safety.hazardous,
    safeReuse: safety.allowDIY,
    disposalMethod: kbEntry.disposalMethod,
    recommendedAction: kbEntry.recommendedAction,
    upcyclingIdeasDetailed: upcyclingIdeas,
    videos,
    aiAvailable: Boolean(safeAiOutput),
  };
}

/**
 * Predicts when a bin will reach capacity overflow level.
 *
 * NOT part of this change - left exactly as originally stubbed. Waste
 * scanning / recycling recommendations / YouTube tutorials were the only
 * three features in scope for this update.
 *
 * @param {object} bin - Bin document from MongoDB
 * @returns {Promise<FillLevelPrediction>}
 */
export async function predictFillLevel(bin) {
  // ── TODO: Implement ML time-series prediction here ────────────────────────
  // ──────────────────────────────────────────────────────────────────────────

  // STUB: Simple linear extrapolation placeholder
  const currentFill = bin.fillLevel || 0;
  const hoursToFull = currentFill >= 80 ? 0 : Math.round((100 - currentFill) * 0.8);

  return {
    currentFillLevel: currentFill,
    predictedFillIn12h: Math.min(100, currentFill + 15),
    predictedFillIn24h: Math.min(100, currentFill + 30),
    estimatedHoursToFull: hoursToFull,
    isStub: true,
    requiresCollection: currentFill >= 75,
  };
}
