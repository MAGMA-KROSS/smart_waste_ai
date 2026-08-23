"use client";
import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ConfidenceBadge({ confidence = 0, threshold = 0.7 }) {
  const pct = Math.round((confidence || 0) * 100);
  const isHigh = confidence >= Math.max(threshold, 0.85);
  const isOk = confidence >= threshold;
  const styles = isHigh
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : isOk
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-rose-50 border-rose-200 text-rose-700";
  const Icon = isOk ? CheckCircle2 : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      {pct}% confidence
    </span>
  );
}
