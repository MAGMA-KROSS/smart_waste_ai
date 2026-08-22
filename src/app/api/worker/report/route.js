import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { reportController } from "@brain/reports/controllers/report.controller.js";

// Submits a worker issue report
export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("worker")(user);
  if (forbidden) return forbidden;

  return reportController.create(request, user.id);
}
