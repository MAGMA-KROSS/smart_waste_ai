/**
 * auth-service/validators/auth.validator.js
 *
 * Input validation for auth endpoints.
 * Keeps validation logic out of controllers and services.
 */

/**
 * Validates citizen registration input.
 * NOTE: role is NEVER accepted from the request body — it is always "citizen".
 */
export function validateRegister(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body", data: null };
  }

  const { name, email, password } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters", data: null };
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { error: "A valid email address is required", data: null };
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return { error: "Password must be at least 6 characters", data: null };
  }

  return {
    error: null,
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      // role is intentionally NOT included — always set server-side to "citizen"
    },
  };
}

/**
 * Validates login input.
 */
export function validateLogin(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body", data: null };
  }

  const { email, password } = body;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { error: "A valid email address is required", data: null };
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    return { error: "Password is required", data: null };
  }

  return {
    error: null,
    data: {
      email: email.toLowerCase().trim(),
      password,
    },
  };
}

/**
 * Validates worker creation by admin.
 */
export function validateCreateWorker(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body", data: null };
  }

  const { name, email, employeeId, department } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters", data: null };
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { error: "A valid email address is required", data: null };
  }

  if (!employeeId || typeof employeeId !== "string") {
    return { error: "Employee ID is required", data: null };
  }

  return {
    error: null,
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      employeeId: employeeId.trim(),
      department: department ? department.trim() : "Waste Collection",
      // role is intentionally NOT included — always set server-side to "worker"
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
