"use client";
import React from "react";
import { Layers, Recycle, ShieldCheck, AlertTriangle } from "lucide-react";
import HazardWarning from "./HazardWarning";

export default function DisposalInfo({ classification }) {
  if (!classification) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4.5 w-4.5 text-emerald-600" />
        <h3 className="font-bold text-slate-900">Disposal Information</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Material</p>
          <p className="text-slate-800 font-semibold mt-0.5">{classification.materialDetail}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Disposal Method</p>
          <p className="text-slate-800 font-semibold mt-0.5">{classification.disposalMethod}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2">
          <Recycle className={`h-4 w-4 ${classification.recyclable ? "text-emerald-600" : "text-slate-400"}`} />
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Recyclable</p>
            <p className="text-slate-800 font-semibold">{classification.recyclable ? "Yes" : "No"}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2">
          {classification.hazardous ? <AlertTriangle className="h-4 w-4 text-rose-600" /> : <ShieldCheck className="h-4 w-4 text-emerald-600" />}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Hazardous</p>
            <p className={`font-semibold ${classification.hazardous ? "text-rose-700" : "text-slate-800"}`}>
              {classification.hazardous ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
      {classification.hazardous && <HazardWarning message={classification.recommendedAction} />}
    </div>
  );
}
