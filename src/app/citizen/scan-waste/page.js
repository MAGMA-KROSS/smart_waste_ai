"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import WasteScanner from "@/components/waste-scanner/WasteScanner";
import { Sparkles, ScanLine } from "lucide-react";

export default function ScanWastePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activePage="scan" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Waste Scanner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
              <ScanLine className="h-7 w-7 text-emerald-400" />
              Identify. Understand. Recycle.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              Take a photo or upload an image of your waste. Our AI will identify it, tell you how
              to dispose of it safely, suggest upcycling ideas, and show relevant tutorial videos.
            </p>
          </div>
        </div>

        <WasteScanner />
      </main>
    </div>
  );
}
