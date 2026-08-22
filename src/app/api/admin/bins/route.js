import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { binController } from "@brain/bins/controllers/bin.controller.js";

// Returns all bins for admin management
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return binController.getAll(request);
}

// Creates a new bin record for admin
export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return binController.create(request, user.id);
}
