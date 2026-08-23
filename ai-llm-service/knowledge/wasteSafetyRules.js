/**
 * ai-llm-service/knowledge/wasteSafetyRules.js
 *
 * Authoritative safety engine. Gemini is never allowed to override these
 * rules - gemini.service.js strips any AI-suggested DIY content when
 * evaluateSafety() says it isn't allowed, regardless of what the model
 * returned.
 */

export const HAZARDOUS_CATEGORIES = ["battery", "chemical", "medical_waste", "e_waste"];
export const HAZARDOUS_MESSAGE = "Dispose through an authorized collection point.";

export function evaluateSafety(classId, kbEntry) {
  const normalized = (classId || "").toLowerCase();
  const isHazardousByName = HAZARDOUS_CATEGORIES.some((h) => normalized.includes(h));
  const hazardous = isHazardousByName || Boolean(kbEntry?.hazardous);
  const allowDIY = hazardous ? false : Boolean(kbEntry?.safeReuse);

  return {
    hazardous,
    allowDIY,
    safetyMessage: hazardous ? HAZARDOUS_MESSAGE : null,
  };
}

/** Last line of defense before AI output leaves the server. */
export function enforceSafetyOnAiOutput(aiOutput, safety) {
  if (!aiOutput) return aiOutput;
  if (safety.allowDIY) return aiOutput;
  return {
    ...aiOutput,
    upcyclingIdeas: [],
    recyclingRecommendation: safety.hazardous ? HAZARDOUS_MESSAGE : aiOutput.recyclingRecommendation,
  };
}
