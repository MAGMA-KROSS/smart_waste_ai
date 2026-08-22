import { authController } from "@auth/controllers/auth.controller.js";
import { authenticateUser } from "@auth/middleware/authenticate.js";

export async function GET(request) {
  const { user, error } = await authenticateUser(request);
  if (error) return error;

  return authController.me(user.id);
}
