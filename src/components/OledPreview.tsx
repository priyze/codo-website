import { useEffect, useRef, useState } from "react";
import { Sparkles, Hand } from "lucide-react";
import { getAccessoryById } from "@/lib/accessories";
import {
  OLED_HEIGHT,
  OLED_WIDTH,
  OledFaceEngine,
  PixelBufferCanvas,
  type MoodLevel,
} from "@/lib/oled-engine";
import { playCelebrateChirp, playPetChirp } from "@/lib/sound";

function drawPixelsToCanvas(ctx: CanvasRenderingContext2D, pixels: Uint8Array, bg: string, fg: string) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, OLED_WIDTH, OLED_HEIGHT);
  ctx.fillStyle = fg;
  for (let y = 0; y < OLED_HEIGHT; y++) {
    const row = y * OLED_WIDTH;
    for (let x = 0; x < OLED_WIDTH; x++) {
      if (pixels[row + x]) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function readOledColors(): { bg: string; fg: string } {
  if (typeof window === "undefined") return { bg: "#141221", fg: "#dde5ed" };
  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--oled-screen").trim() || "#141221";
  const fg = styles.getPropertyValue("--oled-pixel").trim() || "#dde5ed";
  return { bg, fg };
}

interface OledModuleProps {
  buddyName: string;
  mood: MoodLevel;
  health: number;
  eyesAccessoryId: string | null;
  mouthAccessoryId: string | null;
  celebrateTick?: number;
  compact?: boolean;
}

export function OledModule({
  buddyName,
  mood,
  health,
  eyesAccessoryId,
  mouthAccessoryId,
  celebrateTick = 0,
  compact = false,
}: OledModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<OledFaceEngine | null>(null);
  const bufferRef = useRef<PixelBufferCanvas | null>(null);
  const eyesRef = useRef(eyesAccessoryId);
  const mouthRef = useRef(mouthAccessoryId);
  const [touchActive, setTouchActive] = useState(false);

  eyesRef.current = eyesAccessoryId;
  mouthRef.current = mouthAccessoryId;

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new OledFaceEngine(0x9e3779b9);
    }
    engineRef.current.setMood(mood);
    engineRef.current.setHealth(health);
  }, [mood, health]);

  useEffect(() => {
    if (celebrateTick > 0 && engineRef.current) {
      engineRef.current.react("celebrate", performance.now());
      playCelebrateChirp();
    }
  }, [celebrateTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!engineRef.current) engineRef.current = new OledFaceEngine(0x9e3779b9);
    if (!bufferRef.current) bufferRef.current = new PixelBufferCanvas();

    const engine = engineRef.current;
    const buffer = bufferRef.current;
    engine.setMood(mood);
    engine.setHealth(health);

    let rafId = 0;
    let lastRender = 0;

    const loop = (now: number) => {
      rafId = window.requestAnimationFrame(loop);
      if (now - lastRender < 33) return; // 30fps matching FRAME_MS = 33 in sketch.ino
      lastRender = now;

      engine.update(now);
      const frame = engine.render(buffer);

      const eyesAcc = getAccessoryById(eyesRef.current);
      if (eyesAcc) eyesAcc.draw(buffer, frame);
      const mouthAcc = getAccessoryById(mouthRef.current);
      if (mouthAcc) mouthAcc.draw(buffer, frame);

      const { bg, fg } = readOledColors();
      drawPixelsToCanvas(ctx, buffer.pixels, bg, fg);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [mood, health]);

  const handlePet = () => {
    setTouchActive(true);
    engineRef.current?.react("pet", performance.now());
    playPetChirp();
    window.setTimeout(() => setTouchActive(false), 320);
  };

  const handleCelebrate = () => {
    engineRef.current?.react("celebrate", performance.now());
    playCelebrateChirp();
  };

  return (
    <div className="rounded-2xl border border-border bg-oled-bezel p-4 shadow-xl">
      <div className="mb-2.5 flex items-center justify-between text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-health" />
          {buddyName || "Desk Buddy"}
        </span>
        <span>SSD1306 · 128×64</span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-oled-screen p-3 shadow-inner">
        <canvas
          ref={canvasRef}
          width={OLED_WIDTH}
          height={OLED_HEIGHT}
          aria-label={`${buddyName || "Desk buddy"} 0.96 inch OLED display`}
          className="oled-pixelated block aspect-[2/1] w-full rounded-sm"
        />
      </div>

      {!compact && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePet}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              touchActive
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-card/60 text-foreground hover:border-primary/60 hover:bg-card"
            }`}
          >
            <Hand className="size-3.5" />
            Touch Bar — Pet Buddy
          </button>
          <button
            type="button"
            onClick={handleCelebrate}
            title="Trigger celebration animation"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-health/60 hover:text-health"
          >
            <Sparkles className="size-3.5" />
            Celebrate
          </button>
        </div>
      )}
    </div>
  );
}

export function OledAccessoryThumbnail({ accessoryId }: { accessoryId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new OledFaceEngine(42);
    const buffer = new PixelBufferCanvas();
    engine.setMood(2);
    engine.setHealth(92);
    engine.update(1000, true);
    const frame = engine.render(buffer);

    const acc = getAccessoryById(accessoryId);
    if (acc) acc.draw(buffer, frame);

    const { bg, fg } = readOledColors();
    drawPixelsToCanvas(ctx, buffer.pixels, bg, fg);
  }, [accessoryId]);

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-oled-screen p-2">
      <canvas
        ref={canvasRef}
        width={OLED_WIDTH}
        height={OLED_HEIGHT}
        className="oled-pixelated block aspect-[2/1] w-full"
      />
    </div>
  );
}