"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BinMap from "@/components/BinMap";
import BinCard from "@/components/BinCard";
import DirectionsModal from "@/components/DirectionsModal";
import AddBinModal from "@/components/AddBinModal";
import { MOCK_BINS, INITIAL_USER_LOCATION, WASTE_CATEGORIES } from "@/lib/mockBins";
import { findNearestBin, calculateDistance, generateBinsAroundLocation, reverseGeocode } from "@/lib/geoUtils";
import {
  Search,
  MapPin,
  Compass,
  Filter,
  Trash2,
  Recycle,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Info,
  Loader2,
  Navigation,
  Crosshair,
  Plus,
} from "lucide-react";

export default function FindBinPage() {
  const [bins, setBins] = useState(MOCK_BINS);
  const [userLocation, setUserLocation] = useState(INITIAL_USER_LOCATION);
  const [selectedBin, setSelectedBin] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [directionsBin, setDirectionsBin] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'available', 'full'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddBin = (newBin) => {
    setBins((prev) => [newBin, ...prev]);
    setSelectedBin(newBin);
  };

  // Location accuracy & status tracking
  const [locationStatus, setLocationStatus] = useState("idle"); // 'idle' | 'locating' | 'success' | 'error'
  const [accuracyMeters, setAccuracyMeters] = useState(null);

  // High-Precision GPS Acquisition Function
  const fetchPreciseLocation = useCallback((autoSelectNearest = false) => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");

    const gpsOptions = {
      enableHighAccuracy: true, // Forces GPS chip / Wi-Fi hardware precision
      timeout: 15000,           // 15 sec max wait
      maximumAge: 0,            // Do not use cached position
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);

        setAccuracyMeters(accuracy);

        // Fetch street address via reverse geocoding
        const address = await reverseGeocode(lat, lng);

        const newLoc = {
          lat,
          lng,
          address,
        };

        setUserLocation(newLoc);
        setLocationStatus("success");

        // Distance to default Sector 62 center
        const distFromSector62 = calculateDistance(lat, lng, INITIAL_USER_LOCATION.lat, INITIAL_USER_LOCATION.lng);

        let activeBins = MOCK_BINS;
        // If user is outside Sector 62 Noida (> 3km), dynamically generate nearby smart bins for their live location
        if (distFromSector62 > 3) {
          const liveNearbyBins = generateBinsAroundLocation(lat, lng, address.split(",")[0] || "Your Area");
          activeBins = [...liveNearbyBins, ...MOCK_BINS];
          setBins(activeBins);
        } else {
          setBins(MOCK_BINS);
        }

        if (autoSelectNearest) {
          const nearest = findNearestBin(lat, lng, activeBins, activeCategory);
          if (nearest) setSelectedBin(nearest);
        }
      },
      (error) => {
        console.warn("High precision GPS error:", error.message);
        setLocationStatus("error");
      },
      gpsOptions
    );
  }, [activeCategory]);

  // Auto-acquire precise GPS on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreciseLocation(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPreciseLocation]);

  // Filter Bins based on category, status, and search query
  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      // Category match
      const matchesCategory =
        activeCategory === "all" || bin.category.toLowerCase() === activeCategory.toLowerCase();

      // Status match
      let matchesStatus = true;
      if (statusFilter === "available") matchesStatus = bin.fillLevel < 80;
      if (statusFilter === "full") matchesStatus = bin.fillLevel >= 80;

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        bin.name.toLowerCase().includes(query) ||
        bin.address.toLowerCase().includes(query) ||
        bin.id.toLowerCase().includes(query) ||
        bin.wasteType.toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [bins, activeCategory, statusFilter, searchQuery]);

  // Handle Finding the Nearest Bin automatically
  const handleFindNearest = () => {
    const nearest = findNearestBin(userLocation.lat, userLocation.lng, bins, activeCategory);
    if (nearest) {
      setSelectedBin(nearest);
    }
  };

  // Calculate summary counts
  const availableCount = useMemo(() => bins.filter((b) => b.fillLevel < 80).length, [bins]);
  const criticalCount = useMemo(() => bins.filter((b) => b.fillLevel >= 80).length, [bins]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activePage="find-bin" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Top Feature Banner & Search Controls */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Bin Locator</span>
              </div>

              {/* Precise GPS Status Indicator Badge */}
              {locationStatus === "locating" && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-medium animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Fetching Precise GPS...</span>
                </div>
              )}
              {locationStatus === "success" && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Precise GPS Active {accuracyMeters ? `(±${accuracyMeters}m)` : ""}</span>
                </div>
              )}
              {locationStatus === "error" && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-300 text-xs font-medium">
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span>JSS Campus Location</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Locate Nearby City Dustbins in Real-Time
            </h1>

            {/* Current Detected Address Bar */}
            <div className="mt-2 text-slate-300 text-xs sm:text-sm flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Current Position: <strong className="text-white">{userLocation.address}</strong></span>
            </div>

            {/* Search Bar & Fast Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campus, landmark, area, or bin ID (e.g. JSS Canteen, Gate 1, Fortis)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/90 backdrop-blur-md text-slate-900 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-3 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white shadow-sm"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Bin</span>
                </button>

                <button
                  onClick={handleFindNearest}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-3 px-3.5 rounded-xl border border-white/20 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span>Nearest</span>
                </button>

                <button
                  onClick={() => fetchPreciseLocation(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-3 px-3.5 rounded-xl border border-white/20 flex items-center justify-center space-x-1.5 transition-colors"
                  title="Recalibrate High-Precision GPS"
                >
                  <Crosshair className={`h-4 w-4 text-emerald-400 ${locationStatus === "locating" ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refetch GPS</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Status Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Type:</span>
              </span>
              {WASTE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Toggle & Counter */}
            <div className="flex items-center space-x-3 text-xs border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({bins.length})
                </button>
                <button
                  onClick={() => setStatusFilter("available")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    statusFilter === "available" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-700 hover:text-emerald-900"
                  }`}
                >
                  Available ({availableCount})
                </button>
                <button
                  onClick={() => setStatusFilter("full")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    statusFilter === "full" ? "bg-rose-500 text-white shadow-xs" : "text-rose-700 hover:text-rose-900"
                  }`}
                >
                  Nearly Full ({criticalCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: List Sidebar + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Bin Cards Sidebar */}
          <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
              <span>Showing {filteredBins.length} nearby dustbins</span>
              {selectedBin && (
                <button
                  onClick={() => setSelectedBin(null)}
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  Clear Map Selection
                </button>
              )}
            </div>

            {filteredBins.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No Bins Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No dustbins match your filter criteria or search query. Try switching categories or clearing search.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-2 rounded-lg hover:bg-emerald-100"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredBins.map((bin) => (
                <BinCard
                  key={bin.id}
                  bin={bin}
                  userLocation={userLocation}
                  isSelected={selectedBin?.id === bin.id}
                  onSelect={(b) => setSelectedBin(b)}
                  onGetDirections={(b) => setDirectionsBin(b)}
                />
              ))
            )}
          </div>

          {/* Leaflet Map Column */}
          <div className="lg:col-span-7 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs h-[500px] lg:h-[700px] sticky top-20 flex flex-col">
            <div className="flex items-center justify-between pb-2 px-2 text-xs">
              <div className="flex items-center space-x-2 font-semibold text-slate-700">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>Interactive Live City Map</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Available (&lt;60%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Partial (60-80%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Full (&gt;80%)
                </span>
              </div>
            </div>

            <div className="flex-1 w-full rounded-xl overflow-hidden relative">
              <BinMap
                bins={filteredBins}
                selectedBin={selectedBin}
                userLocation={userLocation}
                onSelectBin={(bin) => setSelectedBin(bin)}
                onGetDirections={(bin) => setDirectionsBin(bin)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Turn-by-Turn Navigation Modal */}
      {directionsBin && (
        <DirectionsModal
          bin={directionsBin}
          userLocation={userLocation}
          onClose={() => setDirectionsBin(null)}
        />
      )}

      {/* Add New Dustbin Modal */}
      {isAddModalOpen && (
        <AddBinModal
          userLocation={userLocation}
          onAddBin={handleAddBin}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
