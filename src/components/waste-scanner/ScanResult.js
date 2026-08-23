"use client";
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import WasteDetectionCard from "./WasteDetectionCard";
import DisposalInfo from "./DisposalInfo";
import UpcyclingIdeas from "./UpcyclingIdeas";
import TutorialVideos from "./TutorialVideos";
import NearbyBinButton from "./NearbyBinButton";

export default function ScanResult({ classification, recommendation, error, onRetry }) {
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-slate-900">Scan Failed</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">{error}</p>
        <button onClick={onRetry} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (classification?.uncertain) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-slate-900">We&apos;re not confident about this one</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">{classification.message}</p>
        {classification.wasteName && (
          <p className="text-xs text-slate-400">
            Best guess: {classification.wasteName} ({Math.round((classification.confidence || 0) * 100)}%)
          </p>
        )}
        <button onClick={onRetry} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg">
          <RefreshCw className="h-4 w-4" />
          Scan Again
        </button>
      </div>
    );
  }

  if (!classification) return null;

  return (
    <div className="space-y-4">
      <WasteDetectionCard classification={classification} />
      <DisposalInfo classification={classification} />
      <UpcyclingIdeas recommendation={recommendation} />
      {recommendation?.videos?.length > 0 && <TutorialVideos videos={recommendation.videos} />}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
        <h3 className="font-bold text-slate-900">Dispose Responsibly</h3>
        <NearbyBinButton binCategory={classification.nearestBinCategory} />
      </div>

      <div className="text-center pt-2">
        <button onClick={onRetry} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
          <RefreshCw className="h-4 w-4" />
          Scan Another Item
        </button>
      </div>
    </div>
  );
}
