import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { reportController } from "@brain/reports/controllers/report.controller.js";

// Returns user's own submitted reports
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("citizen", "worker", "admin")(user);
  if (forbidden) return forbidden;

  return reportController.getMyReports(user.id);
}
