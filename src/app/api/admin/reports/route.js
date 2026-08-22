import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { reportController } from "@brain/reports/controllers/report.controller.js";

// Returns all citizen/worker reports for admin
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return reportController.getAll(request);
}
