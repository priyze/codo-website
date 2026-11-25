export const OLED_WIDTH = 128;
export const OLED_HEIGHT = 64;

export interface OledCanvas {
  clear(): void;
  fillRoundRect(x: number, y: number, w: number, h: number, r: number, on: boolean): void;
  fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, on: boolean): void;
  drawLine(x0: number, y0: number, x1: number, y1: number, on: boolean): void;
}

export type MoodLevel = 0 | 1 | 2 | 3; // 0=Sad, 1=Neutral, 2=Happy, 3=Ecstatic
export type ReactionType = "none" | "pet" | "celebrate";
export type FaceExpr = "neutral" | "slightly_happy" | "happy" | "sad" | "sleepy" | "petted" | "celebrate";

export interface FaceFrame {
  cx: number;
  cy: number;
  w: number;
  h: number;
  gap: number;
  r: number;
  leftEyeX: number;
  rightEyeX: number;
  eyeY: number;
  mouthX: number;
  mouthY: number;
  openness: number;
  expression: FaceExpr;
}

interface Pose {
  w: number;
  h: number;
  r: number;
  gap: number;
  tired: number;
  happy: number;
  bob: number;
  bobHz: number;
  gaze: number;
  gazeBias: number;
  blinkEvery: number;
}

// Pixel-exact 128x64 monochrome framebuffer emulating Adafruit_SSD1306 + Adafruit_GFX primitives
export class PixelBufferCanvas implements OledCanvas {
  readonly pixels = new Uint8Array(OLED_WIDTH * OLED_HEIGHT);

  clear(): void {
    this.pixels.fill(0);
  }

