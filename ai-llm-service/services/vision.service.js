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

import { getCategoryMeta } from "../knowledge/wasteCategories.js";

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
  // Strip a data-URL prefix like "data:image/jpeg;base64," if present.
  const commaIdx = imageBase64.indexOf(",");
  const raw = imageBase64.startsWith("data:") && commaIdx !== -1 ? imageBase64.slice(commaIdx + 1) : imageBase64;
  return Buffer.from(raw, "base64");
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    const form = new FormData();
    form.append("image", new Blob([buffer], { type: "image/jpeg" }), "upload.jpg");
    response = await fetch(url, { method: "POST", body: form, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new VisionServiceError("ML service timed out. Please try again.", "ML_TIMEOUT");
    }
    throw new VisionServiceError("ML service unavailable. Is the FastAPI service running?", "ML_UNAVAILABLE");
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail || body?.message || "";
    } catch { /* ignore */ }
    throw new VisionServiceError(detail || `ML service returned an error (${response.status}).`, "ML_BAD_RESPONSE");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new VisionServiceError("ML service returned an invalid response.", "ML_BAD_RESPONSE");
  }
  if (!data || typeof data.class !== "string") {
    throw new VisionServiceError("ML service response is missing a prediction.", "ML_BAD_RESPONSE");
  }

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
