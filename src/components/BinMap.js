"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import with SSR disabled for Leaflet compatibility
const BinMapInner = dynamic(() => import("./BinMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      <span className="text-sm font-medium text-slate-600">Loading City Dustbin Map...</span>
    </div>
  ),
});

export default function BinMap(props) {
  return <BinMapInner {...props} />;
}
