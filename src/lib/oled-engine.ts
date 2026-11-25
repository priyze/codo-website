export const OLED_WIDTH = 128;
export const OLED_HEIGHT = 64;

export interface OledCanvas {
  clear(): void;
  drawPixel(x: number, y: number, on: boolean): void;
  drawFastHLine(x: number, y: number, w: number, on: boolean): void;
  drawFastVLine(x: number, y: number, h: number, on: boolean): void;
  fillRect(x: number, y: number, w: number, h: number, on: boolean): void;
  fillCircle(x0: number, y0: number, r: number, on: boolean): void;
  fillRoundRect(x: number, y: number, w: number, h: number, r: number, on: boolean): void;
  fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, on: boolean): void;
  drawLine(x0: number, y0: number, x1: number, y1: number, on: boolean): void;
}

export type MoodLevel = 0 | 1 | 2 | 3; // 0=Sad, 1=Neutral, 2=Happy, 3=Ecstatic
export type ReactionType = "none" | "pet" | "celebrate" | "poke";

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
  happyEyes: boolean;
  sleeping: boolean;
}

// Face model ported directly from types.h / sketch.ino
interface Face {
  eyeOpen: number;
  droop: number;
  smile: number;
  mouth: number;
  lookX: number;
  lookY: number;
  blush: number;
  happyEyes: number;
}

// Pixel-exact 128x64 monochrome framebuffer emulating Adafruit_SSD1306 + Adafruit_GFX primitives
export class PixelBufferCanvas implements OledCanvas {
  readonly pixels = new Uint8Array(OLED_WIDTH * OLED_HEIGHT);

  clear(): void {
    this.pixels.fill(0);
  }

  drawPixel(x: number, y: number, on: boolean): void {
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
      this.drawPixel(ix0, iy0, on);
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

  drawFastVLine(x: number, y: number, h: number, on: boolean): void {
    const ih = Math.trunc(h);
    for (let dy = 0; dy < ih; dy++) this.drawPixel(x, y + dy, on);
  }

  drawFastHLine(x: number, y: number, w: number, on: boolean): void {
    const iw = Math.trunc(w);
    for (let dx = 0; dx < iw; dx++) this.drawPixel(x + dx, y, on);
  }

  fillRect(x: number, y: number, w: number, h: number, on: boolean): void {
    const iw = Math.trunc(w);
    const ih = Math.trunc(h);
    for (let dx = 0; dx < iw; dx++) this.drawFastVLine(x + dx, y, ih, on);
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
        if (corners & 1) this.drawFastVLine(x0 + x, y0 - y, 2 * y + d, on);
        if (corners & 2) this.drawFastVLine(x0 - x, y0 - y, 2 * y + d, on);
      }
      if (y !== py) {
        if (corners & 1) this.drawFastVLine(x0 + py, y0 - px, 2 * px + d, on);
        if (corners & 2) this.drawFastVLine(x0 - py, y0 - px, 2 * px + d, on);
        py = y;
      }
      px = x;
    }
  }

  fillCircle(x0: number, y0: number, r: number, on: boolean): void {
    const ix0 = Math.trunc(x0);
    const iy0 = Math.trunc(y0);
    const ir = Math.trunc(r);
    if (ir < 0) return;
    this.drawFastVLine(ix0, iy0 - ir, 2 * ir + 1, on);
    this.fillCircleHelper(ix0, iy0, ir, 3, 0, on);
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
      this.drawFastHLine(minX, ay, maxX - minX + 1, on);
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
      this.drawFastHLine(left, y, Math.abs(b - a) + 1, on);
    }
    sa = dx12 * (last + 1 - by);
    sb = dx02 * (last + 1 - ay);
    for (let y = last + 1; y <= cy; y++) {
      const a = bx + Math.trunc(sa / (dy12 || 1));
      const b = ax + Math.trunc(sb / (dy02 || 1));
      sa += dx12;
      sb += dx02;
      const left = Math.min(a, b);
      this.drawFastHLine(left, y, Math.abs(b - a) + 1, on);
    }
  }
}

