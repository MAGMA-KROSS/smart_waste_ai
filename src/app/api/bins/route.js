import { binController } from "@brain/bins/controllers/bin.controller.js";

// Handles HTTP POST request to add a bin to MongoDB Atlas
export async function POST(request) {
  return binController.create(request, "citizen_user");
}
