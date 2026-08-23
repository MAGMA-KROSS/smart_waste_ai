"use client";
import React from "react";
import { ScanLine, BookOpen, Sparkles, Video, CheckCircle2 } from "lucide-react";

const STAGES = [
  { id: "analyzing", label: "Analyzing image with AI vision model", icon: ScanLine },
  { id: "knowledge", label: "Looking up verified waste knowledge base", icon: BookOpen },
  { id: "generating", label: "Generating recycling & DIY recommendations", icon: Sparkles },
  { id: "videos", label: "Finding tutorial videos", icon: Video },
];

/**
 * ScanLoading
 * Props:
 *  - stage: one of STAGES[].id - current pipeline stage, purely visual.
 */
export default function ScanLoading({ stage = "analyzing" }) {
  const activeIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse">
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Scanning your waste&hellip;</h3>
          <p className="text-xs text-slate-500">This usually takes a few seconds.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {STAGES.map((s, idx) => {
          const Icon = s.icon;
          const isDone = activeIndex > idx;
          const isActive = activeIndex === idx;
          return (
            <li key={s.id} className="flex items-center gap-3">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-emerald-100 text-emerald-600 animate-pulse"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={`text-sm ${
                  isDone
                    ? "text-slate-400 line-through"
                    : isActive
                    ? "text-slate-900 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
