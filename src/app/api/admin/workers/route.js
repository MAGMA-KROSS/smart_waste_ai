import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { authController } from "@auth/controllers/auth.controller.js";
import { workerController } from "@brain/workers/controllers/worker.controller.js";

// Returns all workers for admin
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return workerController.getAll(request);
}

// Creates worker account with role=worker (admin only)
export async function POST(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;
  const forbidden = authorizeRoles("admin")(user);
  if (forbidden) return forbidden;

  return authController.createWorker(request);
}
