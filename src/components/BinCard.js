"use client";
import React from "react";
import { Navigation, MapPin, CheckCircle2, Clock, Trash2, ShieldCheck, ChevronRight } from "lucide-react";
import { getFillStatus, formatDistance, calculateWalkingTime, calculateDistance } from "@/lib/geoUtils";

export default function BinCard({
  bin,
  userLocation,
  isSelected = false,
  onSelect = () => {},
  onGetDirections = () => {},
}) {
  const distKm = calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
  const distanceStr = formatDistance(distKm);
  const walkTimeStr = calculateWalkingTime(distKm);
  const fillStatus = getFillStatus(bin.fillLevel);

  return (
    <div
      onClick={() => onSelect(bin)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer bg-white ${
        isSelected
          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-emerald-300 hover:shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {bin.id}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${fillStatus.badgeBg}`}>
              {fillStatus.status}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 text-base mt-1 group-hover:text-emerald-700 transition-colors">
            {bin.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{bin.address}</span>
          </p>
        </div>

        {/* Distance Badge */}
        <div className="text-right shrink-0 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
          <div className="text-sm font-bold text-emerald-800">{distanceStr}</div>
          <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{walkTimeStr} walk</span>
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
        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
          <Trash2 className="h-3 w-3 text-slate-400" />
          {bin.wasteType}
        </span>
        {bin.suitableItems.slice(0, 2).map((item) => (
          <span key={item} className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
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
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Get Directions</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(bin);
          }}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors"
        >
          <span>View Map</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
