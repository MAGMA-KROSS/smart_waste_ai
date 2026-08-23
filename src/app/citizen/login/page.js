"use client";
/**
 * src/app/citizen/login/page.js
 * Citizen/Worker/Admin login page.
 * Design preserved from original login.js (emerald theme, split layout).
 * Connects to POST /api/auth/login — role determined server-side.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Recycle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      // Redirect based on redirect parameter or user role
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectParam = params?.get("redirect");

      const { role } = data.user;
      if (redirectParam && redirectParam.startsWith("/")) {
        router.push(redirectParam);
      } else if (role === "admin") {
        router.push("/admin");
      } else if (role === "worker") {
        router.push("/worker");
      } else {
        router.push("/citizen/dashboard");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-[60%] flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Recycle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800">SmartWaste AI</h2>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Enter your credentials to access your SmartWaste dashboard.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition"
                required
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-800">
                  Password
                </label>
                <Link href="#" className="text-sm text-emerald-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 transition"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-emerald-700"
              />
              <label htmlFor="remember" className="text-sm text-gray-500">
                Remember me for 30 days
              </label>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-sm text-gray-400">Or</span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => alert("Google OAuth — coming soon!")}
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="text-xl font-bold text-blue-500">G</span>
              Continue with Google
            </button>
          </form>

          {/* REGISTER */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/citizen/register" className="text-emerald-700 font-semibold hover:underline">
              Register as Citizen
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-3">
            Municipal staff?{" "}
            <span className="text-gray-500 font-medium">Contact your administrator for access.</span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="hidden lg:block lg:w-[40%] bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/40" />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">SmartWaste AI</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Connecting citizens, workers, and municipalities for smarter waste management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
