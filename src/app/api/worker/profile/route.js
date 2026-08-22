import { authenticateUser, authorizeRoles } from "@auth/middleware/authenticate.js";
import { workerController } from "@brain/workers/controllers/worker.controller.js";

// Returns worker profile
export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  const forbidden = authorizeRoles("worker")(user);
  if (forbidden) return forbidden;

  return workerController.getProfile(user.id);
}
