"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ReportModal from "@/components/ReportModal";
import {
  MapPin,
  Scan,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function CitizenDashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchReports = async () => {
    try {
      const userRes = await fetch("/api/auth/me", { credentials: "include" });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      const reportsRes = await fetch("/api/reports/my", { credentials: "include" });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activePage="dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Citizen Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Citizen"}!
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Thank you for contributing to a cleaner, smarter city.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl border border-white/20 text-sm font-semibold flex items-center space-x-2 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/citizen/find-bin"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                Find Nearby Bins
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Locate smart bins near your GPS position with live fill status and turn-by-turn navigation.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
              <span>Open Map</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/citizen/find-bin"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Scan className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">
                AI Waste Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan waste items to receive instant upcycling ideas and proper disposal bin recommendations.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
              <span>Scan Item</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Link>

          {/* Interactive Report Bin Problem Card */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 text-left transition group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-700 transition-colors">
                Report Bin Problem
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Report overflowing, damaged, or blocked bins directly to municipal authorities.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600">
              <span>Click to Submit Issue Report</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </button>
        </div>

        {/* My Activity & Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-lg">My Reported Issues</h2>
            <span className="text-xs text-slate-500 font-medium">
              {reports.length} Report(s) Submitted
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-4">Loading reports...</p>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/50" />
              <p className="text-sm font-medium text-slate-600">No reported issues yet</p>
              <p className="text-xs text-slate-400">
                If you encounter an overflowing or damaged bin, click &quot;Report Bin Problem&quot; above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                        {report.type}
                      </span>
                      <span className="font-semibold text-slate-700">{report.binId}</span>
                    </div>
                    <p className="text-slate-500">{report.description || "No additional notes"}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        report.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : report.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <ReportModal
          onClose={() => setIsReportModalOpen(false)}
          onReportSubmitted={() => fetchReports()}
        />
      )}
    </div>
  );
}
