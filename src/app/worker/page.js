"use client";
import React, { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  LogOut,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, routeRes] = await Promise.all([
          fetch("/api/worker/profile", { credentials: "include" }),
          fetch("/api/worker/route", { credentials: "include" }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }

        if (routeRes.ok) {
          const routeData = await routeRes.json();
          setRoute(routeData.route);
        }
      } catch (err) {
        console.error("Worker load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCollect = async (binId) => {
    setCollectingId(binId);
    try {
      const res = await fetch(`/api/worker/bins/${binId}/collect`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setRoute((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            bins: prev.bins.map((b) =>
              b.binId === binId ? { ...b, collected: true, fillLevel: 0 } : b
            ),
          };
        });
      }
    } catch (err) {
      console.error("Collect bin error:", err);
    } finally {
      setCollectingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Worker Portal</h1>
            <p className="text-xs text-slate-400">Municipal Collection Ops</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Driver Profile Status */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Active Shift</span>
            </div>
            <h2 className="text-xl font-bold">{profile?.userId?.name || "Municipal Worker"}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Emp ID: <span className="text-slate-200 font-mono">{profile?.employeeId || "MUN-WORKER"}</span> | Dept: {profile?.department || "Waste Ops"}
            </p>
          </div>
        </div>

        {/* Assigned Route */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-400" />
                Active Route Assignment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Optimized collection order for minimum fuel & max efficiency.
              </p>
            </div>

            {route && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase">
                {route.status}
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading assigned route...</p>
          ) : !route || !route.bins || route.bins.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/40" />
              <p className="font-semibold text-slate-300">No Active Collection Route</p>
              <p className="text-xs max-w-xs mx-auto">
                No route assigned by municipality dispatcher yet. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {route.bins.map((bin, idx) => (
                <div
                  key={bin.binId || idx}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    bin.collected
                      ? "bg-slate-900/50 border-slate-700/50 opacity-60"
                      : "bg-slate-800/90 border-slate-600 shadow-md"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                        {bin.order || idx + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-100">{bin.name}</span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                      <span>{bin.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          bin.fillLevel >= 80 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {bin.fillLevel}% Fill
                      </span>
                    </div>

                    {bin.collected ? (
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="h-4 w-4" />
                        Collected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCollect(bin.binId)}
                        disabled={collectingId === bin.binId}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition shadow-md flex items-center space-x-1"
                      >
                        {collectingId === bin.binId && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        <span>Mark Collected</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
