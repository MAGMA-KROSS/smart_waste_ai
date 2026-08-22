"use client";
import React from "react";
import { Navigation, MapPin, CheckCircle2, Clock, Trash2, ShieldCheck, ChevronRight } from "lucide-react";
import { getFillStatus, formatDistance, calculateWalkingTime, calculateDistance } from "@/lib/geoUtils";

export default function BinCard({
  bin,
  userLocation,
  isSelected = false,
  isCalculating = false,
  hasActiveRoute = false,
  activeRouteData = null,
  onSelect = () => {},
  onGetDirections = () => {},
}) {
  const distKm = calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
  const distanceStr = hasActiveRoute && activeRouteData?.distanceText ? activeRouteData.distanceText : formatDistance(distKm);
  const walkTimeStr = hasActiveRoute && activeRouteData?.durationText ? activeRouteData.durationText : calculateWalkingTime(distKm);
  const fillStatus = getFillStatus(bin.fillLevel);

  return (
    <div
      onClick={() => onSelect(bin)}
      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
        hasActiveRoute
          ? "border-emerald-500 shadow-lg ring-2 ring-emerald-500/30 bg-emerald-50/10"
          : isSelected
          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-emerald-300 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {bin.id}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${fillStatus.badgeBg}`}>
              {fillStatus.status}
            </span>
            {hasActiveRoute && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                <span>Active Route</span>
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-1 group-hover:text-emerald-700 transition-colors">
            {bin.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{bin.address}</span>
          </p>
        </div>

        {/* Distance Badge */}
        <div className={`text-right shrink-0 rounded-xl px-2.5 py-1.5 border ${hasActiveRoute ? 'bg-emerald-100 border-emerald-300' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="text-sm font-extrabold text-emerald-900">{distanceStr}</div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{walkTimeStr}</span>
          </div>
        </div>
      </div>

      {/* Fill Level Meter */}
      <div className="mt-3 mb-3">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-500 font-medium">Capacity Fill</span>
          <span className={`font-bold ${fillStatus.textColor}`}>{bin.fillLevel}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fillStatus.bgColor}`}
            style={{ width: `${bin.fillLevel}%` }}
          />
        </div>
      </div>

      {/* Suitable Waste Categories */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Trash2 className="h-3 w-3 text-slate-400" />
          {bin.wasteType}
        </span>
        {bin.suitableItems && bin.suitableItems.slice(0, 2).map((item) => (
          <span key={item} className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100">
            {item}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGetDirections(bin);
          }}
          disabled={isCalculating}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Navigation className={`h-3.5 w-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? "Calculating Route..." : hasActiveRoute ? "View Directions" : "Get Directions"}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(bin);
          }}
          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>View</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}

