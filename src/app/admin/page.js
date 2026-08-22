"use client";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Trash2,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  RefreshCw,
  LogOut,
  Shield,
  Loader2,
  Navigation,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bins, setBins] = useState([]);
  const [reports, setReports] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Worker creation modal state
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({ name: "", email: "", employeeId: "", department: "Waste Collection" });
  const [workerMsg, setWorkerMsg] = useState(null);
  const [creatingWorker, setCreatingWorker] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [dashRes, binsRes, reportsRes, workersRes] = await Promise.all([
        fetch("/api/admin/dashboard", { credentials: "include" }),
        fetch("/api/admin/bins", { credentials: "include" }),
        fetch("/api/admin/reports", { credentials: "include" }),
        fetch("/api/admin/workers", { credentials: "include" }),
      ]);

      if (dashRes.ok) setStats(await dashRes.json());
      if (binsRes.ok) {
        const d = await binsRes.json();
        setBins(d.bins || []);
      }
      if (reportsRes.ok) {
        const d = await reportsRes.json();
        setReports(d.reports || []);
      }
      if (workersRes.ok) {
        const d = await workersRes.json();
        setWorkers(d.workers || []);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setCreatingWorker(true);
    setWorkerMsg(null);
    try {
      const res = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(workerForm),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkerMsg({ type: "success", text: `Worker created! Temp password: ${data.temporaryPassword}` });
        setWorkerForm({ name: "", email: "", employeeId: "", department: "Waste Collection" });
        loadDashboard();
      } else {
        setWorkerMsg({ type: "error", text: data.error || "Failed to create worker" });
      }
    } catch (err) {
      setWorkerMsg({ type: "error", text: "Network error creating worker" });
    } finally {
      setCreatingWorker(false);
    }
  };

  const handleGenerateRoute = async () => {
    try {
      const res = await fetch("/api/admin/routes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ minFillLevel: 60 }),
      });
      if (res.ok) {
        alert("AI Collection Route generated successfully!");
      }
    } catch (err) {
      console.error("Generate route error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
              Municipal Waste Command Center
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-semibold">
                ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-400">City-Wide Infrastructure Control</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateRoute}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Generate AI Route</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Smart Bins</p>
            <p className="text-3xl font-extrabold mt-2 text-white">{stats?.totalBins || 0}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
            <p className="text-xs text-rose-400 font-semibold uppercase">Critical Bins (&gt;80%)</p>
            <p className="text-3xl font-extrabold mt-2 text-rose-400">{stats?.criticalBins || 0}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
            <p className="text-xs text-amber-400 font-semibold uppercase">Pending Citizen Reports</p>
            <p className="text-3xl font-extrabold mt-2 text-amber-400">{stats?.pendingReports || 0}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
            <p className="text-xs text-emerald-400 font-semibold uppercase">Active Fleet Workers</p>
            <p className="text-3xl font-extrabold mt-2 text-emerald-400">{stats?.totalWorkers || 0}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 space-x-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition ${
              activeTab === "overview"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bins Overview ({bins.length})
          </button>
          <button
            onClick={() => setActiveTab("workers")}
            className={`pb-3 transition ${
              activeTab === "workers"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Worker Management ({workers.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 transition ${
              activeTab === "reports"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Citizen Reports ({reports.length})
          </button>
        </div>

        {/* TAB 1: BINS OVERVIEW */}
        {activeTab === "overview" && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-sm">City Waste Bins Status</h3>
              <button
                onClick={loadDashboard}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Bin ID</th>
                    <th className="p-3">Name & Address</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Fill Level</th>
                    <th className="p-3">Last Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {bins.map((bin) => (
                    <tr key={bin.binId || bin.id} className="hover:bg-slate-700/30">
                      <td className="p-3 font-mono font-bold text-slate-200">{bin.binId || bin.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{bin.name}</div>
                        <div className="text-[11px] text-slate-400">{bin.address}</div>
                      </td>
                      <td className="p-3 uppercase font-semibold text-[10px]">{bin.category}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            bin.fillLevel >= 80 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {bin.fillLevel}%
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{bin.lastCollected || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WORKER MANAGEMENT */}
        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Municipal Workers</h3>
              <button
                onClick={() => setIsWorkerModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Create Worker Account</span>
              </button>
            </div>

            {/* Worker Creation Modal */}
            {isWorkerModalOpen && (
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 max-w-lg">
                <h4 className="font-bold text-sm text-emerald-400">Add Municipal Collection Worker</h4>
                {workerMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      workerMsg.type === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {workerMsg.text}
                  </div>
                )}
                <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 text-slate-300">Worker Name</label>
                    <input
                      type="text"
                      required
                      value={workerForm.name}
                      onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={workerForm.email}
                      onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MUN-1024"
                      value={workerForm.employeeId}
                      onChange={(e) => setWorkerForm({ ...workerForm, employeeId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWorkerModalOpen(false)}
                      className="px-3 py-1.5 bg-slate-700 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingWorker}
                      className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg"
                    >
                      {creatingWorker ? "Creating..." : "Create Worker"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Employee ID</th>
                    <th className="p-3">Name & Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {workers.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-700/30">
                      <td className="p-3 font-mono font-bold text-slate-200">{w.employeeId}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{w.userId?.name || "N/A"}</div>
                        <div className="text-[11px] text-slate-400">{w.userId?.email || "N/A"}</div>
                      </td>
                      <td className="p-3">{w.department}</td>
                      <td className="p-3 uppercase font-semibold text-[10px] text-emerald-400">
                        {w.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REPORTS */}
        {activeTab === "reports" && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Bin ID</th>
                  <th className="p-3">Issue Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Reported By</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-slate-200">{r.binId}</td>
                    <td className="p-3 uppercase font-bold text-amber-400 text-[10px]">{r.type}</td>
                    <td className="p-3 text-slate-400">{r.description || "N/A"}</td>
                    <td className="p-3">{r.reportedBy?.name || "Citizen"}</td>
                    <td className="p-3 uppercase font-semibold text-[10px]">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
