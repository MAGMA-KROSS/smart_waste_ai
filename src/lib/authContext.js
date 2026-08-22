"use client";
/**
 * src/lib/authContext.js
 *
 * React context for authentication state management.
 * Since JWT is in an HttpOnly cookie (not readable by JS),
 * we call /api/auth/me on mount to get the current user.
 *
 * Usage:
 *   const { user, loading, login, logout } = useAuth();
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount, try to get the current user from the cookie
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /** Login: calls API, updates user state, redirects based on role */
  const login = useCallback(async ({ email, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setUser(data.user);

    // Redirect based on role
    if (data.user.role === "admin") router.push("/admin");
    else if (data.user.role === "worker") router.push("/worker");
    else router.push("/citizen/dashboard");

    return data.user;
  }, [router]);

  /** Register: calls API, updates user state, redirects to citizen dashboard */
  const register = useCallback(async ({ name, email, password }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    setUser(data.user);
    router.push("/citizen/dashboard");
    return data.user;
  }, [router]);

  /** Logout: calls API, clears state, redirects to home */
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
