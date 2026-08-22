"use client";
/**
 * src/app/citizen/register/page.js
 * Citizen-only registration.
 * Design preserved from original signup.js (blue-gray theme).
 * Municipal Staff toggle REMOVED — public registration ALWAYS creates "citizen".
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
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
          // NOTE: role is NOT sent — backend always assigns "citizen"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      // Always citizen — redirect to citizen dashboard
      router.push("/citizen/dashboard");
    } catch {
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
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              {/* FULL NAME */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3 border border-[#bec9c2] rounded-md bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3 border border-[#bec9c2] rounded-md bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* PHONE */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-1">
                  Phone Number{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-11 px-3 border border-[#bec9c2] rounded-md bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* PASSWORD + CONFIRM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full h-11 px-3 pr-10 border border-[#bec9c2] rounded-md bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-3 border border-[#bec9c2] rounded-md bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* TERMS */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 accent-emerald-700"
              />
              <label htmlFor="terms" className="text-sm text-[#3f4944]">
                I agree to the{" "}
                <a href="#" className="text-emerald-700 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-emerald-700 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex justify-center items-center bg-[#065f46] hover:bg-[#00462f] disabled:opacity-60 text-white font-semibold rounded-md transition shadow-sm gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Citizen Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#3f4944]">
              Already have an account?{" "}
              <Link href="/citizen/login" className="font-semibold text-[#065f46] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:block lg:w-[40%] relative overflow-hidden bg-[#d9e3f6]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHK98I-YSSLOx85Nl_gmJe4r4b0jQhY9pmwXl1JLaPceghWy7YYiQ48qh_yNTQarJyN2qHL18X7B5z7AhQz-J3n9dnu_9QA1z_hn9aitDbvy4yvRfQHciXQCz6-MRjUqOLaSTde9URJKz0ycZBpMKoRoH0sc4FbTpaw8-Y5wQxf0nDCBNJOpeku1mRoWNMl4FgshVAl-180Z_kSlpcBM5p5Jo3S_mwFFq_LVxLVuPvucWnoS2r5XHh')",
          }}
        />
        <div className="absolute inset-0 bg-[#004532]/10 backdrop-blur-[2px]" />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-xl text-emerald-700">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-[#121c2a]">Intelligent Logistics</h3>
            </div>
            <p className="text-sm text-[#3f4944] leading-relaxed">
              Join thousands of citizens contributing to data-driven, sustainable waste management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
