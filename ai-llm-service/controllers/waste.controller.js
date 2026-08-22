/**
 * ai-llm-service/controllers/waste.controller.js
 *
 * ⚠️ AI/LLM PLACEHOLDER — Do not remove. Implement in waste.service.js instead.
 *
 * Handles request parsing and response formatting for AI endpoints.
 */

import { NextResponse } from "next/server.js";
import {
  classifyWaste,
  getRecyclingRecommendations,
} from "../services/waste.service.js";

export const wasteController = {
  /**
   * POST /api/waste/scan
   * Accepts image or description, returns waste classification.
   */
  async scan(request) {
    try {
      const contentType = request.headers.get("content-type") || "";
      let body = {};

      if (contentType.includes("application/json")) {
        body = await request.json().catch(() => ({}));
      }

      const result = await classifyWaste({
        imageBase64: body.imageBase64 || null,
        description: body.description || null,
        material: body.material || null,
      });

      return NextResponse.json(
        {
          success: true,
          result,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[AI] Scan error:", err);
      return NextResponse.json(
        { error: "Waste classification failed. Please try again." },
        { status: 500 }
      );
    }
  },

  /**
   * GET /api/recycling/:material
   * Returns recycling recommendations for a given material.
   */
  async getRecommendations(material) {
    try {
      if (!material || typeof material !== "string") {
        return NextResponse.json(
          { error: "Material type is required" },
          { status: 400 }
        );
      }

      const recommendations = await getRecyclingRecommendations(material);

      return NextResponse.json(
        {
          success: true,
          material: material.toLowerCase(),
          recommendations,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[AI] Recommendations error:", err);
      return NextResponse.json(
        { error: "Failed to fetch recommendations. Please try again." },
        { status: 500 }
      );
    }
  },
};
