"use client";
import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label, size = "h-5 w-5", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-slate-500 ${className}`}>
      <Loader2 className={`${size} animate-spin text-emerald-600`} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
