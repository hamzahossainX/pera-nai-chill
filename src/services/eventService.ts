import { z } from "zod";
import rawEvents from "@/config/events.json";

export const LocalizedTextSchema = z.object({
  bn: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const EventEffectSchema = z.object({
  kind: z.string(),
  name: z.string().optional(),
  params: z.record(z.string(), z.any()).optional(),
  target: z.string().optional(),
  multiplier: z.number().optional(),
  intervalSec: z.number().optional(),
  comboBonus: z.number().optional(),
});
export type EventEffect = z.infer<typeof EventEffectSchema>;

export const BypassSchema = z.object({
  enabled: z.boolean(),
  costTaka: z.number(),
  label: LocalizedTextSchema.optional(),
});
export type EventBypass = z.infer<typeof BypassSchema>;

export const WorldEventSchema = z.object({
  id: z.string(),
  type: z.enum(["LOADSHEDDING", "POLLUTION", "STRIKE", "WATERLOGGING"]),
  title: LocalizedTextSchema,
  ticker: LocalizedTextSchema,
  description: LocalizedTextSchema,
  durationSec: z.number().positive(),
  weight: z.number().positive(),
  cooldownSec: z.number().nonnegative(),
  bypass: BypassSchema,
  effects: z.array(EventEffectSchema),
});
export type WorldEvent = z.infer<typeof WorldEventSchema>;

export const EventsDataSchema = z.object({
  currentTrendingHeadline: z.string(),
  events: z.array(WorldEventSchema),
});
export type EventsData = z.infer<typeof EventsDataSchema>;

export function validateEvents(data: unknown): EventsData {
  return EventsDataSchema.parse(data);
}

class EventService {
  private data: EventsData;

  constructor() {
    this.data = validateEvents(rawEvents);
  }

  getEvents(): WorldEvent[] {
    return this.data.events;
  }

  getTrendingHeadline(): string {
    return this.data.currentTrendingHeadline;
  }

  getEventById(id: string): WorldEvent | undefined {
    return this.data.events.find((e) => e.id === id);
  }
}

export const eventService = new EventService();