  setPixel(x: number, y: number, on: boolean): void {
    const ix = Math.trunc(x);
    const iy = Math.trunc(y);
    if (ix < 0 || ix >= OLED_WIDTH || iy < 0 || iy >= OLED_HEIGHT) return;
    this.pixels[iy * OLED_WIDTH + ix] = on ? 1 : 0;
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, on: boolean): void {
    let ix0 = Math.trunc(x0);
    let iy0 = Math.trunc(y0);
    const ix1 = Math.trunc(x1);
    const iy1 = Math.trunc(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.setPixel(ix0, iy0, on);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        ix0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  private drawVLine(x: number, y: number, h: number, on: boolean): void {
    for (let dy = 0; dy < h; dy++) this.setPixel(x, y + dy, on);
  }

  private drawHLine(x: number, y: number, w: number, on: boolean): void {
    for (let dx = 0; dx < w; dx++) this.setPixel(x + dx, y, on);
  }

  private fillRect(x: number, y: number, w: number, h: number, on: boolean): void {
    for (let dx = 0; dx < w; dx++) this.drawVLine(x + dx, y, h, on);
  }

  private fillCircleHelper(x0: number, y0: number, r: number, corners: number, delta: number, on: boolean): void {
    let f = 1 - r;
    let ddFx = 1;
    let ddFy = -2 * r;
    let x = 0;
    let y = r;
    let px = x;
    let py = y;
    const d = delta + 1;
    while (x < y) {
      if (f >= 0) {
        y--;
        ddFy += 2;
        f += ddFy;
      }
      x++;
      ddFx += 2;
      f += ddFx;
      if (x < y + 1) {
        if (corners & 1) this.drawVLine(x0 + x, y0 - y, 2 * y + d, on);
        if (corners & 2) this.drawVLine(x0 - x, y0 - y, 2 * y + d, on);
      }
      if (y !== py) {
        if (corners & 1) this.drawVLine(x0 + py, y0 - px, 2 * px + d, on);
        if (corners & 2) this.drawVLine(x0 - py, y0 - px, 2 * px + d, on);
        py = y;
      }
      px = x;
    }
  }

  fillRoundRect(x: number, y: number, w: number, h: number, r: number, on: boolean): void {
    const ix = Math.trunc(x);
    const iy = Math.trunc(y);
    const iw = Math.trunc(w);
    const ih = Math.trunc(h);
    if (iw <= 0 || ih <= 0) return;
    const maxRadius = Math.floor((iw < ih ? iw : ih) / 2);
    const rad = Math.max(0, Math.min(Math.trunc(r), maxRadius));
    this.fillRect(ix + rad, iy, iw - 2 * rad, ih, on);
    if (rad > 0) {
      this.fillCircleHelper(ix + iw - rad - 1, iy + rad, rad, 1, ih - 2 * rad - 1, on);
      this.fillCircleHelper(ix + rad, iy + rad, rad, 2, ih - 2 * rad - 1, on);
    }
  }

  fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, on: boolean): void {
    let ax = Math.trunc(x0), ay = Math.trunc(y0);
    let bx = Math.trunc(x1), by = Math.trunc(y1);
    let cx = Math.trunc(x2), cy = Math.trunc(y2);
    if (ay > by) { [ay, by] = [by, ay]; [ax, bx] = [bx, ax]; }
    if (by > cy) { [by, cy] = [cy, by]; [bx, cx] = [cx, bx]; }
    if (ay > by) { [ay, by] = [by, ay]; [ax, bx] = [bx, ax]; }
    if (ay === cy) {
      const minX = Math.min(ax, bx, cx);
      const maxX = Math.max(ax, bx, cx);
      this.drawHLine(minX, ay, maxX - minX + 1, on);
      return;
    }
    const dx01 = bx - ax, dy01 = by - ay;
    const dx02 = cx - ax, dy02 = cy - ay;
    const dx12 = cx - bx, dy12 = cy - by;
    let sa = 0, sb = 0;
    const last = by === cy ? by : by - 1;
    for (let y = ay; y <= last; y++) {
      const a = ax + Math.trunc(sa / (dy01 || 1));
      const b = ax + Math.trunc(sb / (dy02 || 1));
      sa += dx01;
      sb += dx02;
      const left = Math.min(a, b);
      this.drawHLine(left, y, Math.abs(b - a) + 1, on);
    }
    sa = dx12 * (last + 1 - by);
    sb = dx02 * (last + 1 - ay);
    for (let y = last + 1; y <= cy; y++) {
      const a = bx + Math.trunc(sa / (dy12 || 1));
      const b = ax + Math.trunc(sb / (dy02 || 1));
      sa += dx12;
      sb += dx02;
      const left = Math.min(a, b);
      this.drawHLine(left, y, Math.abs(b - a) + 1, on);
    }
  }
}

// Constants directly ported from face.h
const FACE_CFG = {
  centerX: 64,
  centerY: 30,
  morphSpeed: 8.0,
  blinkSeconds: 0.18,
  sleepHealth: 15,
  droopBelow: 60,
  petMs: 2200,
  celebrateMs: 2800,
  lookPxX: 12.0,
  lookPxY: 6.0,
};

function presetFor(e: FaceExpr): Pose {
  switch (e) {
    case "slightly_happy":
      return { w: 32, h: 29, r: 13, gap: 16, tired: 0, happy: 0.25, bob: 0.4, bobHz: 0.4, gaze: 1, gazeBias: 0, blinkEvery: 4 };
    case "happy":
      return { w: 38, h: 38, r: 17, gap: 12, tired: 0, happy: 1, bob: 2, bobHz: 1.2, gaze: 1, gazeBias: -0.1, blinkEvery: 3 };
    case "sad":
      return { w: 30, h: 30, r: 11, gap: 18, tired: 0.65, happy: 0, bob: 0, bobHz: 0, gaze: 0.35, gazeBias: 0.7, blinkEvery: 6 };
    case "sleepy":
      return { w: 32, h: 15, r: 8, gap: 16, tired: 0.9, happy: 0, bob: 0.8, bobHz: 0.25, gaze: 0, gazeBias: 0.3, blinkEvery: 7 };
    case "petted":
      return { w: 35, h: 28, r: 13, gap: 14, tired: 0, happy: 1, bob: 1, bobHz: 2, gaze: 0, gazeBias: 0, blinkEvery: 99 };
    case "celebrate":
      return { w: 35, h: 36, r: 14, gap: 12, tired: 0, happy: 0.55, bob: 4, bobHz: 2.5, gaze: 0, gazeBias: -0.3, blinkEvery: 99 };
    default:
      return { w: 32, h: 34, r: 12, gap: 16, tired: 0, happy: 0, bob: 0, bobHz: 0, gaze: 1, gazeBias: 0, blinkEvery: 4 };
  }
}

export class OledFaceEngine {
  private cur: Pose = { w: 32, h: 34, r: 9, gap: 16, tired: 0, happy: 0, bob: 0, bobHz: 0, gaze: 1, gazeBias: 0, blinkEvery: 4 };
  private mood: MoodLevel = 1;
  private health = 75;
  private reaction: ReactionType = "none";
  private reactEnd = 0;
  private lastMs = 0;
  private rng = 0x9e3779b9;
  private started = false;
  private clock = 0;
  private blinkPhase = -1;
  private blinkTimer = 2;
  private gazeTimer = 1;
  private gx = 0;
  private gy = 0;
  private gcx = 0;
  private gcy = 0;
  private bobPhase = 0;
  private bobPx = 0;

  constructor(seed = 0x9e3779b9) {
    this.rng = seed >>> 0 || 1;
  }

  setMood(m: MoodLevel): void {
    this.mood = m;
  }

