import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { routeController } from "@brain/routes/controllers/route.controller.js";

// Returns all collection routes for admin
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return routeController.getAll(request);
}
