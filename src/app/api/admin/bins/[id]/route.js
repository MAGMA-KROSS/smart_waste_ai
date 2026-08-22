import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { binController } from "@brain/bins/controllers/bin.controller.js";

// Updates a bin record (admin only)
export async function PATCH(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return binController.update(resolvedParams.id, request);
}

// Removes a bin record (admin only)
export async function DELETE(request, { params }) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  const resolvedParams = await params;
  return binController.remove(resolvedParams.id);
}
