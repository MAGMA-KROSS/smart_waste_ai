/**
 * ai-llm-service/services/waste.service.js
 *
 * ════════════════════════════════════════════════════════════════════════════
 *  ⚠️  AI/LLM IMPLEMENTATION PLACEHOLDER
 *  This file is reserved for the AI team member.
 *  DO NOT modify the function signatures or return shape.
 *  Add your LLM/Vision API implementation inside each function.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * This service handles waste classification and recycling recommendations.
 * The current implementation returns stub/mock data.
 */

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
  // ── TODO: Implement AI/LLM call here ──────────────────────────────────────
  // Examples:
  //   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  //   const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  //   const result = await model.generateContent([prompt, imagePart]);
  // ──────────────────────────────────────────────────────────────────────────

  // STUB response — replace with actual AI implementation
  return {
    material: material || "unknown",
    category: "recyclable",
    confidence: 0.0,
    isStub: true,
    message: "AI classification not yet implemented. This is a placeholder response.",
  };
}

/**
 * Returns recycling and upcycling recommendations for a material.
 *
 * @param {string} material - e.g. "aluminium", "plastic", "glass", "organic"
 * @returns {Promise<RecyclingRecommendation>}
 */
export async function getRecyclingRecommendations(material) {
  // ── TODO: Implement AI/LLM recommendation engine here ─────────────────────
  // ──────────────────────────────────────────────────────────────────────────

  // STUB: Basic static mapping until AI implementation is added
  const staticRecommendations = {
    aluminium: {
      category: "recyclable",
      recommendations: [
        "Place in blue recycling bin",
        "Rinse the can before disposing",
        "Aluminium can be recycled indefinitely without quality loss",
      ],
      upcyclingIdeas: ["Use as a pencil holder", "Create decorative planters"],
      nearestBinCategory: "recyclable",
    },
    plastic: {
      category: "recyclable",
      recommendations: [
        "Check the recycling number on the bottom",
        "Rinse and remove caps",
        "Flatten to save bin space",
      ],
      upcyclingIdeas: ["Repurpose bottles as plant waterers"],
      nearestBinCategory: "recyclable",
    },
    glass: {
      category: "glass",
      recommendations: [
        "Place in glass recycling bin",
        "Remove caps and lids",
        "Do not break — handle carefully",
      ],
      upcyclingIdeas: ["Use jars for storage", "Create vases"],
      nearestBinCategory: "glass",
    },
    organic: {
      category: "organic",
      recommendations: [
        "Use the green organic waste bin",
        "Can be composted at home",
        "Avoid mixing with non-organic waste",
      ],
      upcyclingIdeas: ["Compost for garden fertilizer"],
      nearestBinCategory: "organic",
    },
    ewaste: {
      category: "ewaste",
      recommendations: [
        "Take to an authorized e-waste collection point",
        "Never dispose in regular bins",
        "Contains valuable recoverable materials",
      ],
      upcyclingIdeas: ["Donate working devices"],
      nearestBinCategory: "ewaste",
    },
  };

  const key = material.toLowerCase().replace(/[^a-z]/g, "");
  return (
    staticRecommendations[key] || {
      category: "general",
      recommendations: [
        "If unsure, use the general waste bin",
        "Check local municipal guidelines",
      ],
      upcyclingIdeas: [],
      nearestBinCategory: "general",
    }
  );
}

/**
 * Predicts when a bin will reach capacity overflow level.
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
