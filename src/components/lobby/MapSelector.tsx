"use client";

import { useGameStore } from "@/store/useGameStore";
import { MAP_SCENARIOS, MapScenario } from "@/config/maps";
import { MapPin, Check, AlertTriangle } from "lucide-react";
import { audioService } from "@/services/audio";

export function MapSelector() {
  const { currentMapId, timeOfDay, setMapId, setTimeOfDay } = useGameStore();
  const select = (map: MapScenario) => {
    audioService.play("click");
    setMapId(map.id);
    // keep the chosen time of day when the new route supports it, else use the route's default
    setTimeOfDay(map.supportedTimeOfDay.includes(timeOfDay) ? timeOfDay : map.defaultTimeOfDay);
  };
  return <section className="lobby-panel route-panel" aria-labelledby="route-heading">
    <h2 id="route-heading">ঢাকার রুট <small>Choose a route</small></h2>
    <div className="route-choices">
      {MAP_SCENARIOS.map(map => <button key={map.id} type="button" aria-pressed={currentMapId === map.id}
        onClick={() => select(map)}>
        <MapPin aria-hidden="true" />
        <span className="route-copy"><strong>{map.name.bn}</strong><small>{map.tagline.bn}</small>
          <span
            className={`map-preview map-preview-${map.visualProfile} map-preview-${timeOfDay}`}
            aria-label={`${map.name.en} environment preview`}
          >
            <span className="map-preview-landmark">
              {map.visualProfile === "residential" ? "APARTMENTS" : map.visualProfile === "commercial" ? "FLYOVER" : "MARKET GATE"}
            </span>
            <span className="map-preview-road" />
            <span className="map-preview-detail" />
          </span>
          <span className="route-hazard"><AlertTriangle size={16} aria-hidden="true" />{map.hazards.primary}</span>
        </span>
        {currentMapId === map.id && <Check aria-label="নির্বাচিত" />}
      </button>)}
    </div>
  </section>;
}
