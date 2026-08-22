import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { reportController } from "@brain/reports/controllers/report.controller.js";

// Updates report status or notes (admin only)
export async function PATCH(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return reportController.update(resolvedParams.id, request);
}
