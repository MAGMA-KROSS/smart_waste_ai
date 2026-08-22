"use client";
import React, { useState } from "react";
import { X, Plus, MapPin, Trash2, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export default function AddBinModal({ userLocation, onAddBin = () => {}, onClose = () => {} }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("recyclable");
  const [address, setAddress] = useState(userLocation?.address || "JSSATE Campus, Sector 62");
  const [fillLevel, setFillLevel] = useState(35);
  const [wasteType, setWasteType] = useState("Plastic & Beverage Cans");
  const [suitableItems, setSuitableItems] = useState("PET Water Bottles, Aluminium Cans, Paper");
  const [lat, setLat] = useState(userLocation?.lat || 28.6215);
  const [lng, setLng] = useState(userLocation?.lng || 77.3640);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a bin name.");
      return;
    }

    setLoading(true);
    const itemsArray = suitableItems.split(",").map((s) => s.trim()).filter(Boolean);

    const binData = {
      binId: `BIN-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address.trim() || "Local Campus Area",
      area: "Custom Campus Bin",
      category,
      wasteType: wasteType.trim() || "Recyclable Stream",
      fillLevel: parseInt(fillLevel, 10) || 0,
      capacityLiters: 200,
      lastCollected: "Just now",
      suitableItems: itemsArray.length > 0 ? itemsArray : ["General Waste"],
      sensorStatus: "Online",
    };

    try {
      const res = await fetch("/api/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(binData),
      });

      const data = await res.json();
      const createdBin = data.bin || binData;
      onAddBin(createdBin);
    } catch (err) {
      console.warn("Failed to persist bin to DB:", err);
      onAddBin(binData);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>Interactive Bin Management</span>
            </div>
            <h2 className="text-xl font-bold mt-1.5">+ Add New Smart Dustbin</h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Add a new dustbin location to the live map network & MongoDB Atlas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Bin Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dustbin Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JSS Academic Block 3 Courtyard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Waste Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Waste Stream Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value === "organic") setWasteType("Organic & Food Waste");
                if (e.target.value === "recyclable") setWasteType("Plastic & Beverage Cans");
                if (e.target.value === "general") setWasteType("General Litter");
                if (e.target.value === "glass") setWasteType("Glass & Metals");
                if (e.target.value === "ewaste") setWasteType("Electronic Waste");
              }}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="recyclable">Plastic & Recyclable</option>
              <option value="organic">Organic / Wet Food Waste</option>
              <option value="general">General Waste</option>
              <option value="glass">Glass & Metals</option>
              <option value="ewaste">E-Waste Hub</option>
            </select>
          </div>

          {/* Address / Location Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Near CS Department Entrance, JSSATE"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Coordinates (Lat / Lng) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Fill Level Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Initial Fill Level (%)</label>
              <span className={`text-xs font-bold ${fillLevel >= 80 ? "text-rose-600" : fillLevel >= 60 ? "text-amber-600" : "text-emerald-600"}`}>
                {fillLevel}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fillLevel}
              onChange={(e) => setFillLevel(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Suitable Items */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Suitable Items (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. PET Bottles, Aluminium Cans, Paper"
              value={suitableItems}
              onChange={(e) => setSuitableItems(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Dustbin to Map & Database</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
