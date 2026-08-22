import { binController } from "@brain/bins/controllers/bin.controller.js";

// Returns nearby bins based on user lat/lng
export async function GET(request) {
  return binController.getNearby(request);
}
