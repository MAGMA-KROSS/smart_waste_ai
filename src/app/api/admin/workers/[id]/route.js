import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { workerController } from "@brain/workers/controllers/worker.controller.js";

// Updates worker account details (admin only)
export async function PATCH(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return workerController.update(resolvedParams.id, request);
}

// Deactivates worker account (admin only)
export async function DELETE(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return workerController.deactivate(resolvedParams.id);
}
