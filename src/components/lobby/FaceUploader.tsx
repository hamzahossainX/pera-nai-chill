"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useGameStore } from "@/store/useGameStore";
import { faceService } from "@/services/faceService";
import { Camera, Upload, Smile, RefreshCw, Scissors, Check } from "lucide-react";

export function FaceUploader() {
  const { targetFaceUrl, setTargetFace } = useGameStore();

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualCropOpen, setIsManualCropOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted face from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !targetFaceUrl) {
      try {
        const saved = localStorage.getItem("pernaichill_lastFaceDataUrl");
        if (saved) {
          setTargetFace(saved);
        } else {
          // Default to funny caricature
          const defaultFace = faceService.generateDefaultFunnyFace();
          setTargetFace(defaultFace);
        }
      } catch {
        const defaultFace = faceService.generateDefaultFunnyFace();
        setTargetFace(defaultFace);
      }
    }
  }, [targetFaceUrl, setTargetFace]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Downscale large image to max 1024px to protect memory
  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const maxDim = 1024;
      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      if (targetWidth > maxDim || targetHeight > maxDim) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
          targetWidth = maxDim;
        } else {
          targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
          targetHeight = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D context");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setRawImageSrc(resizedDataUrl);

      // Attempt AI face detection
      const detectedBox = await faceService.detectFaceBox(canvas);

      if (detectedBox) {
        // Automatically crop & cartoonify detected face
        const cartoonUrl = faceService.cartoonifyFace(canvas, detectedBox);
        setTargetFace(cartoonUrl);
        try {
          localStorage.setItem("pernaichill_lastFaceDataUrl", cartoonUrl);
        } catch {}
        setIsManualCropOpen(false);
      } else {
        // Fallback: Open manual circular cropper
        setIsManualCropOpen(true);
      }
    } catch (err) {
      console.warn("Image processing error:", err);
      // Fallback: Default funny face
      const def = faceService.generateDefaultFunnyFace();
      setTargetFace(def);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const applyManualCrop = () => {
    if (!rawImageSrc || !croppedAreaPixels) return;

    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      const cartoonUrl = faceService.cartoonifyFace(img, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });

      setTargetFace(cartoonUrl);
      try {
        localStorage.setItem("pernaichill_lastFaceDataUrl", cartoonUrl);
      } catch {}
      setIsManualCropOpen(false);
    };
  };

  const handleUseDefaultFace = () => {
    const face = faceService.generateDefaultFunnyFace();
    setTargetFace(face);
    try {
      localStorage.setItem("pernaichill_lastFaceDataUrl", face);
    } catch {}
    setIsManualCropOpen(false);
  };

  return (
    <div className="pnc-face-panel">
      <div className="pnc-face-heading">
        <h3 className="font-bangla text-xl font-bold">
          মুখের ছবি
        </h3>
        {targetFaceUrl && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Ready
          </span>
        )}
      </div>

      {/* Manual Cropper Modal / View */}
      {isManualCropOpen && rawImageSrc ? (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="relative h-60 w-full overflow-hidden rounded-xl border-2 border-yellow-400 bg-black">
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex w-full items-center gap-3 px-2">
            <span className="text-xs font-mono text-slate-300">Zoom:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-full accent-yellow-400"
            />
          </div>

          <div className="flex w-full gap-2">
            <button
              onClick={applyManualCrop}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-emerald-500 py-2.5 font-comic text-sm text-black shadow-md hover:bg-emerald-400"
            >
              <Check className="h-4 w-4" /> LOCK CROP / ঠিক আছে
            </button>
            <button
              onClick={() => setIsManualCropOpen(false)}
              className="rounded-xl border-2 border-black bg-slate-700 px-4 py-2.5 font-comic text-sm text-white hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Regular Face Display & Action Buttons */
        <div className="pnc-face-row">
          {/* Target Face Avatar */}
          <div className="relative group">
            <div className="pnc-face-avatar">
              {targetFaceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={targetFaceUrl}
                  alt="Target Face"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Smile className="h-14 w-14 text-slate-500" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pnc-face-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-yellow-400 px-3.5 py-2 font-comic text-xs tracking-wider text-black shadow-md hover:bg-yellow-300 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {isProcessing ? "প্রসেসিং..." : "ছবি দিন"}
            </button>

            <button
              disabled={isProcessing}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "user");
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-rose-500 px-3 py-2 font-comic text-xs tracking-wider text-white shadow-md hover:bg-rose-600 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              ক্যামেরা
            </button>

            <button
              onClick={handleUseDefaultFace}
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-500 px-3 py-2 font-comic text-xs tracking-wider text-black shadow-md hover:bg-teal-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              কার্টুন
            </button>
            {targetFaceUrl && (
              <button
                onClick={() => setIsManualCropOpen(true)}
                title="Adjust Crop"
                className="pnc-face-crop"
              >
                <Scissors className="h-4 w-4" /> কাটছাঁট
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
