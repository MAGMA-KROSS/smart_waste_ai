import { authController } from "@auth/controllers/auth.controller.js";

export async function POST() {
  return authController.logout();
}
