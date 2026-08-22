import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { analyticsController } from "@brain/analytics/controllers/analytics.controller.js";

// Returns municipal command dashboard metrics (admin only)
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return analyticsController.getDashboard();
}
