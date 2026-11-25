import type { FaceFrame, OledCanvas } from "./oled-engine";

export type AccessorySlot = "eyes" | "mouth";

export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  description: string;
  unlockLevel: number;
  price: number;
  isStarter?: boolean;
  draw: (c: OledCanvas, f: FaceFrame) => void;
}

function drawPixel(c: OledCanvas, x: number, y: number, on = true) {
  c.fillRoundRect(x, y, 1, 1, 0, on);
}

function drawHollowRoundRect(c: OledCanvas, x: number, y: number, w: number, h: number, r: number, t = 2) {
  c.fillRoundRect(x, y, w, h, r, true);
  c.fillRoundRect(x + t, y + t, w - t * 2, h - t * 2, Math.max(0, r - t), false);
}

// Every accessory renders exclusively using the 4 Canvas primitives from face.h
// (fillRoundRect, fillTriangle, drawLine) so it maps 1:1 to the 128x64 SSD1306 OLED.
export const ACCESSORIES: Accessory[] = [
  // ---- 4 Starter Basic Accessories (Level 1) ----
  {
    id: "pixel-shades",
    name: "Pixel Shades",
    slot: "eyes",
    description: "Classic 8-bit deal-with-it shades with diagonal pixel glare.",
    unlockLevel: 1,
    price: 40,
    isStarter: true,
    draw(c, f) {
      const top = f.cy - 9;
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 2;
      const lw = f.w + 5;
      // Dark cutout behind glasses for crisp contrast on bright OLED eyes
      c.fillRoundRect(lx - 1, top - 1, lw + 2, 17, 1, false);
      c.fillRoundRect(rx - 1, top - 1, lw + 2, 17, 1, false);
      // Solid frames + bridge + temples
      c.fillRoundRect(lx, top, lw, 14, 1, true);
      c.fillRoundRect(rx, top, lw, 14, 1, true);
      c.fillRoundRect(lx + 4, top + 14, lw - 8, 2, 0, true);
      c.fillRoundRect(rx + 4, top + 14, lw - 8, 2, 0, true);
      c.fillRoundRect(lx + lw - 1, top + 2, rx - (lx + lw) + 2, 3, 0, true);
      c.drawLine(lx - 6, top + 2, lx, top + 2, true);
      c.drawLine(lx - 6, top + 3, lx, top + 3, true);
      c.drawLine(rx + lw, top + 2, rx + lw + 6, top + 2, true);
      c.drawLine(rx + lw, top + 3, rx + lw + 6, top + 3, true);
      // Pixel diagonal glare slits cut out in black
      for (const ox of [lx, rx]) {
        c.fillRoundRect(ox + 5, top + 3, 3, 3, 0, false);
        c.fillRoundRect(ox + 8, top + 6, 3, 3, 0, false);
        c.fillRoundRect(ox + 11, top + 9, 3, 3, 0, false);
        c.fillRoundRect(ox + 12, top + 3, 3, 3, 0, false);
        c.fillRoundRect(ox + 15, top + 6, 3, 3, 0, false);
      }
    },
  },
  {
    id: "round-blush",
    name: "Round Blush",
    slot: "mouth",
    description: "Soft pixel cheek ovals perched right beneath the eyes.",
    unlockLevel: 1,
    price: 30,
    isStarter: true,
    draw(c, f) {
      const by = Math.min(56, f.cy + Math.floor(f.h / 2) + 3);
      const lx = f.leftEyeX - 2;
      const rx = f.rightEyeX + f.w - 8;
      for (const bx of [lx, rx]) {
        c.fillRoundRect(bx, by, 10, 5, 2, true);
        drawPixel(c, bx + 2, by + 2, false);
        drawPixel(c, bx + 7, by + 2, false);
      }
    },
  },
  {
    id: "classic-stache",
    name: "Pixel Mustache",
    slot: "mouth",
    description: "Dapper monochrome mustache sitting cleanly above the mouth.",
    unlockLevel: 1,
    price: 35,
    isStarter: true,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 5;
      c.fillRoundRect(mx - 12, my, 24, 5, 2, false);
      c.fillRoundRect(mx - 10, my + 1, 9, 3, 1, true);
      c.fillRoundRect(mx + 1, my + 1, 9, 3, 1, true);
      c.fillRoundRect(mx - 13, my + 2, 4, 3, 1, true);
      c.fillRoundRect(mx + 9, my + 2, 4, 3, 1, true);
      c.fillRoundRect(mx - 2, my, 4, 3, 1, true);
    },
  },
  {
    id: "flutter-lashes",
    name: "Flutter Lashes",
    slot: "eyes",
    description: "Three crisp angled lashes fanning off each upper eye corner.",
    unlockLevel: 1,
    price: 35,
    isStarter: true,
    draw(c, f) {
      const ly = f.eyeY + 3;
      // Left eye outer lashes
      c.drawLine(f.leftEyeX + 1, ly, f.leftEyeX - 6, ly - 4, true);
      c.drawLine(f.leftEyeX + 1, ly + 1, f.leftEyeX - 6, ly - 3, true);
      c.drawLine(f.leftEyeX + 3, ly - 1, f.leftEyeX - 3, ly - 7, true);
      c.drawLine(f.leftEyeX, ly + 4, f.leftEyeX - 6, ly + 2, true);
      // Right eye outer lashes
      const rx = f.rightEyeX + f.w - 1;
      c.drawLine(rx - 1, ly, rx + 6, ly - 4, true);
      c.drawLine(rx - 1, ly + 1, rx + 6, ly - 3, true);
      c.drawLine(rx - 3, ly - 1, rx + 3, ly - 7, true);
      c.drawLine(rx, ly + 4, rx + 6, ly + 2, true);
    },
  },

  // ---- Unlockable Accessories (Levels 3 to 50) ----
  {
    id: "cheek-mole",
    name: "Beauty Mark",
    slot: "mouth",
    description: "Minimalist 3×3 pixel cheek mole on the lower right cheek.",
    unlockLevel: 3,
    price: 50,
    draw(c, f) {
      const mx = Math.min(118, f.rightEyeX + f.w - 4);
      const my = Math.min(57, f.mouthY - 2);
      c.fillRoundRect(mx - 1, my - 1, 5, 5, 2, false);
      c.fillRoundRect(mx, my, 3, 3, 1, true);
    },
  },
  {
    id: "anime-blush",
    name: "Anime Blush",
    slot: "mouth",
    description: "Classic triple diagonal slash blush marks under both eyes.",
    unlockLevel: 5,
    price: 75,
    draw(c, f) {
      const by = Math.min(55, f.cy + Math.floor(f.h / 2) + 2);
      const lx = f.leftEyeX;
      const rx = f.rightEyeX + f.w - 11;
      for (const bx of [lx, rx]) {
        for (let k = 0; k < 3; k++) {
          c.drawLine(bx + k * 4, by + 5, bx + k * 4 + 3, by, true);
        }
      }
    },
  },
  {
    id: "retro-round",
    name: "Retro Round",
    slot: "eyes",
    description: "Thin-rimmed vintage round spectacles with arched bridge.",
    unlockLevel: 8,
    price: 120,
    draw(c, f) {
      const size = Math.max(f.w, f.h) + 6;
      const rad = Math.floor(size / 2);
      const top = f.cy - Math.floor(size / 2);
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 3;
      // Outer rim ring around each eye without erasing the eye interior
      c.fillRoundRect(lx - 2, top - 2, size + 4, size + 4, rad + 2, true);
      c.fillRoundRect(lx, top, size, size, rad, false);
      c.fillRoundRect(rx - 2, top - 2, size + 4, size + 4, rad + 2, true);
      c.fillRoundRect(rx, top, size, size, rad, false);
      // Re-stamp crisp pupil dots inside the circular frames
      const iw = Math.max(12, f.w - 10);
      const ih = Math.max(4, Math.floor((f.h - 8) * f.openness));
      c.fillRoundRect(f.leftEyeX + Math.floor((f.w - iw) / 2), f.cy - Math.floor(ih / 2), iw, ih, Math.min(6, Math.floor(ih / 2)), true);
      c.fillRoundRect(f.rightEyeX + Math.floor((f.w - iw) / 2), f.cy - Math.floor(ih / 2), iw, ih, Math.min(6, Math.floor(ih / 2)), true);
      // Bridge & temples
      c.drawLine(lx + size + 1, f.cy - 2, rx - 1, f.cy - 2, true);
      c.drawLine(lx + size + 1, f.cy - 1, rx - 1, f.cy - 1, true);
      c.drawLine(lx - 7, f.cy - 2, lx - 2, f.cy - 2, true);
      c.drawLine(rx + size + 2, f.cy - 2, rx + size + 7, f.cy - 2, true);
    },
  },
  {
    id: "nerd-frames",
    name: "Studio Frames",
    slot: "eyes",
    description: "Bold architectural rectangular glasses with thick browline.",
    unlockLevel: 12,
    price: 180,
    draw(c, f) {
      const fw = f.w + 8;
      const fh = Math.min(40, Math.max(24, f.h + 8));
      const top = f.cy - Math.floor(fh / 2);
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      drawHollowRoundRect(c, lx, top, fw, fh, 5, 3);
      drawHollowRoundRect(c, rx, top, fw, fh, 5, 3);
      // Keep expressive mini eyes centered inside lenses
      const ew = Math.max(12, f.w - 10);
      const eh = Math.max(3, Math.floor((f.h - 10) * f.openness));
      c.fillRoundRect(f.leftEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(5, Math.floor(eh / 2)), true);
      c.fillRoundRect(f.rightEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(5, Math.floor(eh / 2)), true);
      // Thick bridge
      c.fillRoundRect(lx + fw - 1, top + 5, rx - (lx + fw) + 2, 4, 1, true);
    },
  },
  {
    id: "handlebar-stache",
    name: "Handlebar Stache",
    slot: "mouth",
    description: "Victorian curled handlebar mustache with upturned tips.",
    unlockLevel: 16,
    price: 240,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 5;
      c.fillRoundRect(mx - 18, my - 1, 36, 7, 2, false);
      // Center & sweeping wings
      c.fillRoundRect(mx - 13, my + 2, 12, 3, 1, true);
      c.fillRoundRect(mx + 1, my + 2, 12, 3, 1, true);
      c.fillRoundRect(mx - 3, my + 1, 6, 3, 1, true);
      // Curled tips
      c.drawLine(mx - 13, my + 3, mx - 17, my + 1, true);
      c.drawLine(mx - 17, my + 1, mx - 16, my - 2, true);
      c.drawLine(mx - 16, my - 2, mx - 14, my - 2, true);
      c.drawLine(mx + 13, my + 3, mx + 17, my + 1, true);
      c.drawLine(mx + 17, my + 1, mx + 16, my - 2, true);
      c.drawLine(mx + 16, my - 2, mx + 14, my - 2, true);
    },
  },
  {
    id: "cat-eye-frames",
    name: "Cat-Eye Frames",
    slot: "eyes",
    description: "Sharp upswept winged frames sculpted for a crisp 1-bit look.",
    unlockLevel: 20,
    price: 320,
    draw(c, f) {
      const top = f.cy - 11;
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 1;
      const lw = f.w + 4;
      // Frame outline with winged triangles on outer top corners
      drawHollowRoundRect(c, lx, top, lw, 22, 6, 2);
      drawHollowRoundRect(c, rx, top, lw, 22, 6, 2);
      c.fillTriangle(lx - 6, top - 5, lx + 4, top, lx, top + 6, true);
      c.fillTriangle(rx + lw + 6, top - 5, rx + lw - 4, top, rx + lw, top + 6, true);
      // Eyes inside
      const ew = Math.max(12, f.w - 12);
      const eh = Math.max(3, Math.floor(12 * f.openness));
      c.fillRoundRect(lx + Math.floor((lw - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(4, Math.floor(eh / 2)), true);
      c.fillRoundRect(rx + Math.floor((lw - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(4, Math.floor(eh / 2)), true);
      c.fillRoundRect(lx + lw - 1, top + 5, rx - (lx + lw) + 2, 2, 0, true);
    },
  },
  {
    id: "dapper-monocle",
    name: "Dapper Monocle",
    slot: "eyes",
    description: "Single precision rim over the right eye with hanging pixel chain.",
    unlockLevel: 25,
    price: 420,
    draw(c, f) {
      const size = Math.max(f.w, f.h) + 6;
      const rad = Math.floor(size / 2);
      const rx = f.rightEyeX - 3;
      const top = f.cy - Math.floor(size / 2);
      c.fillRoundRect(rx - 2, top - 2, size + 4, size + 4, rad + 2, true);
      c.fillRoundRect(rx, top, size, size, rad, false);
      const ew = Math.max(12, f.w - 10);
      const eh = Math.max(3, Math.floor((f.h - 8) * f.openness));
      c.fillRoundRect(f.rightEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(5, Math.floor(eh / 2)), true);
      // Dotted pixel chain falling to bottom-right edge
      const chainX = Math.min(125, rx + size + 2);
      for (let y = f.cy + 2; y < 62; y += 3) {
        drawPixel(c, chainX + (y % 6 === 0 ? 1 : 0), y, true);
      }
    },
  },
  {
    id: "vampire-fangs",
    name: "Pixel Fangs",
    slot: "mouth",
    description: "Playful twin pixel fangs peeking beneath the mouth.",
    unlockLevel: 30,
    price: 520,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY + 1;
      c.fillTriangle(mx - 7, my, mx - 3, my, mx - 5, my + 5, true);
      c.fillTriangle(mx + 3, my, mx + 7, my, mx + 5, my + 5, true);
    },
  },
  {
    id: "visor-shades",
    name: "Cyber Visor",
    slot: "eyes",
    description: "Single wrap-around OLED visor bar with glowing scanline slit.",
    unlockLevel: 36,
    price: 700,
    draw(c, f) {
      const x0 = Math.max(6, f.leftEyeX - 6);
      const x1 = Math.min(122, f.rightEyeX + f.w + 6);
      const w = x1 - x0;
      const top = f.cy - 10;
      c.fillRoundRect(x0 - 1, top - 1, w + 2, 22, 6, false);
      c.fillRoundRect(x0, top, w, 20, 5, true);
      c.fillRoundRect(x0 + 3, top + 3, w - 6, 14, 3, false);
      // Glowing pulsing horizontal scanline slit
      const slitH = Math.max(2, Math.floor(4 * f.openness));
      c.fillRoundRect(x0 + 7, f.cy - Math.floor(slitH / 2), w - 14, slitH, 1, true);
      // Nose notch at bottom center
      c.fillTriangle(f.cx - 5, top + 20, f.cx + 5, top + 20, f.cx, top + 14, false);
    },
  },
  {
    id: "star-shades",
    name: "Star Shades",
    slot: "eyes",
    description: "Bold angular star-cut shades built for high-rating flexes.",
    unlockLevel: 42,
    price: 950,
    draw(c, f) {
      const centers = [f.leftEyeX + Math.floor(f.w / 2), f.rightEyeX + Math.floor(f.w / 2)];
      for (const sx of centers) {
        c.fillRoundRect(sx - 18, f.cy - 18, 36, 36, 8, false);
        // Two overlapping triangles forming a crisp 6-point star silhouette
        c.fillTriangle(sx, f.cy - 16, sx - 15, f.cy + 10, sx + 15, f.cy + 10, true);
        c.fillTriangle(sx, f.cy + 16, sx - 15, f.cy - 10, sx + 15, f.cy - 10, true);
        // Inner cutout eye pupil
        const ph = Math.max(2, Math.floor(8 * f.openness));
        c.fillRoundRect(sx - 5, f.cy - Math.floor(ph / 2), 10, ph, 2, false);
      }
      c.fillRoundRect(centers[0]! + 12, f.cy - 1, centers[1]! - centers[0]! - 24, 3, 0, true);
    },
  },
  {
    id: "royal-stache",
    name: "Grandmaster Stache",
    slot: "mouth",
    description: "Level 50 imperial walrus mustache with signature pixel goatee.",
    unlockLevel: 50,
    price: 1400,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 6;
      c.fillRoundRect(mx - 19, my - 1, 38, 13, 3, false);
      // Imperial sweeping mustache
      c.fillRoundRect(mx - 15, my + 1, 14, 5, 2, true);
      c.fillRoundRect(mx + 1, my + 1, 14, 5, 2, true);
      c.fillTriangle(mx - 15, my + 1, mx - 20, my + 7, mx - 10, my + 6, true);
      c.fillTriangle(mx + 15, my + 1, mx + 20, my + 7, mx + 10, my + 6, true);
      c.fillRoundRect(mx - 4, my, 8, 4, 1, true);
      // Small pixel soul patch below mouth
      c.fillTriangle(mx - 3, my + 8, mx + 3, my + 8, mx, my + 12, true);
    },
  },
];

export const STARTER_ACCESSORIES = ACCESSORIES.filter((a) => a.isStarter);

export function getAccessoryById(id: string | null | undefined): Accessory | undefined {
  if (!id) return undefined;
  return ACCESSORIES.find((a) => a.id === id);
}