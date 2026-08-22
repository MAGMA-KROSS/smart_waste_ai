/**
 * auth-service/controllers/auth.controller.js
 *
 * Handles auth request/response lifecycle.
 * Calls authService for business logic, sets HttpOnly cookies, formats responses.
 *
 * Cookie config:
 * - name: "swai_token"
 * - httpOnly: true  (JS cannot read it — prevents XSS token theft)
 * - secure: true in production
 * - sameSite: "lax" (CSRF protection for cross-site requests)
 * - maxAge: 7 days
 */

import { authService } from "../services/auth.service.js";
import { signToken } from "../utils/jwt.utils.js";
import {
  validateRegister,
  validateLogin,
  validateCreateWorker,
} from "../validators/auth.validator.js";
import { NextResponse } from "next/server.js";

const COOKIE_NAME = "swai_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export const authController = {
  /**
   * POST /api/auth/register
   * Registers a new citizen. Role is ALWAYS "citizen" — server-enforced.
   */
  async register(request) {
    try {
      const body = await request.json().catch(() => ({}));
      const { error, data } = validateRegister(body);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      const user = await authService.register(data);
      const token = await signToken({ userId: user.id, role: user.role });

      const response = NextResponse.json(
        {
          message: "Registration successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );

      response.cookies.set(COOKIE_NAME, token, getCookieOptions());
      return response;
    } catch (err) {
      if (err.code === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      console.error("[Auth] Register error:", err);
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 }
      );
    }
  },

  /**
   * POST /api/auth/login
   * Authenticates any role (citizen, worker, admin) with one endpoint.
   * Role is read from MongoDB — never from the request.
   */
  async login(request) {
    try {
      const body = await request.json().catch(() => ({}));
      const { error, data } = validateLogin(body);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      const user = await authService.login(data);
      const token = await signToken({ userId: user.id, role: user.role });

      const response = NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 200 }
      );

      response.cookies.set(COOKIE_NAME, token, getCookieOptions());
      return response;
    } catch (err) {
      if (err.code === "INVALID_CREDENTIALS") {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      if (err.code === "ACCOUNT_INACTIVE") {
        return NextResponse.json(
          { error: "Your account has been deactivated. Contact support." },
          { status: 403 }
        );
      }
      console.error("[Auth] Login error:", err);
      return NextResponse.json(
        { error: "Login failed. Please try again." },
        { status: 500 }
      );
    }
  },

  /**
   * POST /api/auth/logout
   * Clears the auth cookie. JWT is stateless; clearing the cookie is sufficient.
   */
  async logout() {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // expire immediately
    });

    return response;
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user's profile (no passwordHash).
   * Auth is verified by authenticateUser middleware before this is called.
   */
  async me(userId) {
    try {
      const user = await authService.getMe(userId);
      return NextResponse.json({ user }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("[Auth] Me error:", err);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }
  },

  /**
   * POST /api/admin/workers
   * Creates a worker account. Admin-only. Role = "worker" — server-enforced.
   * Called from the admin domain, but auth logic lives here.
   */
  async createWorker(request) {
    try {
      const body = await request.json().catch(() => ({}));
      const { error, data } = validateCreateWorker(body);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      const result = await authService.createWorker(data);

      return NextResponse.json(
        {
          message: "Worker account created successfully",
          worker: result.user,
          workerProfile: result.workerProfile,
          temporaryPassword: result.temporaryPassword,
          note: "Share the temporary password securely with the worker. They should change it on first login.",
        },
        { status: 201 }
      );
    } catch (err) {
      if (err.code === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      console.error("[Auth] CreateWorker error:", err);
      return NextResponse.json(
        { error: "Failed to create worker account. Please try again." },
        { status: 500 }
      );
    }
  },
};
