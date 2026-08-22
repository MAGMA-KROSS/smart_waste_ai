"use client";
import React, { useState } from "react";
import { X, AlertCircle, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ReportModal({ bin, onClose = () => {}, onReportSubmitted = () => {} }) {
  const [binId, setBinId] = useState(bin?.binId || bin?.id || "BIN-JSS-01");
  const [type, setType] = useState("overflow");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          binId,
          binName: bin?.name || `Smart Bin (${binId})`,
          type,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report. Please log in.");
        return;
      }

      setSuccessMsg("Report submitted successfully to municipal authorities!");
      onReportSubmitted(data.report);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Report Bin Issue
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              Notify municipal workers about damaged or overflowing bins.
            </p>
          </div>
          <button onClick={onClose} className="p-1 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}

          {/* Bin ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Bin ID *</label>
            <input
              type="text"
              required
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="overflow">Bin Overflowing</option>
              <option value="damaged">Bin Damaged / Broken</option>
              <option value="blocked">Bin Blocked / Inaccessible</option>
              <option value="missing">Bin Missing / Stolen</option>
              <option value="other">Other Concern</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Details</label>
            <textarea
              rows={3}
              placeholder="Describe the condition or exact landmark..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Issue Report</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
