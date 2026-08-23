"use client";
import React from "react";
import { Recycle, XCircle } from "lucide-react";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { getCategoryMeta } from "@ai/knowledge/wasteCategories.js";

export default function WasteDetectionCard({ classification }) {
  if (!classification) return null;
  const emoji = getCategoryMeta(classification.classId)?.emoji || "🗑️";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Waste Detected</p>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl shrink-0">{emoji}</div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{classification.wasteName}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ConfidenceBadge confidence={classification.confidence} />
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
              classification.recyclable ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-100 border-slate-200 text-slate-600"
            }`}>
              {classification.recyclable ? <Recycle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {classification.recyclable ? "Recyclable" : "Not Recyclable"}
            </span>
          </div>
        </div>
      </div>
      {classification.recommendedAction && (
        <div className="bg-slate-50 rounded-xl p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Recommended Action</p>
          <p className="text-sm text-slate-700 font-medium">{classification.recommendedAction}</p>
        </div>
      )}
    </div>
  );
}
