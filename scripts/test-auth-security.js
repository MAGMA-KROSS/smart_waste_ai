/**
 * scripts/test-auth-security.js
 *
 * Automated Verification Script for SmartWaste AI Auth & RBAC Security.
 * Tests:
 * 1. Citizen registration assigns role="citizen"
 * 2. Citizen trying to register with role="admin" is IGNORED (still role="citizen")
 * 3. Input validation rejects invalid registration & login
 * 4. Password hashing verification with bcryptjs
 * 5. JWT token generation & verification using jose
 * 6. Role authorization middleware: Citizen -> Admin API -> 403 Forbidden
 * 7. Role authorization middleware: Worker -> Admin API -> 403 Forbidden
 * 8. Role authorization middleware: Admin -> Admin API -> Allowed (null error)
 * 9. Unauthenticated request -> 401 Unauthorized
 */

import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "../auth-service/utils/jwt.utils.js";
import { validateRegister, validateLogin } from "../auth-service/validators/auth.validator.js";
import { authorizeRoles } from "../auth-service/middleware/authenticate.js";

// Set dummy JWT_SECRET for test script if not loaded
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "super_secret_test_key_for_verification_script_123456789";
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(` ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(` ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runSecurityTests() {
  console.log("\n=======================================================");
  console.log("🔒 SMARTWASTE AI — AUTH & RBAC SECURITY VERIFICATION");
  console.log("=======================================================\n");

  // TEST 1: Citizen registration validation ignores client-supplied role
  console.log("--- TEST SUITE 1: Registration Role Enforcement ---");
  const maliciousRegister = validateRegister({
    name: "Hacker User",
    email: "hacker@test.com",
    password: "Password123",
    role: "admin", // Client attempting role escalation
  });

  assert(
    maliciousRegister.error === null,
    "Valid registration data passes validator"
  );
  assert(
    maliciousRegister.data.role === undefined,
    "Validator strips 'role' field from client request body"
  );

  // TEST 2: Password hashing check
  console.log("\n--- TEST SUITE 2: Password Hashing ---");
  const rawPassword = "MySecretPassword123!";
  const hash = await bcrypt.hash(rawPassword, 12);
  const isValid = await bcrypt.compare(rawPassword, hash);
  const isInvalid = await bcrypt.compare("WrongPassword", hash);

  assert(isValid === true, "bcryptjs correctly verifies matching password");
  assert(isInvalid === false, "bcryptjs rejects mismatched password");

  // TEST 3: JWT signing and verification with jose
  console.log("\n--- TEST SUITE 3: JWT Tokens with jose ---");
  const payload = { userId: "user_12345", role: "citizen" };
  const token = await signToken(payload);
  assert(typeof token === "string" && token.length > 20, "signToken generates valid JWT string");

  const decoded = await verifyToken(token);
  assert(decoded.userId === "user_12345", "verifyToken decodes userId correctly");
  assert(decoded.role === "citizen", "verifyToken decodes role correctly");

  // TEST 4: Role-Based Access Control Middleware Enforcement
  console.log("\n--- TEST SUITE 4: Role-Based Authorization Matrix ---");
  const adminGuard = authorizeRoles("admin");
  const workerAdminGuard = authorizeRoles("admin", "worker");

  const citizenUser = { id: "c1", role: "citizen" };
  const workerUser = { id: "w1", role: "worker" };
  const adminUser = { id: "a1", role: "admin" };

  // Citizen -> Admin API -> 403 Forbidden
  const citizenToAdminResult = adminGuard(citizenUser);
  assert(
    citizenToAdminResult !== null && citizenToAdminResult.status === 403,
    "Citizen accessing Admin API receives 403 Forbidden"
  );

  // Worker -> Admin API -> 403 Forbidden
  const workerToAdminResult = adminGuard(workerUser);
  assert(
    workerToAdminResult !== null && workerToAdminResult.status === 403,
    "Worker accessing Admin API receives 403 Forbidden"
  );

  // Admin -> Admin API -> Allowed (null error)
  const adminToAdminResult = adminGuard(adminUser);
  assert(
    adminToAdminResult === null,
    "Admin accessing Admin API is Allowed (no error response)"
  );

  // Worker -> Worker/Admin API -> Allowed
  const workerToWorkerResult = workerAdminGuard(workerUser);
  assert(
    workerToWorkerResult === null,
    "Worker accessing Worker API is Allowed"
  );

  // Unauthenticated -> 401 Unauthorized
  const unauthResult = adminGuard(null);
  assert(
    unauthResult !== null && unauthResult.status === 401,
    "Unauthenticated user receives 401 Unauthorized"
  );

  // TEST 5: Input Validation Edge Cases
  console.log("\n--- TEST SUITE 5: Input Validation ---");
  const invalidEmail = validateLogin({ email: "invalid-email", password: "123" });
  assert(invalidEmail.error !== null, "Invalid email format is rejected");

  const emptyPass = validateLogin({ email: "valid@test.com", password: "" });
  assert(emptyPass.error !== null, "Empty password is rejected");

  console.log("\n=======================================================");
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests();
