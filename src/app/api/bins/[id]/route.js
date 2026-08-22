import { binController } from "@brain/bins/controllers/bin.controller.js";

// Returns single bin details by ID
export async function GET(request, { params }) {
  const resolvedParams = await params;
  return binController.getById(resolvedParams.id);
}
