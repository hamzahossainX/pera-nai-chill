import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/useGameStore";
import { eventService } from "@/services/eventService";

describe("T08: World Event Engine & Bribe Logic", () => {
  beforeEach(() => {
    useGameStore.setState({
      taka: 500,
      activeEvent: null,
      eventTimeLeft: 0,
    });
  });

  it("activates an event and sets duration correctly", () => {
    const loadshedding = eventService.getEventById("evt_loadshedding");
    expect(loadshedding).toBeDefined();

    const store = useGameStore.getState();
    store.setEvent(loadshedding!, loadshedding!.durationSec);

    const state = useGameStore.getState();
    expect(state.activeEvent?.id).toBe("evt_loadshedding");
    expect(state.eventTimeLeft).toBe(20);
  });

  it("decrements event timer and automatically clears when reaching zero", () => {
    const loadshedding = eventService.getEventById("evt_loadshedding");
    const store = useGameStore.getState();
    store.setEvent(loadshedding!, 5);

    store.decrementEventTimer(2);
    expect(useGameStore.getState().eventTimeLeft).toBe(3);

    store.decrementEventTimer(3);
    expect(useGameStore.getState().activeEvent).toBeNull();
    expect(useGameStore.getState().eventTimeLeft).toBe(0);
  });

  it("clears event immediately upon a successful bribe payment", () => {
    const loadshedding = eventService.getEventById("evt_loadshedding")!;
    const store = useGameStore.getState();
    store.setEvent(loadshedding, loadshedding.durationSec);

    // Bribe requires 100 Taka
    const cost = loadshedding.bypass.costTaka;
    const paid = store.spendTaka(cost);
    expect(paid).toBe(true);
    expect(useGameStore.getState().taka).toBe(400);

    store.clearEvent();
    expect(useGameStore.getState().activeEvent).toBeNull();
  });

  it("refuses bribe when player cannot afford the cost", () => {
    useGameStore.setState({ taka: 30 }); // Only 30 Taka, loadshedding needs 100
    const loadshedding = eventService.getEventById("evt_loadshedding")!;
    const store = useGameStore.getState();
    store.setEvent(loadshedding, loadshedding.durationSec);

    const paid = store.spendTaka(loadshedding.bypass.costTaka);
    expect(paid).toBe(false);
    expect(useGameStore.getState().taka).toBe(30); // Taka untouched
    expect(useGameStore.getState().activeEvent).not.toBeNull(); // Event still active
  });
});
