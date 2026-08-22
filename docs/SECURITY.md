# SmartWaste AI — Security Architecture Document

## 1. Authentication Security
- **Centralized System**: Single entry point for credential validation (`auth-service/services/auth.service.js`).
- **Password Hashing**: Passwords are hashed using `bcryptjs` with 12 salt rounds before database insertion. Plain-text passwords are never stored or logged.
- **JWT Storage**: Tokens are issued via `jose` and delivered strictly through `HttpOnly`, `SameSite=Lax` cookies named `swai_token`. JavaScript running in the browser cannot access the raw token, protecting against XSS token theft.

## 2. Server-Enforced RBAC
- **Roles**: Supported values are strictly limited to `citizen`, `worker`, and `admin` via Mongoose enums.
- **No Client Trust**:
  - `POST /api/auth/register` hardcodes `role: "citizen"`. Any role field passed in the client payload is ignored.
  - `POST /api/admin/workers` hardcodes `role: "worker"`.
  - Public admin registration endpoints do not exist. First admin creation requires execution of `scripts/seed-admin.js`.
- **API Guard Middleware**: `authorizeRoles("admin")` validates `user.role` on every request server-side. Unpermitted role attempts immediately yield HTTP 403 Forbidden.

## 3. Data Protection & Ownership
- **Report Isolation**: Citizens querying `GET /api/reports/my` only receive records matching `req.user.id`.
- **Database Injection Prevention**: Mongoose Schema validations sanitize incoming inputs.
- **Secret Management**: Operational keys (`JWT_SECRET`, `MONGODB_URI`, `ADMIN_PASSWORD`) are loaded strictly from environment variables (`.env.local`).

## 4. Security Verification Checklist
- [x] Public registration forces `role = "citizen"`
- [x] Role payload in registration request is ignored
- [x] Public worker self-registration endpoint rejected/not existing
- [x] Admin endpoint returns HTTP 403 for Citizen token
- [x] Admin endpoint returns HTTP 403 for Worker token
- [x] Admin endpoint returns HTTP 200 for Admin token
- [x] Missing/invalid cookie returns HTTP 401 Unauthorized
- [x] `/api/auth/me` returns current user profile and role from verified cookie
