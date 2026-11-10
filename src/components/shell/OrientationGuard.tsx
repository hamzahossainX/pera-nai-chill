"use client";

import React, { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

export function OrientationGuard() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === "undefined") return;
      const isMobile = window.innerWidth <= 840 || "ontouchstart" in window;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isPortraitMobile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-slate-100 backdrop-blur-md select-none">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-amber-400 bg-amber-500/20 shadow-2xl">
        <Smartphone className="h-12 w-12 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
      </div>

      <h2 className="font-comic text-2xl tracking-wide text-amber-400 sm:text-3xl">
        PLEASE ROTATE DEVICE
      </h2>
      <p className="mt-2 font-bangla text-base font-bold text-rose-400 sm:text-lg">
        সেরা অভিজ্ঞতার জন্য ফোনটি ল্যান্ডস্কেপ (আড়াআড়ি) করুন!
      </p>

      <button
        onClick={() => setIsPortraitMobile(false)}
        className="mt-6 rounded-xl border-2 border-black bg-slate-800 px-5 py-2 font-comic text-xs uppercase text-slate-300 hover:bg-slate-700"
      >
        Play in portrait anyway
      </button>
    </div>
  );
}
