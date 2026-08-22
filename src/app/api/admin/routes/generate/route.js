import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { routeController } from "@brain/routes/controllers/route.controller.js";

// Generates optimized collection route (admin only)
export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return routeController.generate(request, user.id);
}
