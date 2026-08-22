/**
 * ai-llm-service/index.js
 * Public exports of the AI/LLM service.
 * ⚠️ AI/LLM PLACEHOLDER — Do not modify exports.
 */
export { wasteController } from "./controllers/waste.controller.js";
export {
  classifyWaste,
  getRecyclingRecommendations,
  predictFillLevel,
} from "./services/waste.service.js";
