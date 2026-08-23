"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Navigation2, AlertCircle } from "lucide-react";

/**
 * NearbyBinButton - calls the EXISTING /api/bins/nearby endpoint (already
 * built in brain-service/bins) - not a new endpoint - then hands off to
 * the existing /citizen/find-bin page/map for directions.
 */
export default function NearbyBinButton({ binCategory = "all" }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleClick = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setMessage("Please enable location to find the nearest suitable collection point.");
      return;
    }
    setStatus("locating");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStatus("found");
        const params = new URLSearchParams({ category: binCategory, lat: String(lat), lng: String(lng) });

        try {
          const res = await fetch(`/api/bins/nearby?lat=${lat}&lng=${lng}&category=${encodeURIComponent(binCategory)}`);
          const data = await res.json();
          if (data?.bins?.[0]?._id) params.set("focus", data.bins[0]._id);
        } catch (err) {
          console.error("Nearby bin preview failed:", err);
          // Still hand off to Find Bin - the map there performs its own search.
        }
        router.push(`/citizen/find-bin?${params.toString()}`);
      },
      () => {
        setStatus("error");
        setMessage("Please enable location to find the nearest suitable collection point.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={status === "locating"}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors shadow-sm"
      >
        {status === "locating" ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            <span>Finding nearest bin&hellip;</span>
          </>
        ) : (
          <>
            <MapPin className="h-4.5 w-4.5" />
            <span>Find Nearest Suitable Bin</span>
            <Navigation2 className="h-4 w-4 opacity-70" />
          </>
        )}
      </button>
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
}
