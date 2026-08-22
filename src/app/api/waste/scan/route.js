import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { wasteController } from "@ai/controllers/waste.controller.js";

export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("citizen", "worker", "admin")(user);
  if (forbidden) return forbidden;

  return wasteController.scan(request);
}