const MOOD_SMILE: readonly [number, number, number, number] = [-0.7, 0.0, 0.6, 1.0];
const MOOD_MOUTH: readonly [number, number, number, number] = [0.0, 0.0, 0.0, 0.8];
const SPARKLE_X = [8, 118, 22, 104, 60, 70] as const;
const SPARKLE_Y = [10, 12, 56, 54, 4, 60] as const;

// Ported 1:1 from Codogotchi sketch.ino (face model, smoothing, blink, reactions, and drawing)
export class OledFaceEngine {
  private cur: Face = { eyeOpen: 0.8, droop: 0.4, smile: 0, mouth: 0, lookX: 0, lookY: 0, blush: 0, happyEyes: 0 };
  private tgt: Face = { ...this.cur };
  private mood: MoodLevel = 1;
  private health = 60;
  private sleeping = false;
  private reaction: ReactionType = "none";
  private rxStart = 0;
  private rxDur = 0;
  private extraBounce = 0;
  private lastMs = 0;
  private nowMs = 0;
  private rng = 0x9e3779b9;
  private started = false;
  private gazeX = 0;
  private gazeY = 0;
  private nextGaze = 0;
  private nextBlink = 2500;
  private blinkStart = 0;
  private blinking = false;

  constructor(seed = 0x9e3779b9) {
    this.rng = seed >>> 0 || 1;
  }

  setMood(m: MoodLevel): void {
    this.mood = m;
  }

  setHealth(h: number): void {
    this.health = Math.max(0, Math.min(100, Math.round(h)));
  }

  setSleeping(s: boolean): void {
    this.sleeping = s;
  }

  react(r: ReactionType, nowMs: number): void {
    if (r === "none") return;
    if (this.reaction === "celebrate" && r === "pet") return;
    this.reaction = r;
    this.rxStart = nowMs;
    this.rxDur = r === "celebrate" ? 2800 : r === "poke" ? 450 : 2100;
  }

  update(nowMs: number, freezeMotion = false): void {
    let dt = 0.033;
    if (this.started) {
      dt = Math.min(0.1, Math.max(0, (nowMs - this.lastMs) * 0.001));
    }
    this.lastMs = nowMs;
    this.nowMs = nowMs;

    const h = this.health / 100;
    const m = this.mood;

    this.tgt.eyeOpen = 0.55 + 0.55 * h;
    this.tgt.droop = 1 - h;
    this.tgt.smile = MOOD_SMILE[m];
    this.tgt.mouth = MOOD_MOUTH[m];
    this.tgt.blush = 0;
    this.tgt.happyEyes = 0;

    if (!freezeMotion) {
      if (nowMs > this.nextGaze) {
        if (Math.floor(this.rnd() * 3) === 0) {
          this.gazeX = 0;
          this.gazeY = 0;
        } else {
          this.gazeX = this.rnd() * 2 - 1;
          this.gazeY = this.rnd() - 0.5;
        }
        this.nextGaze = nowMs + 1800 + this.rnd() * 4200;
      }
      this.tgt.lookX = this.gazeX;
      this.tgt.lookY = this.gazeY;
      this.extraBounce = Math.sin(nowMs / 1100) * 0.8;
    } else {
      this.tgt.lookX = 0;
      this.tgt.lookY = 0;
      this.extraBounce = 0;
    }

    if (this.sleeping) {
      this.tgt.eyeOpen = 0.08;
      this.tgt.droop = 0;
      this.tgt.smile = 0.2;
      this.tgt.mouth = 0;
      this.tgt.lookX = 0;
      this.tgt.lookY = 0;
      this.extraBounce = freezeMotion ? 0 : Math.sin(nowMs / 1800) * 1.2;
    } else {
      this.applyReaction(nowMs);
    }

    if (!this.started || freezeMotion) {
      this.cur = { ...this.tgt };
      this.started = true;
    } else {
      const k = 1 - Math.exp(-dt / 0.1);
      this.cur.eyeOpen += (this.tgt.eyeOpen - this.cur.eyeOpen) * k;
      this.cur.droop += (this.tgt.droop - this.cur.droop) * k;
      this.cur.smile += (this.tgt.smile - this.cur.smile) * k;
      this.cur.mouth += (this.tgt.mouth - this.cur.mouth) * k;
      this.cur.lookX += (this.tgt.lookX - this.cur.lookX) * k;
      this.cur.lookY += (this.tgt.lookY - this.cur.lookY) * k;
      this.cur.blush += (this.tgt.blush - this.cur.blush) * k;
      this.cur.happyEyes += (this.tgt.happyEyes - this.cur.happyEyes) * k;
    }
  }

