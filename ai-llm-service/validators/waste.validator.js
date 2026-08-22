/**
 * ai-llm-service/validators/waste.validator.js
 * ⚠️ AI/LLM PLACEHOLDER
 */

export function validateScanRequest(body) {
  if (!body) return { error: "Request body is required", data: null };
  if (!body.imageBase64 && !body.description && !body.material) {
    return {
      error: "At least one of: imageBase64, description, or material is required",
      data: null,
    };
  }
  return { error: null, data: body };
}
