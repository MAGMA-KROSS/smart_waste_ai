/**
 * ai-llm-service/knowledge/wasteKnowledgeBase.js
 *
 * Verified, human-curated facts per waste category. Gemini NEVER decides
 * recyclability/hazard status - it only receives this data and writes
 * friendly explanations/creative ideas around it (see gemini.service.js).
 */

export const WASTE_KNOWLEDGE_BASE = {
  plastic_bottle: {
    name: "Plastic Bottle", material: "Plastic/PET", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Plastic recycling collection",
    recommendedAction: "Recycle through the appropriate plastic collection stream, subject to local recycling rules.",
  },
  aluminium_can: {
    name: "Aluminium Can", material: "Aluminium", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Metal/Recycling",
    recommendedAction: "Recycle as aluminium - it can be recycled indefinitely without quality loss.",
  },
  glass_bottle: {
    name: "Glass Bottle", material: "Glass", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Glass recycling collection",
    recommendedAction: "Recycle at a glass collection point, or reuse as a vase/jar.",
  },
  paper: {
    name: "Paper", material: "Paper", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Paper recycling",
    recommendedAction: "Recycle with dry waste, or reuse for notes/crafts.",
  },
  cardboard: {
    name: "Cardboard", material: "Corrugated Cardboard", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Paper/Cardboard recycling",
    recommendedAction: "Flatten and recycle, or reuse for storage/DIY projects.",
  },
  tissue: {
    name: "Tissue", material: "Soft Paper", category: "General",
    recyclable: false, hazardous: false, safeReuse: false,
    disposalMethod: "General waste",
    recommendedAction: "Dispose in general waste - used tissue is not recyclable.",
  },
  food_waste: {
    name: "Food Waste", material: "Organic Matter", category: "Organic",
    recyclable: false, hazardous: false, safeReuse: false,
    disposalMethod: "Organic/wet waste composting",
    recommendedAction: "Dispose in the organic/wet waste bin or compost it.",
  },
  plastic_bag: {
    name: "Plastic Bag", material: "LDPE Plastic Film", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Plastic film recycling",
    recommendedAction: "Reuse as a bin liner, or return to a plastic-film collection point.",
  },
  e_waste: {
    name: "E-Waste", material: "Mixed Electronics", category: "Hazardous",
    recyclable: true, hazardous: true, safeReuse: false,
    disposalMethod: "Authorized e-waste collection",
    recommendedAction: "Dispose through an authorized e-waste collection point.",
  },
  metal: {
    name: "Metal", material: "Mixed Metal", category: "Recyclable",
    recyclable: true, hazardous: false, safeReuse: true,
    disposalMethod: "Metal/Recycling",
    recommendedAction: "Recycle as scrap metal, or repurpose for DIY projects.",
  },

  // Extended hazardous categories, for safety-engine coverage even before
  // the vision model is trained on these (see wasteSafetyRules.js).
  battery: {
    name: "Battery", material: "Lithium/Alkaline Cell", category: "Hazardous",
    recyclable: true, hazardous: true, safeReuse: false,
    disposalMethod: "Authorized e-waste/battery collection",
    recommendedAction: "Dispose through an authorized e-waste/battery collection point.",
  },
  chemical: {
    name: "Chemical Waste", material: "Chemical Substance", category: "Hazardous",
    recyclable: false, hazardous: true, safeReuse: false,
    disposalMethod: "Authorized hazardous waste facility",
    recommendedAction: "Dispose through an authorized hazardous waste facility.",
  },
  medical_waste: {
    name: "Medical Waste", material: "Biomedical", category: "Hazardous",
    recyclable: false, hazardous: true, safeReuse: false,
    disposalMethod: "Authorized medical waste facility",
    recommendedAction: "Dispose through an authorized medical waste facility.",
  },
};

export function getKnowledgeBaseEntry(classId) {
  if (!classId) return null;
  const normalized = String(classId).toLowerCase().trim().replace(/[\s-]+/g, "_");
  return WASTE_KNOWLEDGE_BASE[normalized] || null;
}
