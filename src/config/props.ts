export type PropTag = "decor" | "obstacle" | "pickup" | "vehicle" | "interactive";

export interface StreetPropDefinition {
  id: string;
  name: { en: string; bn: string };
  tag: PropTag;
  textureKey: string;
  depth: number;
  yOffset: number;
  speedFactor: number;
  spawnWeight: number;
  width: number;
  height: number;
}

export const STREET_PROPS: StreetPropDefinition[] = [
  // Background Decor & Urban Structure
  {
    id: "teaStall",
    name: { en: "Tong Tea Stall", bn: "টংয়ের চায়ের দোকান" },
    tag: "decor",
    textureKey: "prop-tea-stall",
    depth: 4,
    yOffset: 345,
    speedFactor: 0.7,
    spawnWeight: 18,
    width: 110,
    height: 70,
  },
  {
    id: "hawkerCart",
    name: { en: "Jhalmuri Hawker Cart", bn: "ঝালমুড়ির গাড়ি" },
    tag: "decor",
    textureKey: "prop-hawker-cart",
    depth: 4,
    yOffset: 348,
    speedFactor: 0.7,
    spawnWeight: 14,
    width: 90,
    height: 65,
  },
  {
    id: "footbridge",
    name: { en: "Dhaka Pedestrian Footbridge", bn: "পাদচারী ওভারব্রিজ" },
    tag: "decor",
    textureKey: "prop-footbridge",
    depth: 95,
    yOffset: 200,
    speedFactor: 0.9,
    spawnWeight: 5,
    width: 220,
    height: 140,
  },
  {
    id: "streetDog",
    name: { en: "Deshi Street Dog", bn: "দেশি কুকুর" },
    tag: "decor",
    textureKey: "prop-street-dog",
    depth: 5,
    yOffset: 355,
    speedFactor: 0.7,
    spawnWeight: 12,
    width: 50,
    height: 30,
  },

  // Road Vehicles (passing in background road / foreground)
  {
    id: "rickshaw",
    name: { en: "Dhaka Painted Rickshaw", bn: "আর্ট করা রিকশা" },
    tag: "vehicle",
    textureKey: "vehicle-rickshaw",
    depth: 6,
    yOffset: 395,
    speedFactor: 0.9,
    spawnWeight: 20,
    width: 90,
    height: 65,
  },
  {
    id: "cng",
    name: { en: "Green CNG Auto", bn: "সবুজ সিএনজি" },
    tag: "vehicle",
    textureKey: "vehicle-cng",
    depth: 7,
    yOffset: 410,
    speedFactor: 1.15,
    spawnWeight: 16,
    width: 95,
    height: 60,
  },
  {
    id: "localBus",
    name: { en: "Murir Tin Local Bus", bn: "মুড়ির টিন লোকাল বাস" },
    tag: "vehicle",
    textureKey: "vehicle-local-bus",
    depth: 8,
    yOffset: 395,
    speedFactor: 1.05,
    spawnWeight: 10,
    width: 180,
    height: 95,
  },
  {
    id: "truck",
    name: { en: "Horn Please Truck", bn: "হরেন বাজান ট্রাক" },
    tag: "vehicle",
    textureKey: "vehicle-truck",
    depth: 8,
    yOffset: 395,
    speedFactor: 1.0,
    spawnWeight: 8,
    width: 190,
    height: 100,
  },
];
