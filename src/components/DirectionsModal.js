"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  Footprints,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Compass,
  RotateCcw,
} from "lucide-react";
import {
  formatDistance,
  calculateWalkingTime,
  calculateDistance,
  getFillStatus,
  fetchWalkingRoute,
  getNavigationUrl,
} from "@/lib/geoUtils";

export default function DirectionsModal({
  bin,
  userLocation,
  routeData = null,
  onClose = () => {},
}) {
  const [activeRoute, setActiveRoute] = useState(routeData);
  const [loading, setLoading] = useState(!routeData);
  const [error, setError] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [inAppNavActive, setInAppNavActive] = useState(false);

  useEffect(() => {
    if (routeData) {
      setActiveRoute(routeData);
      setLoading(false);
      return;
    }

    if (!bin || !userLocation) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchWalkingRoute(userLocation.lat, userLocation.lng, bin.lat, bin.lng)
      .then((data) => {
        if (isMounted) {
          setActiveRoute(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load route in modal:", err);
          setError("Could not load walking path. Using approximate walking estimate.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bin, userLocation, routeData]);

  if (!bin) return null;

  const directDistKm = calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
  const fallbackDistanceStr = formatDistance(directDistKm);
  const fallbackWalkTimeStr = calculateWalkingTime(directDistKm);
  const fillStatus = getFillStatus(bin.fillLevel);

  const displayDistance = activeRoute?.distanceText || fallbackDistanceStr;
  const displayDuration = activeRoute?.durationText || fallbackWalkTimeStr;
  const steps = activeRoute?.steps && activeRoute.steps.length > 0
    ? activeRoute.steps
    : [
        { instruction: `Start walking from your location (${userLocation.address || "Current Position"})`, distance: "30 m", type: "depart" },
        { instruction: `Walk towards ${bin.address}`, distance: fallbackDistanceStr, type: "continue" },
        { instruction: `Arrive at ${bin.name} (${bin.id})`, distance: "10 m", type: "arrive" },
      ];

  const handleExternalMaps = () => {
    const url = getNavigationUrl(userLocation.lat, userLocation.lng, bin.lat, bin.lng, bin.name);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStepIcon = (type, isLast) => {
    if (isLast) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (type?.includes("left")) return <CornerUpLeft className="h-4 w-4 text-emerald-600" />;
    if (type?.includes("right")) return <CornerUpRight className="h-4 w-4 text-emerald-600" />;
    if (type === "depart") return <Compass className="h-4 w-4 text-blue-600" />;
    if (type === "uturn") return <RotateCcw className="h-4 w-4 text-amber-600" />;
    return <ArrowUp className="h-4 w-4 text-emerald-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 flex items-start justify-between relative">
          <div className="pr-6">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-md font-semibold">
                {bin.id}
              </span>
              <span className="bg-emerald-500/30 text-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Footprints className="h-3 w-3" />
                <span>Pedestrian Route</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1.5 leading-snug">{bin.name}</h2>
            <p className="text-xs text-emerald-100/90 flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{bin.address}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
            aria-label="Close directions modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Route Overview Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-4 bg-slate-50 border-b border-slate-200 text-center">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Walking Distance</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{displayDistance}</div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Duration</div>
            <div className="text-base font-extrabold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>{displayDuration}</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fill Level</div>
            <div className={`text-xs font-extrabold mt-1 ${fillStatus.textColor}`}>{bin.fillLevel}% ({fillStatus.status})</div>
          </div>
        </div>

        {/* Suitable Waste Notice */}
        <div className="px-5 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <strong>Accepts:</strong> {bin.suitableItems ? bin.suitableItems.join(", ") : "All general refuse"}
          </div>
        </div>

        {/* Step-by-Step Instructions Container */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Footprints className="h-4 w-4 text-slate-600" />
              <span>Turn-by-Turn Walking Directions</span>
            </h3>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Routing via OSRM...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              {error}
            </div>
          )}

          {inAppNavActive && (
            <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-md space-y-2 border border-emerald-700 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                  Live Step Guidance (Step {activeStepIndex + 1} of {steps.length})
                </span>
                <button
                  onClick={() => setInAppNavActive(false)}
                  className="text-xs text-emerald-200 hover:text-white underline cursor-pointer"
                >
                  Exit Guidance
                </button>
              </div>
              <p className="text-base font-bold text-white">
                {steps[activeStepIndex]?.instruction}
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-800/80">
                <span className="text-emerald-200 font-semibold">{steps[activeStepIndex]?.distance}</span>
                <div className="flex gap-2">
                  <button
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white font-medium cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    disabled={activeStepIndex >= steps.length - 1}
                    onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 font-bold rounded-lg cursor-pointer"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              const isCurrentStep = inAppNavActive && activeStepIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (inAppNavActive) setActiveStepIndex(idx);
                  }}
                  className={`flex items-start space-x-3 relative z-10 transition-all ${
                    isCurrentStep ? "scale-[1.02]" : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      isLast
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : isCurrentStep
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-500/40"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    {getStepIcon(step.type, isLast)}
                  </div>
                  <div
                    className={`pt-1 flex-1 p-3 rounded-2xl border transition-all ${
                      isCurrentStep
                        ? "bg-emerald-50 border-emerald-300 shadow-xs"
                        : "bg-slate-50/70 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {step.instruction}
                    </p>
                    <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                      {step.distance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={() => {
              setInAppNavActive(true);
              setActiveStepIndex(0);
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Navigation className="h-4 w-4" />
            <span>{inAppNavActive ? "Step Guidance Active" : "In-App Guidance"}</span>
          </button>

          <button
            onClick={handleExternalMaps}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            title="Open in Google Maps / Native Maps Navigation"
          >
            <ExternalLink className="h-4 w-4 text-emerald-400" />
            <span>Launch Maps App</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
