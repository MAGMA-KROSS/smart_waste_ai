import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { routeController } from "@brain/routes/controllers/route.controller.js";

// Assigns a route to a worker (admin only)
export async function POST(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return routeController.assign(resolvedParams.id, request);
}
