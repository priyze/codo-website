import type { Accessory } from "./accessories";

export const MOUTH_ACCESSORIES: Accessory[] = [
  {
    id: "round-blush",
    cosmeticId: 2,
    name: "Round Blush",
    slot: "mouth",
    description: "Soft pixel cheek ovals perched right beneath the eyes.",
    unlockLevel: 0,
    price: 25,
    isStarter: true,
    draw(c, f) {
      const by = Math.min(55, f.cy + Math.floor(f.h / 2) + 2);
      const lx = f.leftEyeX - 4;
      const rx = f.rightEyeX + f.w - 6;
      for (const bx of [lx, rx]) {
        c.fillRoundRect(bx, by, 10, 5, 2, true);
        c.drawPixel(bx + 2, by + 2, false);
        c.drawPixel(bx + 7, by + 2, false);
      }
    },
  },
  {
    id: "classic-stache",
    cosmeticId: 3,
    name: "Pixel Mustache",
    slot: "mouth",
    description: "Dapper monochrome mustache sitting cleanly above the mouth.",
    unlockLevel: 0,
    price: 30,
    isStarter: true,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 6;
      c.fillRoundRect(mx - 12, my, 24, 5, 2, false);
      c.fillRoundRect(mx - 10, my + 1, 9, 3, 1, true);
      c.fillRoundRect(mx + 1, my + 1, 9, 3, 1, true);
      c.fillRoundRect(mx - 13, my + 2, 4, 3, 1, true);
      c.fillRoundRect(mx + 9, my + 2, 4, 3, 1, true);
      c.fillRoundRect(mx - 2, my, 4, 3, 1, true);
    },
  },
  {
    id: "cheek-mole",
    cosmeticId: 5,
    name: "Beauty Mark",
    slot: "mouth",
    description: "Minimalist 3×3 pixel cheek mole on the lower right cheek.",
    unlockLevel: 3,
    price: 45,
    draw(c, f) {
      const mx = Math.min(118, f.rightEyeX + f.w - 4);
      const my = Math.min(57, f.mouthY - 3);
      c.fillRoundRect(mx - 1, my - 1, 5, 5, 2, false);
      c.fillRoundRect(mx, my, 3, 3, 1, true);
    },
  },
  {
    id: "anime-blush",
    cosmeticId: 6,
    name: "Anime Blush",
    slot: "mouth",
    description: "Classic triple diagonal slash blush marks under both eyes.",
    unlockLevel: 3,
    price: 55,
    draw(c, f) {
      const by = Math.min(54, f.cy + Math.floor(f.h / 2) + 2);
      const lx = f.leftEyeX - 2;
      const rx = f.rightEyeX + f.w - 9;
      for (const bx of [lx, rx]) {
        for (let k = 0; k < 3; k++) {
          c.drawLine(bx + k * 4, by + 5, bx + k * 4 + 3, by, true);
        }
      }
    },
  },
  {
    id: "freckles",
    cosmeticId: 9,
    name: "Pixel Freckles",
    slot: "mouth",
    description: "Warm cluster of tiny 1-bit pixel freckles across both cheeks.",
    unlockLevel: 6,
    price: 75,
    draw(c, f) {
      const by = Math.min(52, f.cy + Math.floor(f.h / 2) + 3);
      const lx = f.leftEyeX - 2;
      const rx = f.rightEyeX + f.w - 10;
      const pts = [
        [0, 1],
        [4, 0],
        [8, 2],
        [2, 4],
        [6, 4],
      ] as const;
      for (const bx of [lx, rx]) {
        for (const [dx, dy] of pts) {
          c.fillRect(bx + dx, by + dy, 2, 2, true);
        }
      }
    },
  },
  {
    id: "cat-whiskers",
    cosmeticId: 10,
    name: "Cat Whiskers",
    slot: "mouth",
    description: "Three crisp pixel whiskers fanning off each side of the cheeks.",
    unlockLevel: 6,
    price: 85,
    draw(c, f) {
      const wy = f.mouthY - 2;
      // Left whiskers
      c.drawLine(8, wy - 4, 24, wy - 1, true);
      c.drawFastHLine(6, wy + 1, 18, true);
      c.drawLine(8, wy + 6, 24, wy + 3, true);
      // Right whiskers
      c.drawLine(104, wy - 1, 120, wy - 4, true);
      c.drawFastHLine(104, wy + 1, 18, true);
      c.drawLine(104, wy + 3, 120, wy + 6, true);
    },
  },
  {
    id: "chin-bandaid",
    cosmeticId: 13,
    name: "Cheek Bandage",
    slot: "mouth",
    description: "Playful pixel adhesive strip taped cleanly across the right cheek.",
    unlockLevel: 10,
    price: 110,
    draw(c, f) {
      const bx = Math.min(106, f.rightEyeX + f.w - 8);
      const by = Math.min(52, f.cy + Math.floor(f.h / 2) + 2);
      c.fillRoundRect(bx - 1, by - 1, 16, 8, 2, false);
      c.fillRoundRect(bx, by, 14, 6, 2, true);
      c.fillRect(bx + 5, by + 1, 4, 4, false);
      c.drawPixel(bx + 2, by + 2, false);
      c.drawPixel(bx + 2, by + 4, false);
      c.drawPixel(bx + 11, by + 2, false);
      c.drawPixel(bx + 11, by + 4, false);
    },
  },
  {
    id: "handlebar-stache",
    cosmeticId: 14,
    name: "Handlebar Stache",
    slot: "mouth",
    description: "Victorian curled handlebar mustache with upturned tips.",
    unlockLevel: 14,
    price: 165,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 6;
      c.fillRoundRect(mx - 18, my - 1, 36, 7, 2, false);
      c.fillRoundRect(mx - 13, my + 2, 12, 3, 1, true);
      c.fillRoundRect(mx + 1, my + 2, 12, 3, 1, true);
      c.fillRoundRect(mx - 3, my + 1, 6, 3, 1, true);
      c.drawLine(mx - 13, my + 3, mx - 17, my + 1, true);
      c.drawLine(mx - 17, my + 1, mx - 16, my - 2, true);
      c.drawLine(mx - 16, my - 2, mx - 14, my - 2, true);
      c.drawLine(mx + 13, my + 3, mx + 17, my + 1, true);
      c.drawLine(mx + 17, my + 1, mx + 16, my - 2, true);
      c.drawLine(mx + 16, my - 2, mx + 14, my - 2, true);
    },
  },
  {
    id: "tiny-fangs",
    cosmeticId: 16,
    name: "Pixel Fangs",
    slot: "mouth",
    description: "Playful twin pixel fangs peeking beneath the mouth.",
    unlockLevel: 14,
    price: 160,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY + 1;
      c.fillTriangle(mx - 8, my, mx - 4, my, mx - 6, my + 6, true);
      c.fillTriangle(mx + 4, my, mx + 8, my, mx + 6, my + 6, true);
    },
  },
  {
    id: "heart-cheeks",
    cosmeticId: 18,
    name: "Heart Cheeks",
    slot: "mouth",
    description: "Matching mini pixel hearts stamped beneath both eyes.",
    unlockLevel: 18,
    price: 210,
    draw(c, f) {
      const by = Math.min(52, f.cy + Math.floor(f.h / 2) + 3);
      const lx = f.leftEyeX + 1;
      const rx = f.rightEyeX + f.w - 4;
      for (const hx of [lx, rx]) {
        c.fillCircle(hx - 2, by, 2, true);
        c.fillCircle(hx + 2, by, 2, true);
        c.fillTriangle(hx - 4, by + 1, hx + 4, by + 1, hx, by + 5, true);
      }
    },
  },
  {
    id: "goatee-tuft",
    cosmeticId: 21,
    name: "Pixel Goatee",
    slot: "mouth",
    description: "Sharp minimalist triangular pixel goatee beneath the mouth.",
    unlockLevel: 22,
    price: 255,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY + 6;
      c.fillTriangle(mx - 6, my, mx + 6, my, mx, Math.min(63, my + 7), true);
      c.drawFastHLine(mx - 3, my + 1, 7, false);
    },
  },
  {
    id: "star-cheeks",
    cosmeticId: 23,
    name: "Sparkle Cheeks",
    slot: "mouth",
    description: "Crisp four-point pixel star glints resting on each cheek.",
    unlockLevel: 26,
    price: 315,
    draw(c, f) {
      const by = Math.min(53, f.cy + Math.floor(f.h / 2) + 4);
      const lx = f.leftEyeX + 1;
      const rx = f.rightEyeX + f.w - 3;
      for (const sx of [lx, rx]) {
        c.drawFastHLine(sx - 4, by, 9, true);
        c.drawFastVLine(sx, by - 4, 9, true);
        c.fillRect(sx - 1, by - 1, 3, 3, true);
      }
    },
  },
  {
    id: "chevron-stache",
    cosmeticId: 26,
    name: "Chevron Stache",
    slot: "mouth",
    description: "Thick retro 70s chevron mustache framed right above the mouth.",
    unlockLevel: 30,
    price: 380,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 7;
      c.fillRoundRect(mx - 15, my, 30, 7, 2, false);
      c.fillTriangle(mx - 14, my + 6, mx - 10, my + 1, mx, my + 4, true);
      c.fillTriangle(mx + 14, my + 6, mx + 10, my + 1, mx, my + 4, true);
      c.fillRoundRect(mx - 11, my + 1, 22, 4, 1, true);
    },
  },
  {
    id: "doodle-blush",
    cosmeticId: 28,
    name: "Swirl Cheeks",
    slot: "mouth",
    description: "Cute retro spiral cheek swirls rendered in crisp 1-bit lines.",
    unlockLevel: 35,
    price: 460,
    draw(c, f) {
      const by = Math.min(52, f.cy + Math.floor(f.h / 2) + 3);
      const lx = f.leftEyeX;
      const rx = f.rightEyeX + f.w - 9;
      for (const ox of [lx, rx]) {
        c.drawFastHLine(ox, by, 8, true);
        c.drawFastVLine(ox + 8, by, 7, true);
        c.drawFastHLine(ox + 1, by + 6, 7, true);
        c.drawFastVLine(ox + 1, by + 2, 4, true);
        c.drawFastHLine(ox + 2, by + 2, 4, true);
        c.drawFastVLine(ox + 5, by + 2, 3, true);
        c.drawPixel(ox + 4, by + 4, true);
      }
    },
  },
  {
    id: "buck-tooth",
    cosmeticId: 31,
    name: "Goofy Grin Tooth",
    slot: "mouth",
    description: "Cheeky oversized single pixel tooth popping below the mouth.",
    unlockLevel: 40,
    price: 540,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY + 1;
      c.fillRoundRect(mx - 4, my, 8, 7, 1, true);
      c.drawFastVLine(mx, my + 1, 6, false);
    },
  },
  {
    id: "wizard-beard",
    cosmeticId: 33,
    name: "Sage Beard",
    slot: "mouth",
    description: "Layered pixel mustache paired with a pointed wizard chin beard.",
    unlockLevel: 45,
    price: 720,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 6;
      // Mustache brow
      c.fillRoundRect(mx - 15, my, 30, 5, 2, false);
      c.fillRoundRect(mx - 14, my + 1, 13, 3, 1, true);
      c.fillRoundRect(mx + 1, my + 1, 13, 3, 1, true);
      // Layered chin beard below mouth
      c.fillTriangle(mx - 12, my + 11, mx + 12, my + 11, mx, 63, true);
      c.drawFastVLine(mx - 4, my + 12, 4, false);
      c.drawFastVLine(mx + 4, my + 12, 4, false);
    },
  },
  {
    id: "royal-stache",
    cosmeticId: 34,
    name: "Grandmaster Stache",
    slot: "mouth",
    description: "Level 50 imperial walrus mustache with signature pixel goatee.",
    unlockLevel: 50,
    price: 950,
    draw(c, f) {
      const mx = f.mouthX;
      const my = f.mouthY - 7;
      c.fillRoundRect(mx - 19, my - 1, 38, 12, 3, false);
      c.fillRoundRect(mx - 15, my + 1, 14, 5, 2, true);
      c.fillRoundRect(mx + 1, my + 1, 14, 5, 2, true);
      c.fillTriangle(mx - 15, my + 1, mx - 20, my + 7, mx - 10, my + 6, true);
      c.fillTriangle(mx + 15, my + 1, mx + 20, my + 7, mx + 10, my + 6, true);
      c.fillRoundRect(mx - 4, my, 8, 4, 1, true);
      c.fillTriangle(mx - 3, my + 9, mx + 3, my + 9, mx, 63, true);
    },
  },
  {
    id: "diamond-cheeks",
    cosmeticId: 36,
    name: "Diamond Cheeks",
    slot: "mouth",
    description: "Level 50 radiant hollow pixel diamonds flanking both cheeks.",
    unlockLevel: 50,
    price: 900,
    draw(c, f) {
      const by = Math.min(53, f.cy + Math.floor(f.h / 2) + 4);
      const lx = f.leftEyeX;
      const rx = f.rightEyeX + f.w - 3;
      for (const dx of [lx, rx]) {
        c.fillTriangle(dx, by - 5, dx - 5, by, dx + 5, by, true);
        c.fillTriangle(dx, by + 5, dx - 5, by, dx + 5, by, true);
        c.fillRect(dx - 1, by - 1, 3, 3, false);
        c.drawPixel(dx, by, true);
      }
    },
  },
];