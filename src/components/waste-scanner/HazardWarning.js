"use client";
import React from "react";
import { ShieldAlert } from "lucide-react";

export default function HazardWarning({ message }) {
  return (
    <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-bold text-rose-800 text-sm">Hazardous Waste Detected</h4>
        <p className="text-rose-700 text-sm mt-0.5">
          {message || "Dispose through an authorized collection point."}
        </p>
        <p className="text-rose-600/80 text-xs mt-1.5">
          For your safety, DIY/upcycling suggestions are not shown for hazardous items.
        </p>
      </div>
    </div>
  );
}
