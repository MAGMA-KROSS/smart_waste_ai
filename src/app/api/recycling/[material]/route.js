import { wasteController } from "@ai/controllers/waste.controller.js";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  return wasteController.getRecommendations(resolvedParams.material);
}
