"use client";

import React, { useState } from "react";
import { Calendar, Play, CheckCircle } from "lucide-react";
import { getTodayChallenge } from "@/config/dailyChallenge";
import { useGameStore } from "@/store/useGameStore";
import { audioService } from "@/services/audio";

export function DailyChallengeCard() {
  const challenge = getTodayChallenge();
  const { setVillainId, setWeather, setTimeOfDay, startGame } = useGameStore();

  const [isCompleted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`dhaka_runner_daily_${challenge.dateKey}`) === "completed";
    } catch {
      return false;
    }
  });

  const handleAccept = () => {
    audioService.play("coin");
    setVillainId(challenge.villainId);
    setWeather(challenge.weather);
    setTimeOfDay(challenge.timeOfDay);
    startGame();
  };

  return (
    <aside className="daily-banner" aria-label="আজকের চ্যালেঞ্জ">
      <Calendar aria-hidden="true" />
      <div><strong>আজকের চ্যালেঞ্জ</strong><p>{challenge.title.bn} <span>+৳{challenge.rewardTaka}</span></p></div>
      {isCompleted ? <span className="daily-complete"><CheckCircle size={20} />সম্পন্ন</span> :
        <button onClick={handleAccept} aria-label={`আজকের চ্যালেঞ্জ খেলুন: ${challenge.title.bn}`}><Play size={18} />খেলুন</button>}
    </aside>
  );
}
