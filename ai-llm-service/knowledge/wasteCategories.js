/**
 * ai-llm-service/knowledge/wasteCategories.js
 *
 * Canonical registry of waste categories the scanner understands.
 * `classId` matches the class names produced by the YOLO11s-cls model in
 * ../../ml-service, and `binCategory` matches the EXISTING Bin model's
 * category enum (src/models/Bin.js: general | recyclable | organic |
 * glass | ewaste) so results plug straight into the existing
 * /api/bins/nearby endpoint without any changes to that system.
 */

export const WASTE_CATEGORIES = [
  { classId: "plastic_bottle", displayName: "Plastic Bottle", emoji: "🧴", materialFamily: "plastic", binCategory: "recyclable" },
  { classId: "aluminium_can", displayName: "Aluminium Can", emoji: "🥫", materialFamily: "aluminium", binCategory: "recyclable" },
  { classId: "glass_bottle", displayName: "Glass Bottle", emoji: "🍾", materialFamily: "glass", binCategory: "glass" },
  { classId: "paper", displayName: "Paper", emoji: "📄", materialFamily: "paper", binCategory: "recyclable" },
  { classId: "cardboard", displayName: "Cardboard", emoji: "📦", materialFamily: "paper", binCategory: "recyclable" },
  { classId: "tissue", displayName: "Tissue", emoji: "🧻", materialFamily: "general", binCategory: "general" },
  { classId: "food_waste", displayName: "Food Waste", emoji: "🍎", materialFamily: "organic", binCategory: "organic" },
  { classId: "plastic_bag", displayName: "Plastic Bag", emoji: "🛍️", materialFamily: "plastic", binCategory: "recyclable" },
  { classId: "e_waste", displayName: "E-Waste", emoji: "🔌", materialFamily: "ewaste", binCategory: "ewaste" },
  { classId: "metal", displayName: "Metal", emoji: "🔩", materialFamily: "aluminium", binCategory: "recyclable" },
];

// Backward-compat bridge: the original ai-llm-service stub's
// getRecyclingRecommendations(material) used 5 coarse "material family"
// keys (aluminium, plastic, glass, organic, ewaste). Any existing/future
// caller using those coarse keys is mapped to a representative fine-grained
// classId so it keeps working unchanged.
export const MATERIAL_FAMILY_TO_DEFAULT_CLASS = {
  aluminium: "aluminium_can",
  plastic: "plastic_bottle",
  glass: "glass_bottle",
  organic: "food_waste",
  ewaste: "e_waste",
};

export function getCategoryMeta(classId) {
  if (!classId) return null;
  const normalized = String(classId).toLowerCase().trim().replace(/[\s-]+/g, "_");
  return WASTE_CATEGORIES.find((c) => c.classId === normalized) || null;
}

/** Resolves either a fine-grained classId or a legacy coarse material-family key. */
export function resolveClassId(materialOrClassId) {
  if (!materialOrClassId) return null;
  const key = String(materialOrClassId).toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (getCategoryMeta(key)) return key;
  if (MATERIAL_FAMILY_TO_DEFAULT_CLASS[key]) return MATERIAL_FAMILY_TO_DEFAULT_CLASS[key];
  return null;
}
