import type { FaceFrame, OledCanvas } from "./oled-engine";
import { EYE_ACCESSORIES } from "./accessories-eyes";
import { MOUTH_ACCESSORIES } from "./accessories-mouth";

export type AccessorySlot = "eyes" | "mouth";

export interface Accessory {
  id: string;
  cosmeticId: number; // Matches uint8_t cosmetic in Codogotchi sketch.ino
  name: string;
  slot: AccessorySlot;
  description: string;
  unlockLevel: number;
  price: number;
  isStarter?: boolean;
  draw: (c: OledCanvas, f: FaceFrame) => void;
}

// Every accessory renders exclusively using Adafruit_SSD1306 / Adafruit_GFX primitives
// so it maps 1:1 to the 128x64 OLED display in Codogotchi's ESP32 firmware.
export const ACCESSORIES: Accessory[] = [...EYE_ACCESSORIES, ...MOUTH_ACCESSORIES].sort(
  (a, b) => a.unlockLevel - b.unlockLevel || a.cosmeticId - b.cosmeticId,
);

export const STARTER_ACCESSORIES = ACCESSORIES.filter((a) => a.isStarter);

export function getAccessoryById(id: string | null | undefined): Accessory | undefined {
  if (!id) return undefined;
  return ACCESSORIES.find((a) => a.id === id);
}