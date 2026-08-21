"use client";
import React, { useState } from "react";
import { X, Navigation, MapPin, Clock, CheckCircle2, Footprints, ArrowRight, ShieldCheck } from "lucide-react";
import { formatDistance, calculateWalkingTime, calculateDistance, getFillStatus } from "@/lib/geoUtils";

export default function DirectionsModal({ bin, userLocation, onClose = () => {} }) {
  const [navigating, setNavigating] = useState(false);

  if (!bin) return null;

  const distKm = calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
  const distanceStr = formatDistance(distKm);
  const walkTimeStr = calculateWalkingTime(distKm);
  const fillStatus = getFillStatus(bin.fillLevel);

  // Generate simulated turn-by-turn steps based on destination address
  const steps = [
    { instruction: `Start walking from your current location (${userLocation.address})`, distance: "30 m" },
    { instruction: "Head towards the main walkway and follow green eco-signage", distance: "60 m" },
    { instruction: `Turn towards ${bin.address}`, distance: `${Math.round((distKm * 1000) - 90)} m` },
    { instruction: `Arrive at ${bin.name} (${bin.id})`, distance: "10 m" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[11px] font-mono px-2 py-0.5 rounded font-semibold">
                {bin.id}
              </span>
              <span className="bg-emerald-500/30 text-emerald-100 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                Walking Route
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1.5">{bin.name}</h2>
            <p className="text-xs text-emerald-100/90 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{bin.address}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Route Overview Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Distance</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{distanceStr}</div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Est. Walk Time</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>{walkTimeStr}</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Bin Status</div>
            <div className={`text-xs font-bold mt-1 ${fillStatus.textColor}`}>{bin.fillLevel}% Full</div>
          </div>
        </div>

        {/* Suitable Waste Types Notice */}
        <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <strong>Suitable for:</strong> {bin.suitableItems.join(", ")}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Footprints className="h-4 w-4 text-slate-500" />
            <span>Turn-by-Turn Directions</span>
          </h3>

          <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 relative z-10">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                    idx === steps.length - 1
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  {idx === steps.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="pt-1 flex-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{step.instruction}</p>
                  <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">{step.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={() => setNavigating(!navigating)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
              navigating
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>{navigating ? "Navigation Active (Simulating...)" : "Start Navigation"}</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
