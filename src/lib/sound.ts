// Retro piezo-style Web Audio chirps matching an ESP32 desk buddy buzzer
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

function playTone(freq: number, startOffset: number, duration: number, type: OscillatorType = "triangle", gainPeak = 0.07) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playPetChirp(): void {
  playTone(680, 0, 0.07, "sine", 0.06);
  playTone(920, 0.06, 0.09, "sine", 0.06);
}

export function playCelebrateChirp(): void {
  playTone(587.33, 0, 0.08, "triangle", 0.07);
  playTone(783.99, 0.07, 0.08, "triangle", 0.07);
  playTone(1046.5, 0.14, 0.14, "triangle", 0.08);
}

export function playHelloChime(): void {
  playTone(523.25, 0, 0.12, "sine", 0.05);
  playTone(659.25, 0.1, 0.16, "sine", 0.05);
}