  setHealth(h: number): void {
    this.health = Math.max(0, Math.min(100, Math.round(h)));
  }

  react(r: ReactionType, nowMs: number): void {
    if (r === "none") return;
    if (this.reaction === "celebrate" && r === "pet") return;
    this.reaction = r;
    this.reactEnd = nowMs + (r === "pet" ? FACE_CFG.petMs : FACE_CFG.celebrateMs);
  }

  expression(): FaceExpr {
    if (this.reaction === "pet") return "petted";
    if (this.reaction === "celebrate") return "celebrate";
    if (this.health <= FACE_CFG.sleepHealth) return "sleepy";
    if (this.mood === 3) return "happy";
    if (this.mood === 2) return "slightly_happy";
    if (this.mood === 0) return "sad";
    return "neutral";
  }

  update(nowMs: number, freezeMotion = false): void {
    let dt = 0.033;
    if (this.started) {
      dt = Math.min(0.1, Math.max(0, (nowMs - this.lastMs) * 0.001));
    }
    this.lastMs = nowMs;
    if (this.reaction !== "none" && nowMs >= this.reactEnd) {
      this.reaction = "none";
    }
    const target = this.targetPose();
    if (!this.started) {
      this.cur = { ...target };
      this.started = true;
    } else {
      const k = 1 - Math.exp(-FACE_CFG.morphSpeed * dt);
      this.cur.w += (target.w - this.cur.w) * k;
      this.cur.h += (target.h - this.cur.h) * k;
      this.cur.r += (target.r - this.cur.r) * k;
      this.cur.gap += (target.gap - this.cur.gap) * k;
      this.cur.tired += (target.tired - this.cur.tired) * k;
      this.cur.happy += (target.happy - this.cur.happy) * k;
      this.cur.bob += (target.bob - this.cur.bob) * k;
      this.cur.bobHz += (target.bobHz - this.cur.bobHz) * k;
      this.cur.gaze += (target.gaze - this.cur.gaze) * k;
      this.cur.gazeBias += (target.gazeBias - this.cur.gazeBias) * k;
      this.cur.blinkEvery += (target.blinkEvery - this.cur.blinkEvery) * k;
    }
    if (!freezeMotion) {
      this.stepBlink(dt);
      this.stepGaze(dt);
      this.stepBob(dt);
      this.clock += dt;
    }
  }

  render(c: OledCanvas): FaceFrame {
    c.clear();
    const open = this.openness();
    const w = Math.floor(this.cur.w + 0.5);
    const h = Math.max(2, Math.floor(this.cur.h * open + 0.5));
    const gap = Math.floor(this.cur.gap + 0.5);
    let r = Math.floor(this.cur.r + 0.5);
    if (r > Math.floor(h / 2)) r = Math.floor(h / 2);
    if (r > Math.floor(w / 2)) r = Math.floor(w / 2);

    const cx = FACE_CFG.centerX + Math.floor(this.gcx * FACE_CFG.lookPxX * 0.7 + 0.5);
    const cy = FACE_CFG.centerY + Math.floor(this.gcy * FACE_CFG.lookPxY + 0.5) + Math.floor(this.bobPx + 0.5);
    const leftEyeX = cx - Math.floor(gap / 2) - w;
    const rightEyeX = cx + Math.floor(gap / 2);
    const eyeY = cy - Math.floor(h / 2);

    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? leftEyeX : rightEyeX;
      c.fillRoundRect(x, eyeY, w, h, r, true);
      if (this.cur.tired > 0.02) {
        const cut = eyeY + Math.trunc(h * 0.35 * this.cur.tired);
        if (i === 0) c.fillTriangle(x - 1, eyeY - 1, x + w + 1, eyeY - 1, x - 1, cut, false);
        else c.fillTriangle(x - 1, eyeY - 1, x + w + 1, eyeY - 1, x + w + 1, cut, false);
      }
      if (this.cur.happy > 0.02) {
        const off = Math.trunc(h * 0.25 * this.cur.happy);
        c.fillRoundRect(x - 1, eyeY + h - off, w + 2, h + 4, r, false);
      }
    }

    const mouthX = FACE_CFG.centerX;
    const mouthY = FACE_CFG.centerY + Math.floor(this.gcy * FACE_CFG.lookPxY + 0.5) + Math.floor(this.bobPx + 0.5) + 21;
    this.drawMouth(c, mouthX, mouthY);

    if (this.reaction === "none" && this.health <= FACE_CFG.sleepHealth) {
      this.drawZ(c);
    }

    return { cx, cy, w, h, gap, r, leftEyeX, rightEyeX, eyeY, mouthX, mouthY, openness: open, expression: this.expression() };
  }

