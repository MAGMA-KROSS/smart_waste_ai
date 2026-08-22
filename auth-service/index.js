/**
 * auth-service/index.js
 *
 * Public API of the Auth Service.
 * Other services import from here — not from internal files directly.
 *
 * Microservice-ready: if this service is extracted into its own process,
 * only these exports and the API contract matter.
 */

export { authController } from "./controllers/auth.controller.js";
export { authService } from "./services/auth.service.js";
export { authenticateUser, authorizeRoles } from "./middleware/authenticate.js";
export { signToken, verifyToken } from "./utils/jwt.utils.js";
