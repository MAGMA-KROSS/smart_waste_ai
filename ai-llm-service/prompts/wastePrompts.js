/**
 * ai-llm-service/prompts/wastePrompts.js
 *
 * Builds the prompt sent to Gemini. Gemini receives ONLY verified,
 * server-computed facts and is explicitly told not to invent disposal
 * rules, override safety, or produce anything but a YouTube search query
 * (never a URL).
 */

export function buildWasteRecommendationPrompt({
  wasteName, material, category, recyclable, hazardous, safeReuse,
  allowDIY, disposalMethod, recommendedAction, quantity,
}) {
  const verifiedData = {
    waste: wasteName, material, category, recyclable, hazardous,
    safeReuse, allowDIY, disposalMethod, recommendedAction, quantity: quantity || 1,
  };

  return `You are the recommendation engine for SmartWaste AI.

You are given VERIFIED, ALREADY-CONFIRMED facts about scanned waste. These
come from a human-curated knowledge base and a safety engine - they are
ground truth and must not be contradicted or replaced.

VERIFIED DATA:
${JSON.stringify(verifiedData, null, 2)}

STRICT RULES:
1. Use ONLY the supplied data. Do not invent facts about material, recyclability, or hazards.
2. Do not invent different disposal rules than "disposalMethod"/"recommendedAction" above.
3. Never generate dangerous or unsafe handling instructions.
4. If "allowDIY" is false, "upcyclingIdeas" MUST be an empty array [].
5. If "hazardous" is true, clearly instruct disposal through an authorized collection point only.
6. Personalize for "quantity" when greater than 1.
7. Generate a YouTube SEARCH QUERY only (plain text). NEVER a URL or video ID.
8. Respond with STRICT JSON ONLY, no markdown fences, matching:

{
  "recyclingRecommendation": "string, 1-2 sentences",
  "upcyclingIdeas": [{ "title": "string", "difficulty": "Easy"|"Medium"|"Hard", "description": "string" }],
  "youtubeSearchQuery": "string, short search query, no URL"
}

At most 3 upcycling ideas. Empty array if allowDIY is false.`;
}