  private drawMouth(c: OledCanvas, cx: number, cy: number): void {
    switch (this.expression()) {
      case "neutral":
        c.drawLine(cx - 5, cy, cx + 5, cy, true);
        break;
      case "slightly_happy":
        c.drawLine(cx - 5, cy, cx - 2, cy + 2, true);
        c.drawLine(cx - 2, cy + 2, cx + 2, cy + 2, true);
        c.drawLine(cx + 2, cy + 2, cx + 5, cy, true);
        break;
      case "happy":
      case "petted":
        c.drawLine(cx - 10, cy - 2, cx - 6, cy + 3, true);
        c.drawLine(cx - 6, cy + 3, cx, cy + 6, true);
        c.drawLine(cx, cy + 6, cx + 6, cy + 3, true);
        c.drawLine(cx + 6, cy + 3, cx + 10, cy - 2, true);
        break;
      case "sad":
        c.drawLine(cx - 7, cy + 2, cx - 3, cy - 1, true);
        c.drawLine(cx - 3, cy - 1, cx + 3, cy - 1, true);
        c.drawLine(cx + 3, cy - 1, cx + 7, cy + 2, true);
        break;
      case "sleepy":
        c.drawLine(cx - 4, cy, cx + 4, cy, true);
        break;
      case "celebrate": {
        const pulse = (Math.sin(this.clock * 10) + 1) * 0.5;
        const mouthH = 3 + Math.trunc(pulse * 7);
        const mouthW = 8 + Math.trunc(pulse * 3);
        c.fillRoundRect(cx - Math.floor(mouthW / 2), cy - Math.floor(mouthH / 2), mouthW, mouthH, 3, true);
        break;
      }
    }
  }

  private targetPose(): Pose {
    const e = this.expression();
    const t = presetFor(e);
    if (this.reaction === "none" && e !== "sleepy" && this.health < FACE_CFG.droopBelow) {
      const d = (FACE_CFG.droopBelow - this.health) / FACE_CFG.droopBelow;
      t.tired = Math.min(1, t.tired + 0.5 * d);
      t.h *= 1 - 0.2 * d;
      t.gaze *= 1 - 0.5 * d;
    }
    return t;
  }

  private rnd(): number {
    let x = this.rng >>> 0;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    this.rng = x >>> 0;
    return (this.rng & 0xffffff) / 16777216;
  }

  private openness(): number {
    if (this.blinkPhase < 0) return 1;
    const p = this.blinkPhase;
    const tri = p < 0.5 ? 1 - 2 * p : 2 * p - 1;
    return 0.04 + 0.96 * tri;
  }

  private stepBlink(dt: number): void {
    if (this.blinkPhase >= 0) {
      this.blinkPhase += dt / FACE_CFG.blinkSeconds;
      if (this.blinkPhase >= 1) {
        this.blinkPhase = -1;
        this.blinkTimer = this.cur.blinkEvery * (0.5 + this.rnd());
        if (this.rnd() < 0.15) this.blinkTimer = 0.15;
      }
    } else if (this.cur.blinkEvery < 50) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) this.blinkPhase = 0;
    }
  }

  private stepGaze(dt: number): void {
    this.gazeTimer -= dt;
    if (this.gazeTimer <= 0) {
      this.gazeTimer = 1.2 + 3 * this.rnd();
      if (this.rnd() < 0.3) {
        this.gx = 0;
        this.gy = 0;
      } else {
        this.gx = this.rnd() * 2 - 1;
        this.gy = (this.rnd() * 2 - 1) * 0.6;
      }
    }
    const k = 1 - Math.exp(-10 * dt);
    const tx = this.gx * this.cur.gaze;
    const ty = Math.max(-1, Math.min(1, this.gy * this.cur.gaze + this.cur.gazeBias));
    this.gcx += (tx - this.gcx) * k;
    this.gcy += (ty - this.gcy) * k;
  }

  private stepBob(dt: number): void {
    this.bobPhase += 6.2831853 * this.cur.bobHz * dt;
    if (this.bobPhase > 6.2831853) this.bobPhase -= 6.2831853;
    this.bobPx = this.cur.bob * Math.sin(this.bobPhase);
  }

  private drawZ(c: OledCanvas): void {
    const t = (this.clock * 0.5) % 1;
    const s = 5 + Math.trunc(t * 3);
    const zx = 98 + Math.trunc(t * 10);
    const zy = 14 - Math.trunc(t * 10);
    c.drawLine(zx, zy, zx + s, zy, true);
    c.drawLine(zx + s, zy, zx, zy + s, true);
    c.drawLine(zx, zy + s, zx + s, zy + s, true);
  }
}