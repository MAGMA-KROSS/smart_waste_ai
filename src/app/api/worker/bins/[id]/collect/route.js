import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { binController } from "@brain/bins/controllers/bin.controller.js";

// Marks a bin as collected by a worker
export async function PATCH(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("worker")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return binController.markCollected(resolvedParams.id, user.id);
}