  private applyReaction(nowMs: number): void {
    if (this.reaction === "none") return;
    const elapsed = nowMs - this.rxStart;
    if (elapsed > this.rxDur) {
      this.reaction = "none";
      return;
    }
    const s = elapsed / 1000;
    switch (this.reaction) {
      case "celebrate":
        this.tgt.happyEyes = 1;
        this.tgt.smile = 1;
        this.tgt.mouth = 1;
        this.tgt.blush = 1;
        this.tgt.droop = 0;
        this.extraBounce = -Math.abs(Math.sin(s * Math.PI * 3)) * 7;
        break;
      case "poke":
        this.tgt.eyeOpen = 1.25;
        this.tgt.droop = 0;
        this.tgt.smile = 0;
        this.tgt.mouth = 0.6;
        this.tgt.lookX = 0;
        this.tgt.lookY = 0;
        this.extraBounce = 1.5;
        break;
      case "pet":
        this.tgt.happyEyes = 1;
        this.tgt.blush = 1;
        this.tgt.smile = Math.max(this.tgt.smile, 0.7);
        this.tgt.lookX = 0;
        this.tgt.lookY = 0;
        this.extraBounce += Math.sin(s * 9) * 0.8;
        break;
    }
  }

  private blinkAmount(nowMs: number, freezeMotion: boolean): number {
    if (this.sleeping || freezeMotion) return 0;
    if (!this.blinking && nowMs >= this.nextBlink) {
      this.blinking = true;
      this.blinkStart = nowMs;
    }
    if (!this.blinking) return 0;
    const p = (nowMs - this.blinkStart) / 160;
    if (p >= 1) {
      this.blinking = false;
      this.nextBlink = nowMs + 2200 + this.rnd() * 4300;
      return 0;
    }
    return p < 0.5 ? p * 2 : (1 - p) * 2;
  }

  render(c: OledCanvas, freezeMotion = false): FaceFrame {
    c.clear();
    const blink = this.blinkAmount(this.nowMs, freezeMotion);
    const ew = 26;
    const baseH = 28;
    const oh = Math.max(2, baseH * this.cur.eyeOpen * (1 - blink));
    const lx = Math.trunc(this.cur.lookX * 4);
    const yc = 26 + Math.trunc(this.cur.lookY * 3 + this.extraBounce);

    this.drawEye(c, 38, true, this.cur, blink, ew, oh, lx, yc);
    this.drawEye(c, 90, false, this.cur, blink, ew, oh, lx, yc);
    this.drawMouth(c, this.cur);
    this.drawBlush(c, this.cur.blush);

    if (!this.sleeping && this.reaction === "celebrate") {
      this.drawSparkles(c, this.nowMs);
    }
    if (!this.sleeping && this.reaction === "pet") {
      for (let k = 0; k < 3; k++) {
        const ph = ((this.nowMs / 1000) * 0.8 + k * 0.33) % 1;
        this.drawHeart(c, 104 + k * 8, 40 - Math.trunc(ph * 34));
      }
    }
    if (this.sleeping) {
      for (let k = 0; k < 3; k++) {
        const ph = (this.nowMs / 1500 + k * 0.33) % 1;
        this.drawTinyZ(c, 96 + k * 8, 30 - Math.trunc(ph * 24));
      }
    }

    const leftEyeX = 38 - ew / 2 + lx;
    const rightEyeX = 90 - ew / 2 + lx;
    const h = Math.trunc(oh);
    const eyeY = yc - Math.trunc(oh / 2);

    return {
      cx: 64 + lx,
      cy: yc,
      w: ew,
      h,
      gap: rightEyeX - (leftEyeX + ew),
      r: 8,
      leftEyeX,
      rightEyeX,
      eyeY,
      mouthX: 64,
      mouthY: 50,
      openness: Math.max(0.08, Math.min(1, (1 - blink) * this.cur.eyeOpen)),
      happyEyes: this.cur.happyEyes > 0.5,
      sleeping: this.sleeping,
    };
  }

