"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ShoppingBag } from "lucide-react";
import { SHOP_ITEMS, ShopItem } from "@/config/shop";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const { taka, spendTaka, selectedChappalId, setSelectedChappalId } = useGameStore();

  const [activeTab, setActiveTab] = useState<"chappal" | "outfit" | "sound">("chappal");
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["chappal-bata", "outfit-lungi"];
    try {
      const saved = localStorage.getItem("dhaka_runner_shop_unlocked");
      return saved ? JSON.parse(saved) : ["chappal-bata", "outfit-lungi"];
    } catch {
      return ["chappal-bata", "outfit-lungi"];
    }
  });

  const [equippedOutfit, setEquippedOutfit] = useState<string>(() => {
    if (typeof window === "undefined") return "outfit-lungi";
    try {
      return localStorage.getItem("dhaka_runner_equipped_outfit") || "outfit-lungi";
    } catch {
      return "outfit-lungi";
    }
  });

  const [lastPurchasedId, setLastPurchasedId] = useState<string | null>(null);
  const [failedItemId, setFailedItemId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("dhaka_runner_shop_unlocked", JSON.stringify(unlockedItems));
    } catch {}
  }, [unlockedItems]);

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    if (unlockedItems.includes(item.id)) return;
    if (taka < item.price) {
      audioService.play("cough");
      setFailedItemId(item.id);
      setTimeout(() => setFailedItemId(null), 600);
      return;
    }

    const success = spendTaka(item.price);
    if (success) {
      audioService.play("coin");
      setUnlockedItems((prev) => [...prev, item.id]);
      setLastPurchasedId(item.id);
      setTimeout(() => setLastPurchasedId(null), 1200);
      // Auto-equip on purchase
      if (item.category === "chappal") {
        setSelectedChappalId(item.id);
      } else if (item.category === "outfit") {
        setEquippedOutfit(item.id);
        try {
          localStorage.setItem("dhaka_runner_equipped_outfit", item.id);
        } catch {}
      }
    }
  };

  const handleEquip = (item: ShopItem) => {
    audioService.play("click");
    if (item.category === "chappal") {
      setSelectedChappalId(item.id);
    } else if (item.category === "outfit") {
      setEquippedOutfit(item.id);
      try {
        localStorage.setItem("dhaka_runner_equipped_outfit", item.id);
      } catch {}
    }
  };

  const filteredItems = SHOP_ITEMS.filter((i) => i.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border-4 border-yellow-400 bg-slate-900 p-5 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-rose-500 text-white shadow hover:bg-rose-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pr-10 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-yellow-300" />
            <h2 className="font-comic text-2xl text-yellow-300 uppercase tracking-wide">
              দোকান / DHAKA BAZAAR
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-black/80 bg-slate-950 px-3 py-1 font-mono text-sm font-bold text-yellow-300">
            <span>৳</span> {taka}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-3 mb-4">
          {(["chappal", "outfit", "sound"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                audioService.play("click");
                setActiveTab(tab);
              }}
              className={`flex-1 rounded-xl py-2 font-comic text-xs sm:text-sm font-bold uppercase transition-all ${
                activeTab === tab
                  ? "bg-yellow-400 text-slate-950 shadow-md scale-102"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab === "chappal"
                ? "চপ্পল / CHAPPAL"
                : tab === "outfit"
                ? "পোশাক / OUTFITS"
                : "অডিও / SOUNDS"}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
          {filteredItems.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id) || item.isDefault;
            const isEquipped =
              item.category === "chappal"
                ? selectedChappalId === item.id
                : equippedOutfit === item.id;
            const canAfford = taka >= item.price;

            const isJustPurchased = lastPurchasedId === item.id;
            const isFailed = failedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`relative flex items-center justify-between rounded-2xl border-2 p-3 shadow transition-all duration-300 ${
                  isJustPurchased
                    ? "border-yellow-400 bg-yellow-950/60 ring-4 ring-yellow-400 scale-[1.02]"
                    : isFailed
                    ? "border-rose-500 bg-rose-950/40 translate-x-1"
                    : "border-black/70 bg-slate-950/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl drop-shadow">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bangla text-sm font-bold text-yellow-200">
                        {item.name.bn}
                      </h4>
                      <span className="font-comic text-[11px] text-slate-400">
                        ({item.name.en})
                      </span>
                    </div>
                    <p className="font-bangla text-xs text-slate-400 mt-0.5">
                      {item.description.bn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  {isUnlocked ? (
                    <button
                      onClick={() => handleEquip(item)}
                      disabled={isEquipped}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-comic text-xs font-bold transition-all ${
                        isEquipped
                          ? "border border-emerald-500 bg-emerald-950 text-emerald-300"
                          : "border-2 border-black bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95"
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="h-4 w-4" /> EQUIPPED
                        </>
                      ) : (
                        "EQUIP"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 font-comic text-xs font-bold transition-all ${
                        canAfford
                          ? "border-2 border-black bg-amber-400 text-black hover:bg-amber-300 active:scale-95 shadow"
                          : "border border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      ৳ {item.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
