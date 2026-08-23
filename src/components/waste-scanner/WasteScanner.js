"use client";
import React, { useEffect, useState } from "react";
import { Camera, X, ScanLine } from "lucide-react";
import CameraCapture from "./CameraCapture";
import ImageUploader from "./ImageUploader";
import ScanLoading from "./ScanLoading";
import ScanResult from "./ScanResult";

/**
 * WasteScanner - orchestrates: idle -> image selected -> preview -> scan
 * -> result. Calls the EXISTING, already-authenticated API routes:
 *   1. POST /api/waste/scan          { imageBase64 }  (unchanged route.js)
 *   2. GET  /api/recycling/:material                  (unchanged route.js)
 * Both routes are untouched - only the ai-llm-service functions they call
 * into were implemented for real. Requests are same-origin, so the
 * existing auth cookie is sent automatically; a signed-in citizen/worker/
 * admin session is required, same as the route already enforced.
 */
export default function WasteScanner() {
  const [mode, setMode] = useState("idle");
  const [imageBase64, setImageBase64] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState("analyzing");
  const [classification, setClassification] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isScanning) return;
    const sequence = ["analyzing", "knowledge", "generating", "videos"];
    // scanStage is already initialized to "analyzing" (sequence[0]) via
    // useState below, so no setState is needed here on mount - only the
    // interval callback (an async/external-timer callback, not a direct
    // effect-body call) updates state going forward.
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < sequence.length) setScanStage(sequence[i]);
      else clearInterval(interval);
    }, 900);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleImageSelected = (base64) => {
    setError(null);
    setClassification(null);
    setRecommendation(null);
    setImageBase64(base64);
    setMode("preview");
  };

  const handleUploadError = (message) => setError(message);

  const handleReset = () => {
    setImageBase64(null);
    setClassification(null);
    setRecommendation(null);
    setError(null);
    setMode("idle");
  };

  const handleScan = async () => {
    if (!imageBase64) return;
    setIsScanning(true);
    setError(null);
    setClassification(null);
    setRecommendation(null);

    try {
      // Step 1: real image classification (POST /api/waste/scan - existing route)
      const scanRes = await fetch("/api/waste/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      if (scanRes.status === 401 || scanRes.status === 403) {
        setError("Please log in to use the AI Scanner.");
        return;
      }

      const scanData = await scanRes.json();
      const result = scanData?.result;

      if (!scanRes.ok || !result) {
        setError(scanData?.error || "Scan failed. Please try again.");
        return;
      }

      if (result.uncertain || result.success === false) {
        setClassification(result);
        return;
      }

      setClassification(result);

      // Step 2: recycling recommendation + DIY ideas + YouTube tutorials
      // (GET /api/recycling/:material - existing route, real Gemini/YouTube now)
      const materialKey = result.classId || result.material;
      const recRes = await fetch(`/api/recycling/${encodeURIComponent(materialKey)}`);
      const recData = await recRes.json();
      if (recRes.ok && recData?.recommendations) {
        setRecommendation(recData.recommendations);
      }
    } catch (err) {
      console.error("Scan request failed:", err);
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {mode === "idle" && !classification && !error && (
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("camera")}
            className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-6 transition-colors shadow-sm"
          >
            <Camera className="h-7 w-7" />
            <span className="font-semibold text-sm">Take Photo</span>
          </button>
          <div className="rounded-2xl overflow-hidden">
            <ImageUploader onSelect={handleImageSelected} onError={handleUploadError} />
          </div>
        </div>
      )}

      {mode === "camera" && (
        <div className="h-[70vh] max-h-[560px]">
          <CameraCapture onCapture={handleImageSelected} onClose={() => setMode("idle")} />
        </div>
      )}

      {mode === "preview" && !isScanning && !classification && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            {imageBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageBase64} alt="Selected waste item" className="w-full max-h-[420px] object-contain" />
            )}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
              aria-label="Remove image"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <button
            onClick={handleScan}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            <ScanLine className="h-5 w-5" />
            Scan Waste
          </button>
        </div>
      )}

      {isScanning && <ScanLoading stage={scanStage} />}

      {!isScanning && (error || classification) && (
        <ScanResult classification={classification} recommendation={recommendation} error={error} onRetry={handleReset} />
      )}
    </div>
  );
}
