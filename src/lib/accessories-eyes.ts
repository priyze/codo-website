import type { FaceFrame, OledCanvas } from "./oled-engine";
import type { Accessory } from "./accessories";

function drawHollowRoundRect(c: OledCanvas, x: number, y: number, w: number, h: number, r: number, t = 2) {
  c.fillRoundRect(x, y, w, h, r, true);
  c.fillRoundRect(x + t, y + t, w - t * 2, h - t * 2, Math.max(0, r - t), false);
}

function drawInnerPupils(c: OledCanvas, f: FaceFrame, inset = 10) {
  const ew = Math.max(10, f.w - inset);
  const eh = Math.max(3, Math.floor((f.h - 8) * f.openness));
  const rad = Math.min(5, Math.floor(eh / 2));
  c.fillRoundRect(f.leftEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, rad, true);
  c.fillRoundRect(f.rightEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, rad, true);
}

export const EYE_ACCESSORIES: Accessory[] = [
  {
    id: "pixel-shades",
    cosmeticId: 1,
    name: "Pixel Shades",
    slot: "eyes",
    description: "Classic 8-bit deal-with-it shades with diagonal pixel glare.",
    unlockLevel: 0,
    price: 30,
    isStarter: true,
    draw(c, f) {
      const top = f.cy - 9;
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 2;
      const lw = f.w + 5;
      c.fillRoundRect(lx - 1, top - 1, lw + 2, 17, 1, false);
      c.fillRoundRect(rx - 1, top - 1, lw + 2, 17, 1, false);
      c.fillRoundRect(lx, top, lw, 14, 1, true);
      c.fillRoundRect(rx, top, lw, 14, 1, true);
      c.fillRect(lx + 4, top + 14, lw - 8, 2, true);
      c.fillRect(rx + 4, top + 14, lw - 8, 2, true);
      c.fillRect(lx + lw - 1, top + 2, rx - (lx + lw) + 2, 3, true);
      c.drawFastHLine(lx - 6, top + 2, 6, true);
      c.drawFastHLine(lx - 6, top + 3, 6, true);
      c.drawFastHLine(rx + lw, top + 2, 6, true);
      c.drawFastHLine(rx + lw, top + 3, 6, true);
      for (const ox of [lx, rx]) {
        c.fillRect(ox + 5, top + 3, 3, 3, false);
        c.fillRect(ox + 8, top + 6, 3, 3, false);
        c.fillRect(ox + 11, top + 9, 3, 3, false);
        c.fillRect(ox + 12, top + 3, 3, 3, false);
        c.fillRect(ox + 15, top + 6, 3, 3, false);
      }
    },
  },
  {
    id: "flutter-lashes",
    cosmeticId: 4,
    name: "Flutter Lashes",
    slot: "eyes",
    description: "Three crisp angled lashes fanning off each upper eye corner.",
    unlockLevel: 0,
    price: 30,
    isStarter: true,
    draw(c, f) {
      const ly = f.eyeY + 3;
      c.drawLine(f.leftEyeX + 1, ly, f.leftEyeX - 6, ly - 4, true);
      c.drawLine(f.leftEyeX + 1, ly + 1, f.leftEyeX - 6, ly - 3, true);
      c.drawLine(f.leftEyeX + 3, ly - 1, f.leftEyeX - 3, ly - 7, true);
      c.drawLine(f.leftEyeX, ly + 4, f.leftEyeX - 6, ly + 2, true);
      const rx = f.rightEyeX + f.w - 1;
      c.drawLine(rx - 1, ly, rx + 6, ly - 4, true);
      c.drawLine(rx - 1, ly + 1, rx + 6, ly - 3, true);
      c.drawLine(rx - 3, ly - 1, rx + 3, ly - 7, true);
      c.drawLine(rx, ly + 4, rx + 6, ly + 2, true);
    },
  },
  {
    id: "wire-specs",
    cosmeticId: 7,
    name: "Wire Specs",
    slot: "eyes",
    description: "Minimalist 1px thin-wire rectangular reading glasses.",
    unlockLevel: 3,
    price: 60,
    draw(c, f) {
      const fw = f.w + 8;
      const fh = 24;
      const top = f.cy - 12;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      drawHollowRoundRect(c, lx, top, fw, fh, 3, 1);
      drawHollowRoundRect(c, rx, top, fw, fh, 3, 1);
      drawInnerPupils(c, f, 12);
      c.drawFastHLine(lx + fw, f.cy - 2, rx - (lx + fw), true);
      c.drawFastHLine(lx - 5, f.cy - 2, 5, true);
      c.drawFastHLine(rx + fw, f.cy - 2, 5, true);
    },
  },
  {
    id: "retro-round",
    cosmeticId: 8,
    name: "Retro Round",
    slot: "eyes",
    description: "Thin-rimmed vintage round spectacles with arched bridge.",
    unlockLevel: 6,
    price: 85,
    draw(c, f) {
      const size = f.w + 6;
      const rad = Math.floor(size / 2);
      const top = f.cy - rad;
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 3;
      drawHollowRoundRect(c, lx - 1, top - 1, size + 2, size + 2, rad + 1, 2);
      drawHollowRoundRect(c, rx - 1, top - 1, size + 2, size + 2, rad + 1, 2);
      drawInnerPupils(c, f, 10);
      c.drawFastHLine(lx + size, f.cy - 2, rx - (lx + size), true);
      c.drawFastHLine(lx + size, f.cy - 1, rx - (lx + size), true);
      c.drawFastHLine(lx - 6, f.cy - 2, 6, true);
      c.drawFastHLine(rx + size + 1, f.cy - 2, 6, true);
    },
  },
  {
    id: "nerd-frames",
    cosmeticId: 11,
    name: "Studio Frames",
    slot: "eyes",
    description: "Bold architectural rectangular glasses with thick browline.",
    unlockLevel: 10,
    price: 120,
    draw(c, f) {
      const fw = f.w + 8;
      const fh = 28;
      const top = f.cy - 14;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      drawHollowRoundRect(c, lx, top, fw, fh, 5, 3);
      drawHollowRoundRect(c, rx, top, fw, fh, 5, 3);
      drawInnerPupils(c, f, 10);
      c.fillRect(lx + fw - 1, top + 5, rx - (lx + fw) + 2, 4, true);
    },
  },
  {
    id: "half-rims",
    cosmeticId: 12,
    name: "Browline Half-Rims",
    slot: "eyes",
    description: "Sleek heavy-top browline frames open along the lower edge.",
    unlockLevel: 10,
    price: 125,
    draw(c, f) {
      const fw = f.w + 8;
      const top = f.cy - 14;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      for (const ox of [lx, rx]) {
        c.fillRoundRect(ox, top, fw, 5, 2, true);
        c.fillRect(ox, top + 4, 2, 9, true);
        c.fillRect(ox + fw - 2, top + 4, 2, 9, true);
      }
      c.fillRect(lx + fw - 1, top + 2, rx - (lx + fw) + 2, 2, true);
      c.drawFastHLine(lx - 6, top + 2, 6, true);
      c.drawFastHLine(rx + fw, top + 2, 6, true);
    },
  },
  {
    id: "wide-shades",
    cosmeticId: 15,
    name: "Wayfarer Shades",
    slot: "eyes",
    description: "Chunky 80s wayfarer sunglasses with corner pixel studs.",
    unlockLevel: 14,
    price: 175,
    draw(c, f) {
      const top = f.cy - 10;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      const lw = f.w + 8;
      c.fillRoundRect(lx - 1, top - 1, lw + 2, 20, 4, false);
      c.fillRoundRect(rx - 1, top - 1, lw + 2, 20, 4, false);
      c.fillRoundRect(lx, top, lw, 18, 4, true);
      c.fillRoundRect(rx, top, lw, 18, 4, true);
      c.fillRect(lx + lw - 2, top + 2, rx - (lx + lw) + 4, 4, true);
      // Corner studs & slanted reflection
      c.fillRect(lx + 2, top + 2, 2, 2, false);
      c.fillRect(rx + lw - 4, top + 2, 2, 2, false);
      for (const ox of [lx, rx]) {
        c.drawLine(ox + 8, top + 4, ox + 14, top + 14, false);
        c.drawLine(ox + 10, top + 4, ox + 16, top + 14, false);
      }
    },
  },
  {
    id: "cat-eye-frames",
    cosmeticId: 17,
    name: "Cat-Eye Frames",
    slot: "eyes",
    description: "Sharp upswept winged frames sculpted for a crisp 1-bit look.",
    unlockLevel: 18,
    price: 220,
    draw(c, f) {
      const top = f.cy - 11;
      const lx = f.leftEyeX - 3;
      const rx = f.rightEyeX - 1;
      const lw = f.w + 4;
      drawHollowRoundRect(c, lx, top, lw, 22, 6, 2);
      drawHollowRoundRect(c, rx, top, lw, 22, 6, 2);
      c.fillTriangle(lx - 6, top - 5, lx + 4, top, lx, top + 6, true);
      c.fillTriangle(rx + lw + 6, top - 5, rx + lw - 4, top, rx + lw, top + 6, true);
      drawInnerPupils(c, f, 12);
      c.fillRect(lx + lw - 1, top + 5, rx - (lx + lw) + 2, 2, true);
    },
  },
  {
    id: "dapper-monocle",
    cosmeticId: 19,
    name: "Dapper Monocle",
    slot: "eyes",
    description: "Single precision rim over the right eye with hanging pixel chain.",
    unlockLevel: 22,
    price: 270,
    draw(c, f) {
      const size = f.w + 6;
      const rad = Math.floor(size / 2);
      const rx = f.rightEyeX - 3;
      const top = f.cy - rad;
      drawHollowRoundRect(c, rx - 1, top - 1, size + 2, size + 2, rad + 1, 2);
      const ew = Math.max(10, f.w - 10);
      const eh = Math.max(3, Math.floor((f.h - 8) * f.openness));
      c.fillRoundRect(f.rightEyeX + Math.floor((f.w - ew) / 2), f.cy - Math.floor(eh / 2), ew, eh, Math.min(5, Math.floor(eh / 2)), true);
      const chainX = Math.min(125, rx + size + 2);
      for (let y = f.cy + 2; y < 62; y += 3) {
        c.drawPixel(chainX + (y % 6 === 0 ? 1 : 0), y, true);
      }
    },
  },
  {
    id: "dramatic-lashes",
    cosmeticId: 20,
    name: "Doll Lashes",
    slot: "eyes",
    description: "Long arched upper lashes paired with delicate lower corner ticks.",
    unlockLevel: 22,
    price: 260,
    draw(c, f) {
      const ty = f.eyeY + 2;
      const by = f.eyeY + f.h - 3;
      const lx = f.leftEyeX;
      const rx = f.rightEyeX + f.w - 1;
      // Left upper fan + lower ticks
      c.drawLine(lx, ty, lx - 8, ty - 5, true);
      c.drawLine(lx, ty + 1, lx - 8, ty - 4, true);
      c.drawLine(lx + 4, ty - 1, lx - 4, ty - 8, true);
      c.drawLine(lx + 9, ty - 2, lx + 4, ty - 8, true);
      c.drawLine(lx + 1, by, lx - 4, by + 3, true);
      // Right upper fan + lower ticks
      c.drawLine(rx, ty, rx + 8, ty - 5, true);
      c.drawLine(rx, ty + 1, rx + 8, ty - 4, true);
      c.drawLine(rx - 4, ty - 1, rx + 4, ty - 8, true);
      c.drawLine(rx - 9, ty - 2, rx - 4, ty - 8, true);
      c.drawLine(rx - 1, by, rx + 4, by + 3, true);
    },
  },
  {
    id: "aviator-shades",
    cosmeticId: 22,
    name: "Aviator Shades",
    slot: "eyes",
    description: "Teardrop double-bridge aviator sunglasses with angled sheen.",
    unlockLevel: 26,
    price: 330,
    draw(c, f) {
      const top = f.cy - 10;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      const lw = f.w + 8;
      for (const ox of [lx, rx]) {
        c.fillRoundRect(ox - 1, top - 1, lw + 2, 22, 7, false);
        c.fillRoundRect(ox, top, lw, 16, 4, true);
        c.fillRoundRect(ox + 3, top + 12, lw - 6, 8, 4, true);
        c.drawLine(ox + 6, top + 3, ox + 12, top + 13, false);
      }
      // Double bridge
      c.drawFastHLine(lx + lw - 1, top + 1, rx - (lx + lw) + 2, true);
      c.drawFastHLine(lx + lw - 1, top + 5, rx - (lx + lw) + 2, true);
    },
  },
  {
    id: "shutter-shades",
    cosmeticId: 24,
    name: "Shutter Shades",
    slot: "eyes",
    description: "Slatted horizontal shutter shades built for crisp OLED contrast.",
    unlockLevel: 30,
    price: 400,
    draw(c, f) {
      const top = f.cy - 10;
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX - 4;
      const lw = f.w + 8;
      for (const ox of [lx, rx]) {
        c.fillRoundRect(ox - 1, top - 1, lw + 2, 22, 4, false);
        c.fillRoundRect(ox, top, lw, 20, 4, true);
        for (let sy = top + 3; sy < top + 17; sy += 4) {
          c.fillRect(ox + 3, sy, lw - 6, 2, false);
        }
      }
      c.fillRect(lx + lw - 1, top + 4, rx - (lx + lw) + 2, 3, true);
    },
  },
  {
    id: "pirate-patch",
    cosmeticId: 25,
    name: "Coder Eye Patch",
    slot: "eyes",
    description: "Bold monochrome patch over the left eye with diagonal strap.",
    unlockLevel: 30,
    price: 390,
    draw(c, f) {
      const lx = f.leftEyeX - 3;
      const top = f.cy - 11;
      const lw = f.w + 6;
      c.drawLine(4, 3, lx + 4, top + 4, true);
      c.drawLine(4, 4, lx + 4, top + 5, true);
      c.drawLine(lx + lw - 2, top + 3, 122, 2, true);
      c.drawLine(lx + lw - 2, top + 4, 122, 3, true);
      c.fillRoundRect(lx - 1, top - 1, lw + 2, 24, 9, false);
      c.fillRoundRect(lx, top, lw, 22, 8, true);
      // Small pixel sheen dot
      c.fillRect(lx + 6, top + 5, 3, 2, false);
    },
  },
  {
    id: "visor-shades",
    cosmeticId: 27,
    name: "Cyber Visor",
    slot: "eyes",
    description: "Wrap-around OLED cyber visor with glowing scanline slit.",
    unlockLevel: 35,
    price: 480,
    draw(c, f) {
      const x0 = Math.max(6, f.leftEyeX - 6);
      const x1 = Math.min(122, f.rightEyeX + f.w + 6);
      const w = x1 - x0;
      const top = f.cy - 10;
      c.fillRoundRect(x0 - 1, top - 1, w + 2, 22, 6, false);
      c.fillRoundRect(x0, top, w, 20, 5, true);
      c.fillRoundRect(x0 + 3, top + 3, w - 6, 14, 3, false);
      const slitH = Math.max(2, Math.floor(4 * f.openness));
      c.fillRoundRect(x0 + 7, f.cy - Math.floor(slitH / 2), w - 14, slitH, 1, true);
      c.fillTriangle(f.cx - 5, top + 20, f.cx + 5, top + 20, f.cx, top + 14, false);
    },
  },
  {
    id: "heart-shades",
    cosmeticId: 29,
    name: "Heart Shades",
    slot: "eyes",
    description: "Twin pixel heart sunglasses with crisp glossy notches.",
    unlockLevel: 40,
    price: 580,
    draw(c, f) {
      const centers = [f.leftEyeX + Math.floor(f.w / 2), f.rightEyeX + Math.floor(f.w / 2)];
      for (const hx of centers) {
        c.fillRoundRect(hx - 17, f.cy - 14, 34, 29, 7, false);
        c.fillCircle(hx - 7, f.cy - 4, 8, true);
        c.fillCircle(hx + 7, f.cy - 4, 8, true);
        c.fillTriangle(hx - 15, f.cy - 2, hx + 15, f.cy - 2, hx, f.cy + 14, true);
        c.fillRect(hx - 9, f.cy - 7, 3, 3, false);
        c.fillRect(hx - 6, f.cy - 4, 2, 2, false);
      }
      c.fillRect(centers[0]! + 13, f.cy - 4, centers[1]! - centers[0]! - 26, 3, true);
    },
  },
  {
    id: "scouter-lens",
    cosmeticId: 30,
    name: "Power Scouter",
    slot: "eyes",
    description: "Asymmetric HUD targeting lens over the right eye with crosshair.",
    unlockLevel: 40,
    price: 610,
    draw(c, f) {
      const rx = f.rightEyeX - 5;
      const top = f.cy - 12;
      const w = f.w + 10;
      drawHollowRoundRect(c, rx, top, w, 24, 3, 2);
      // Ear mount bar on far right
      c.fillRect(rx + w, top + 4, 8, 12, true);
      // Inner targeting crosshair + mini ticks
      const rcx = f.rightEyeX + Math.floor(f.w / 2);
      c.drawFastHLine(rcx - 6, f.cy, 4, true);
      c.drawFastHLine(rcx + 3, f.cy, 4, true);
      c.drawFastVLine(rcx, f.cy - 6, 4, true);
      c.drawFastVLine(rcx, f.cy + 3, 4, true);
      c.drawPixel(rx + 4, top + 4, true);
      c.drawPixel(rx + 6, top + 4, true);
    },
  },
  {
    id: "star-shades",
    cosmeticId: 32,
    name: "Star Shades",
    slot: "eyes",
    description: "Angular six-point star-cut shades built for high-rating flexes.",
    unlockLevel: 45,
    price: 740,
    draw(c, f) {
      const centers = [f.leftEyeX + Math.floor(f.w / 2), f.rightEyeX + Math.floor(f.w / 2)];
      for (const sx of centers) {
        c.fillRoundRect(sx - 17, f.cy - 17, 34, 34, 8, false);
        c.fillTriangle(sx, f.cy - 15, sx - 14, f.cy + 9, sx + 14, f.cy + 9, true);
        c.fillTriangle(sx, f.cy + 15, sx - 14, f.cy - 9, sx + 14, f.cy - 9, true);
        const ph = Math.max(2, Math.floor(7 * f.openness));
        c.fillRoundRect(sx - 5, f.cy - Math.floor(ph / 2), 10, ph, 2, false);
      }
      c.fillRect(centers[0]! + 11, f.cy - 1, centers[1]! - centers[0]! - 22, 3, true);
    },
  },
  {
    id: "laser-visor",
    cosmeticId: 35,
    name: "Grandmaster Visor",
    slot: "eyes",
    description: "Level 50 twin-beam full-width OLED visor with notched bridge.",
    unlockLevel: 50,
    price: 1000,
    draw(c, f) {
      const x0 = Math.max(4, f.leftEyeX - 8);
      const x1 = Math.min(124, f.rightEyeX + f.w + 8);
      const w = x1 - x0;
      const top = f.cy - 12;
      c.fillRoundRect(x0 - 1, top - 1, w + 2, 26, 5, false);
      c.fillRoundRect(x0, top, w, 24, 4, true);
      c.fillRoundRect(x0 + 3, top + 3, w - 6, 18, 2, false);
      // Twin parallel laser beams
      c.fillRect(x0 + 6, f.cy - 4, w - 12, 3, true);
      c.fillRect(x0 + 10, f.cy + 2, w - 20, 2, true);
      c.fillTriangle(f.cx - 6, top + 24, f.cx + 6, top + 24, f.cx, top + 16, false);
    },
  },
];