"use client";
import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, ImageOff } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/** ImageUploader - validates and reads a file as base64 (FileReader), since
 *  the scan API expects imageBase64, not a multipart file. */
export default function ImageUploader({ onSelect, onError }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndEmit = useCallback(
    (file) => {
      if (!file) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.("Unsupported file type. Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (file.size === 0) {
        onError?.("This file appears to be empty or corrupted.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        onError?.("Image is too large. Maximum size is 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onSelect?.(reader.result);
      reader.onerror = () => onError?.("Could not read this file. Please try another image.");
      reader.readAsDataURL(file);
    },
    [onSelect, onError]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); validateAndEmit(e.dataTransfer.files?.[0]); }}
      role="button"
      tabIndex={0}
      className={`w-full min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors px-6 text-center ${
        isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { validateAndEmit(e.target.files?.[0]); e.target.value = ""; }}
      />
      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <UploadCloud className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Tap to upload, or drag & drop an image</p>
        <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
          <ImageOff className="h-3.5 w-3.5" />
          JPEG, PNG, or WebP &middot; up to 10MB
        </p>
      </div>
    </div>
  );
}
