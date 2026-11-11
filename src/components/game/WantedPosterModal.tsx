"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { CRIMES } from "@/config/crimes";
import { VILLAINS } from "@/config/villains";
import { audioService } from "@/services/audio";

interface WantedPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function drawFallbackFace(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(300, 340, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(260, 320, 14, 0, Math.PI * 2);
  ctx.arc(340, 320, 14, 0, Math.PI * 2);
  ctx.fill();

  // Mask opening
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(230, 380, 140, 30);
}

export function WantedPosterModal({ isOpen, onClose }: WantedPosterModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const { targetName, targetFaceUrl, villainId, crimeId } = useGameStore();

  const villain = VILLAINS.find((v) => v.id === villainId) || VILLAINS[0];
  const crime = CRIMES.find((c) => c.id === crimeId) || CRIMES[0];

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render Canvas Poster (600 x 850)
    canvas.width = 600;
    canvas.height = 850;

    // 1. Vintage Dhaka Aged Parchment Background
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(0, 0, 600, 850);

    // Weathered grunge edges
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 580, 830);

    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, 556, 806);

    // 2. Poster Header: WANTED
    ctx.fillStyle = "#451a03";
    ctx.textAlign = "center";
    ctx.font = "bold 64px 'Luckiest Guy', Impact, sans-serif";
    ctx.fillText("WANTED", 300, 95);

    ctx.font = "bold 24px 'Luckiest Guy', Impact, sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("— খোঁজ চলিতেছে —", 300, 135);

    // 3. Center Photo Frame
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(120, 160, 360, 360);
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 6;
    ctx.strokeRect(120, 160, 360, 360);

    const drawPosterTextAndExport = () => {
      // 4. Name Tag
      ctx.fillStyle = "#7f1d1d";
      ctx.font = "bold 36px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText(targetName || villain.name.bn, 300, 570);

      ctx.fillStyle = "#451a03";
      ctx.font = "bold 20px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText(`ALIAS: ${villain.name.en.toUpperCase()}`, 300, 605);

      // 5. Crime Description Banner
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(50, 630, 500, 48);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText(`CRIME: ${crime.title.bn} (${crime.title.en})`, 300, 662);

      // 6. Reward Box
      ctx.fillStyle = "#451a03";
      ctx.font = "bold 32px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText("REWARD: ৳ ৫০,০০০ TAKA", 300, 725);

      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText("সাবধান! চোর অতিমাত্রায় চতুর ও চপ্পলভীতি সম্পন্ন!", 300, 765);
      ctx.fillText("দেখা মাত্রই নিকটস্থ রাস্তায় বাটা চপ্পল নিক্ষেপ করুন!", 300, 790);

      try {
        setDataUrl(canvas.toDataURL("image/png"));
      } catch {}
    };

    // Draw Face in frame
    if (targetFaceUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 340, 160, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 140, 180, 320, 320);
        ctx.restore();
        drawPosterTextAndExport();
      };
      img.onerror = () => {
        // Fallback face
        drawFallbackFace(ctx);
        drawPosterTextAndExport();
      };
      img.src = targetFaceUrl;
    } else {
      drawFallbackFace(ctx);
      drawPosterTextAndExport();
    }
  }, [isOpen, targetName, targetFaceUrl, villain, crime]);

  const handleDownload = () => {
    audioService.play("coin");
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `wanted-poster-${targetName || "thief"}.png`;
    a.click();
  };

  const handleShare = async () => {
    audioService.play("click");
    if (!dataUrl) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "wanted-poster.png", { type: "image/png" });
        await navigator.share({
          title: `WANTED: ${targetName || "Thief"}!`,
          text: `Check out this Wanted Poster in Dhaka Rage Runner!`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[95vh] w-full max-w-md flex-col items-center rounded-3xl border-4 border-yellow-400 bg-slate-900 p-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-rose-500 text-white shadow hover:bg-rose-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-comic text-2xl text-yellow-300 uppercase tracking-wider mb-2">
          পোস্টার এক্সপোর্ট / WANTED POSTER
        </h2>

        {/* Hidden Canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Preview Image */}
        {dataUrl && (
          <div className="overflow-hidden rounded-xl border-2 border-black shadow-lg max-h-[62vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="Wanted Poster Preview"
              className="h-full w-auto object-contain"
            />
          </div>
        )}

        {/* Action Buttons (100% Local Export) */}
        <div className="mt-4 flex w-full gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-emerald-500 py-3 font-comic text-sm font-bold text-black shadow-md hover:bg-emerald-400 active:scale-95"
          >
            <Download className="h-5 w-5" /> ডাউনলোড / DOWNLOAD
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-amber-500 px-5 py-3 font-comic text-sm font-bold text-black shadow-md hover:bg-amber-400 active:scale-95"
          >
            <Share2 className="h-5 w-5" /> শেয়ার
          </button>
        </div>
      </div>
    </div>
  );
}
