"use client";
import React from "react";
import { Sparkles, Wand2 } from "lucide-react";

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-rose-50 text-rose-700 border-rose-200",
};
const IDEA_EMOJIS = ["🖊️", "🪴", "🗂️", "🎨", "🧺", "🕯️"];

export default function UpcyclingIdeas({ recommendation }) {
  if (!recommendation) return null;
  const { recommendations = [], upcyclingIdeasDetailed = [], aiAvailable } = recommendation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
        <h3 className="font-bold text-slate-900">Recycling Recommendation</h3>
      </div>
      <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
        {recommendations.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      {!aiAvailable && (
        <p className="text-xs text-slate-400">
          AI-generated recommendations are unavailable right now, but the verified disposal
          information above is still accurate.
        </p>
      )}

      {upcyclingIdeasDetailed.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">What can you make?</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {upcyclingIdeasDetailed.map((idea, idx) => (
              <div key={`${idea.title}-${idx}`} className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{IDEA_EMOJIS[idx % IDEA_EMOJIS.length]}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[idea.difficulty] || DIFFICULTY_STYLES.Easy}`}>
                    {idea.difficulty || "Easy"}
                  </span>
                </div>
                <h5 className="font-semibold text-slate-800 text-sm">{idea.title}</h5>
                {idea.description && <p className="text-xs text-slate-500 leading-relaxed">{idea.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
