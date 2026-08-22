import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { routeController } from "@brain/routes/controllers/route.controller.js";

// Returns worker's assigned collection route
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("worker")(user);
  if (forbidden) return forbidden;

  return routeController.getWorkerRoute(user.id);
}
