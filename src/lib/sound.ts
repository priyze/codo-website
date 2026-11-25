// Passive buzzer note sweep patterns ported directly from Codogotchi sketch.ino
interface Note {
  f0: number;
  f1: number;
  ms: number;
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playPattern(notes: readonly Note[], gainPeak = 0.06): void {
  const ctx = getCtx();
  if (!ctx) return;
  let cursor = ctx.currentTime;
  for (const n of notes) {
    const dur = n.ms / 1000;
    if (n.f0 > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f0, cursor);
      if (n.f1 !== n.f0) {
        osc.frequency.linearRampToValueAtTime(n.f1, cursor + dur);
      }
      gain.gain.setValueAtTime(0.0001, cursor);
      gain.gain.exponentialRampToValueAtTime(gainPeak, cursor + Math.min(0.012, dur * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0001, cursor + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(cursor);
      osc.stop(cursor + dur + 0.015);
    }
    cursor += dur;
  }
}

const P_PURR: readonly Note[] = [
  { f0: 520, f1: 580, ms: 45 },
  { f0: 560, f1: 500, ms: 45 },
  { f0: 520, f1: 580, ms: 45 },
  { f0: 560, f1: 500, ms: 45 },
];

const P_POKE: readonly Note[] = [{ f0: 900, f1: 1500, ms: 55 }];

const P_CELEBRATE: readonly Note[] = [
  { f0: 1047, f1: 1047, ms: 80 },
  { f0: 1319, f1: 1319, ms: 80 },
  { f0: 1568, f1: 1568, ms: 80 },
  { f0: 2093, f1: 2093, ms: 160 },
  { f0: 0, f1: 0, ms: 40 },
  { f0: 1568, f1: 2093, ms: 60 },
  { f0: 0, f1: 0, ms: 30 },
  { f0: 1568, f1: 2093, ms: 60 },
  { f0: 2093, f1: 2637, ms: 220 },
];

const P_WAKE: readonly Note[] = [{ f0: 800, f1: 1600, ms: 120 }];

export function playPetChirp(): void {
  playPattern(P_PURR, 0.055);
}

export function playPokeChirp(): void {
  playPattern(P_POKE, 0.06);
}

export function playCelebrateChirp(): void {
  playPattern(P_CELEBRATE, 0.065);
}

export function playHelloChime(): void {
  playPattern(P_WAKE, 0.055);
}