  private drawEye(
    c: OledCanvas,
    cx: number,
    leftEye: boolean,
    f: Face,
    _blink: number,
    ew: number,
    oh: number,
    lx: number,
    yc: number,
  ): void {
    if (f.happyEyes > 0.5) {
      for (let i = -ew / 2; i <= ew / 2; i++) {
        const k = i / (ew / 2);
        const yy = yc + 5 - Math.trunc(9 * (1 - k * k));
        for (let t = 0; t < 3; t++) c.drawPixel(cx + lx + i, yy + t, true);
      }
      return;
    }
    const x = cx - ew / 2 + lx;
    const y = yc - Math.trunc(oh / 2);
    c.fillRoundRect(x, y, ew, Math.trunc(oh), 8, true);
    if (f.droop > 0.05) {
      const d = Math.trunc(f.droop * oh * 0.6);
      const lid = Math.trunc(f.droop * oh * 0.2);
      if (lid > 0) c.fillRect(x - 1, y - 1, ew + 2, lid + 1, false);
      if (leftEye) c.fillTriangle(x - 1, y - 1, x + ew + 1, y - 1, x - 1, y + d, false);
      else c.fillTriangle(x + ew + 1, y - 1, x - 1, y - 1, x + ew + 1, y + d, false);
    }
  }

  private drawMouth(c: OledCanvas, f: Face): void {
    const cx = 64;
    const cy = 50;
    const W = 10 + Math.trunc(6 * Math.abs(f.smile));
    if (f.mouth > 0.3 && Math.abs(f.smile) < 0.25) {
      c.fillCircle(cx, cy + 2, 2 + Math.trunc(f.mouth * 3), true);
      return;
    }
    let px = 0;
    let py = 0;
    for (let i = -W; i <= W; i += 2) {
      const k = i / W;
      const y = cy + Math.trunc(f.smile * 8 * (1 - k * k));
      if (f.smile > 0.2 && f.mouth > 0.2) {
        const top = cy - 1;
        const h = Math.trunc((y - top) * f.mouth);
        if (h > 0) {
          c.drawFastVLine(cx + i, top, h + 1, true);
          c.drawFastVLine(cx + i + 1, top, h + 1, true);
        }
      }
      if (i > -W) {
        c.drawLine(px, py, cx + i, y, true);
        c.drawLine(px, py + 1, cx + i, y + 1, true);
      }
      px = cx + i;
      py = y;
    }
  }

  private drawBlush(c: OledCanvas, a: number): void {
    if (a < 0.3) return;
    for (let dx = 0; dx < 8; dx++) {
      for (let dy = 0; dy < 4; dy++) {
        if (((dx + dy) & 1) === 0) {
          c.drawPixel(10 + dx, 42 + dy, true);
          c.drawPixel(110 + dx, 42 + dy, true);
        }
      }
    }
  }

  private drawHeart(c: OledCanvas, x: number, y: number): void {
    c.fillCircle(x - 2, y, 2, true);
    c.fillCircle(x + 2, y, 2, true);
    c.fillTriangle(x - 4, y + 1, x + 4, y + 1, x, y + 5, true);
  }

  private drawSparkles(c: OledCanvas, nowMs: number): void {
    const s = (nowMs - this.rxStart) / 1000;
    for (let k = 0; k < 6; k++) {
      const px = SPARKLE_X[k]!;
      const py = SPARKLE_Y[k]!;
      const r = Math.trunc(Math.abs(Math.sin(s * 8 + k * 1.3)) * 3) + 1;
      c.drawFastHLine(px - r, py, 2 * r + 1, true);
      c.drawFastVLine(px, py - r, 2 * r + 1, true);
    }
  }

  private drawTinyZ(c: OledCanvas, x: number, y: number): void {
    c.drawFastHLine(x, y, 4, true);
    c.drawLine(x + 3, y, x, y + 4, true);
    c.drawFastHLine(x, y + 4, 4, true);
  }

  private rnd(): number {
    let x = this.rng >>> 0;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    this.rng = x >>> 0;
    return (this.rng & 0xffffff) / 16777216;
  }
}