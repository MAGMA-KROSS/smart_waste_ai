"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { getFillStatus, formatDistance, calculateWalkingTime, calculateDistance } from "@/lib/geoUtils";

export default function BinMapInner({
  bins = [],
  selectedBin = null,
  userLocation = { lat: 28.6139, lng: 77.2090 },
  onSelectBin = () => {},
  onGetDirections = () => {},
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  // Helper to create custom SVG bin marker HTML
  const createBinIcon = (fillLevel, isSelected = false) => {
    const status = getFillStatus(fillLevel);
    const size = isSelected ? 44 : 36;
    const border = isSelected ? 'border-4 border-slate-900 shadow-xl scale-110' : 'border-2 border-white shadow-md';

    return L.divIcon({
      className: "custom-bin-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${status.hex};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: ${isSelected ? '3px solid #0F172A' : '2px solid #FFFFFF'};
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s ease, border 0.2s ease;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Helper for User Pulsing Location Icon
  const createUserIcon = () => {
    return L.divIcon({
      className: "user-location-marker",
      html: `
        <div class="user-pulse-marker">
          <div class="user-pulse-marker-inner"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Markers & User Position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add User Location Marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserIcon(),
      zIndexOffset: 1000,
    }).addTo(map);
    userMarker.bindPopup("<b>You are here</b><br>Sector 62, Noida");
    markersRef.current["USER"] = userMarker;

    // Add Bin Markers
    bins.forEach((bin) => {
      const isSelected = selectedBin?.id === bin.id;
      const marker = L.marker([bin.lat, bin.lng], {
        icon: createBinIcon(bin.fillLevel, isSelected),
        zIndexOffset: isSelected ? 900 : 100,
      }).addTo(map);

      const distKm = calculateDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
      const formattedDist = formatDistance(distKm);
      const walkTime = calculateWalkingTime(distKm);
      const status = getFillStatus(bin.fillLevel);

      const popupContent = document.createElement("div");
      popupContent.className = "p-1 min-w-[200px]";
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-bold text-slate-900 text-sm">${bin.name}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badgeBg}">${status.status}</span>
        </div>
        <div class="text-xs text-slate-500 mb-2">${bin.address}</div>
        
        <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg mb-3 border border-slate-100">
          <div>
            <div class="text-slate-400 text-[10px]">Distance</div>
            <div class="font-semibold text-slate-800">${formattedDist} (${walkTime})</div>
          </div>
          <div>
            <div class="text-slate-400 text-[10px]">Fill Level</div>
            <div class="font-semibold ${status.textColor}">${bin.fillLevel}%</div>
          </div>
        </div>

        <div class="text-[11px] text-slate-600 mb-3">
          <strong class="text-slate-700">Accepts:</strong> ${bin.suitableItems.slice(0, 2).join(", ")}
        </div>

        <button id="directions-btn-${bin.id}" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors">
          <span>Get Directions</span>
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onSelectBin(bin);
      });

      // Bind button inside popup
      marker.on("popupopen", () => {
        const btn = document.getElementById(`directions-btn-${bin.id}`);
        if (btn) {
          btn.addEventListener("click", () => {
            onGetDirections(bin);
          });
        }
      });

      markersRef.current[bin.id] = marker;
    });
  }, [bins, selectedBin, userLocation, onGetDirections, onSelectBin]);

  // Handle Selected Bin Focus & Navigation Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (selectedBin) {
      map.flyTo([selectedBin.lat, selectedBin.lng], 16, {
        duration: 1.2,
      });

      // Draw walking line from user to selected bin
      const latlngs = [
        [userLocation.lat, userLocation.lng],
        [selectedBin.lat, selectedBin.lng],
      ];

      polylineRef.current = L.polyline(latlngs, {
        color: "#10B981",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);

      // Open popup for selected bin if marker exists
      const selectedMarker = markersRef.current[selectedBin.id];
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [selectedBin, userLocation]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] shadow-inner" />;
}
