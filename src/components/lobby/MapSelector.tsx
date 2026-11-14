"use client";

import { useGameStore } from "@/store/useGameStore";
import { MAP_SCENARIOS } from "@/config/maps";
import { MapPin, Check, AlertTriangle } from "lucide-react";
import { audioService } from "@/services/audio";

export function MapSelector() {
  const { currentMapId, setMapId } = useGameStore();
  return <section className="lobby-panel route-panel" aria-labelledby="route-heading">
    <h2 id="route-heading">ঢাকার রুট <small>Choose a route</small></h2>
    <div className="route-choices">
      {MAP_SCENARIOS.map(map => <button key={map.id} type="button" aria-pressed={currentMapId === map.id}
        onClick={() => { audioService.play("click"); setMapId(map.id); }}>
        <MapPin aria-hidden="true" />
        <span className="route-copy"><strong>{map.name.bn}</strong><small>{map.tagline.bn}</small>
          <span className="route-hazard"><AlertTriangle size={16} aria-hidden="true" />{map.hazards.primary}</span>
        </span>
        {currentMapId === map.id && <Check aria-label="নির্বাচিত" />}
      </button>)}
    </div>
  </section>;
}
