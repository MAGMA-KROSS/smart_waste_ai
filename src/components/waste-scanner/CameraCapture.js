"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, X, Aperture, AlertTriangle, Loader2 } from "lucide-react";

/**
 * CameraCapture - real device camera via getUserMedia(). No simulated
 * camera behavior. Captures a frame and returns it as a base64 data URL
 * (via onCapture(base64DataUrl)) because this repo's scan API contract
 * (ai-llm-service/services/waste.service.js: classifyWaste({imageBase64}))
 * expects a base64 string, not a multipart File.
 */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("requesting");
  const [facingMode, setFacingMode] = useState("environment");
  const [errorMessage, setErrorMessage] = useState("");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setErrorMessage("Camera access is not supported in this browser.");
      return;
    }
    setStatus("requesting");
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("streaming");
    } catch (err) {
      console.error("Camera access failed:", err);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage("Camera permission was denied.");
      } else if (err?.name === "NotFoundError") {
        setStatus("unsupported");
        setErrorMessage("No camera was found on this device.");
      } else {
        setStatus("error");
        setErrorMessage("Could not access the camera. Please try again.");
      }
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    // Camera access (getUserMedia) is a real external-system subscription
    // that must be requested on mount/facingMode-change - there is no way
    // to model "ask the OS for camera permission and stream" without an
    // effect. This is the same category of pattern already present
    // elsewhere in this codebase (e.g. auth-service's login effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || status !== "streaming") return;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopStream();
    onCapture(dataUrl);
  };

  return (
    <div className="relative w-full h-full min-h-[360px] bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="hidden" />

      {status === "requesting" && (
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Requesting camera access...</span>
        </div>
      )}

      {(status === "denied" || status === "unsupported" || status === "error") && (
        <div className="flex flex-col items-center gap-3 text-center px-6 py-10 text-white">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="font-semibold">{errorMessage}</p>
          <p className="text-sm text-slate-300 max-w-xs">
            You can allow camera access in your browser settings, or upload a photo instead.
          </p>
          <div className="flex gap-3 mt-2">
            {status === "denied" && (
              <button onClick={startStream} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold">
                Retry
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold border border-white/20">
              Close
            </button>
          </div>
        </div>
      )}

      <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${status === "streaming" ? "block" : "hidden"}`} />

      {status === "streaming" && (
        <>
          <div className="absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none" />
          <button onClick={() => { stopStream(); onClose?.(); }} className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center" aria-label="Close camera">
            <X className="h-5 w-5" />
          </button>
          <button onClick={() => setFacingMode((p) => (p === "environment" ? "user" : "environment"))} className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center" aria-label="Switch camera">
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
            <button onClick={handleCapture} className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg ring-4 ring-white/30 active:scale-95 transition-transform" aria-label="Capture photo">
              <Aperture className="h-8 w-8 text-emerald-600" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
