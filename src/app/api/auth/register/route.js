import { authController } from "@auth/controllers/auth.controller.js";

export async function POST(request) {
  return authController.register(request);
}
