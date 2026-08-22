"use client";
/**
 * src/app/citizen/register/page.js
 * Citizen-only registration page.
 * Uses window.location.href to guarantee clean navigation with set-cookie header.
 */

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("Please accept the Terms of Service.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Hard redirect to dashboard so browser attaches the set-cookie swai_token header cleanly
      window.location.href = "/citizen/dashboard";
    } catch (err) {
      console.error("Register form submission error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff] text-[#121c2a]">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center px-6 md:px-16 py-16 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl text-emerald-700">🌱</span>
            <span className="text-2xl font-bold text-[#004532]">SmartWaste AI</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <h1 className="text-3xl md:text-4xl font-semibold mb-1">Join the Movement</h1>
          <p className="text-base text-[#3f4944] mb-2">
            Create your citizen account to start building a cleaner, smarter city.
          </p>
          <p className="text-xs text-emerald-700 font-medium mb-8 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
            🔒 Public registration creates a Citizen account. Municipal staff must be invited by an admin.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Raj Yadav"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#cfd5e5] rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#cfd5e5] rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">
                Phone Number <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#cfd5e5] rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition"
              />
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#cfd5e5] rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f8f9ff] border border-[#cfd5e5] rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-emerald-700 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the <span className="text-emerald-700 underline font-medium cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-emerald-700 underline font-medium cursor-pointer">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#004532] hover:bg-[#003425] text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-2 text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Citizen Account</span>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <p className="mt-8 text-center text-sm text-[#3f4944]">
            Already registered?{" "}
            <Link href="/citizen/login" className="text-[#004532] font-semibold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE SHOWCASE */}
      <div className="hidden lg:flex lg:w-[40%] bg-emerald-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 opacity-90"></div>
        <div className="relative z-10 space-y-4">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Smart City Initiative
          </span>
          <h2 className="text-3xl font-extrabold leading-tight">
            Clean Cities Start With Responsible Citizens
          </h2>
          <p className="text-emerald-100/80 text-sm">
            Join thousands of citizens using SmartWaste AI to locate nearby dustbins, segregate waste streams, and report overflowing bins in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
