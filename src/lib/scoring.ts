import type { MoodLevel } from "./oled-engine";

export const MAX_LEVEL = 50;

export interface DistinctSolve {
  id: string;
  rating: number | null;
  solvedAtSec: number;
  tags: string[];
}

export interface SyncBaseline {
  startedAtSec: number;
  initialSolvedIds: string[];
  initialGithubPushes: number;
}

export interface BuddyMetrics {
  totalEarnedCoins: number;
  coinsFromCf: number;
  coinsFromGithub: number;
  level: number; // 0..50, starts at 0 from pairing baseline
  levelProgress: number; // 0..100 toward next level
  totalXp: number;
  health: number; // 0..100 long-term consistency
  mood: MoodLevel; // 0=Sad, 1=Neutral, 2=Happy, 3=Ecstatic
  moodLabel: "Sad" | "Neutral" | "Happy" | "Ecstatic";
  todayWeightedScore: number;
  todaySolves: number;
  todayPushes: number;
  newSolvesCount: number;
  newGithubPushesCount: number;
  celebrateSeq: number;
  difficultyGain: number;
}

// Exact coin rules:
// - Codeforces problem sub 1100 -> 10 codocoins
// - Codeforces problem sub 1500 (1100..1499) -> 20 codocoins
// - Codeforces problem 1500+ -> 30 codocoins
// - Each GitHub push -> 15 codocoins
export function coinsForProblemRating(rating: number | null | undefined): number {
  const r = rating ?? 800;
  if (r < 1100) return 10;
  if (r < 1500) return 20;
  return 30;
}

export function weightForProblemRating(rating: number | null | undefined): number {
  const r = rating ?? 800;
  if (r < 1100) return 1.0;
  if (r < 1500) return 1.75;
  if (r < 1900) return 2.5;
  return 3.5;
}

export function moodLabelFromLevel(mood: MoodLevel): "Sad" | "Neutral" | "Happy" | "Ecstatic" {
  switch (mood) {
    case 3:
      return "Ecstatic";
    case 2:
      return "Happy";
    case 1:
      return "Neutral";
    default:
      return "Sad";
  }
}

// Cumulative XP required to reach level L (0..50).
// Lv 0 = 0 XP, Lv 1 = 46 XP (~2 easy solves or 3 pushes), Lv 50 = 17,000 XP.
export function xpRequiredForLevel(level: number): number {
  const clamped = Math.max(0, Math.min(MAX_LEVEL, Math.floor(level)));
  return Math.round(40 * clamped + 6 * clamped * clamped);
}

export function levelFromXp(totalXp: number): { level: number; levelProgress: number } {
  const xp = Math.max(0, totalXp);
  let level = 0;
  while (level < MAX_LEVEL && xp >= xpRequiredForLevel(level + 1)) {
    level += 1;
  }
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, levelProgress: 100 };
  }
  const curFloor = xpRequiredForLevel(level);
  const nextFloor = xpRequiredForLevel(level + 1);
  const progress = Math.round(((xp - curFloor) / Math.max(1, nextFloor - curFloor)) * 100);
  return { level, levelProgress: Math.max(0, Math.min(99, progress)) };
}

export function calculateBuddyMetrics(params: {
  distinctSolves: DistinctSolve[];
  totalGithubPushes: number;
  todayGithubPushes: number;
  newGithubPushesSinceStart?: number;
  activeDaysLast14: number;
  baseline?: SyncBaseline | null;
  nowMs?: number;
}): BuddyMetrics {
  const { distinctSolves, totalGithubPushes, todayGithubPushes, activeDaysLast14, baseline } = params;
  const nowMs = params.nowMs ?? Date.now();
  const startOfTodaySec = Math.floor(new Date(nowMs).setUTCHours(0, 0, 0, 0) / 1000);

  // Deduplicate by problem id just in case caller passed raw entries
  const seen = new Set<string>();
  const uniqueSolves: DistinctSolve[] = [];
  for (const s of distinctSolves) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    uniqueSolves.push(s);
  }

  // Filter solves earned AFTER pairing baseline so every user starts fresh from Level 0 & 0 coins
  const baselineIdSet = baseline ? new Set(baseline.initialSolvedIds) : null;
  const progressedSolves = baseline
    ? uniqueSolves.filter((s) => s.solvedAtSec >= baseline.startedAtSec && !baselineIdSet!.has(s.id))
    : uniqueSolves;

  let coinsFromCf = 0;
  let solveXp = 0;
  for (const s of progressedSolves) {
    coinsFromCf += coinsForProblemRating(s.rating);
    solveXp += weightForProblemRating(s.rating) * 25;
  }

  // Today's activity drives Codogotchi's live mood immediately
  let todaySolves = 0;
  let todayWeightedScore = todayGithubPushes * 1.0;
  for (const s of uniqueSolves) {
    if (s.solvedAtSec >= startOfTodaySec) {
      todaySolves += 1;
      todayWeightedScore += weightForProblemRating(s.rating);
    }
  }

  const safeTotalPushes = Math.max(0, Math.floor(totalGithubPushes));
  const progressedPushes = baseline
    ? Math.max(
        0,
        Math.floor(params.newGithubPushesSinceStart ?? Math.max(0, safeTotalPushes - baseline.initialGithubPushes)),
      )
    : safeTotalPushes;

  const coinsFromGithub = progressedPushes * 15;
  const totalEarnedCoins = coinsFromCf + coinsFromGithub;

  // Mood based on today's difficulty-weighted solves + GitHub pushes
  let mood: MoodLevel = 0;
  if (todayWeightedScore >= 5) mood = 3; // Ecstatic
  else if (todayWeightedScore >= 2.5) mood = 2; // Happy
  else if (todayWeightedScore >= 1) mood = 1; // Neutral
  else mood = 0; // Sad

  // Health (0..100): consistency over the past 14 days + today's mood boost
  const clampedDays = Math.max(0, Math.min(14, activeDaysLast14));
  const consistencyScore = Math.round((clampedDays / 14) * 82);
  const moodBonus = mood === 3 ? 18 : mood === 2 ? 12 : mood === 1 ? 6 : 0;
  const health = Math.max(10, Math.min(100, consistencyScore + moodBonus));

  // Difficulty gain from newly solved rated problems
  const rated = progressedSolves
    .filter((s) => typeof s.rating === "number" && s.rating > 0)
    .sort((a, b) => a.solvedAtSec - b.solvedAtSec);

  let difficultyGain = 0;
  if (rated.length >= 2) {
    const firstSlice = rated.slice(0, Math.min(5, Math.ceil(rated.length / 3)));
    const recentSlice = rated.slice(-Math.min(10, Math.ceil(rated.length / 2)));
    const startAvg = firstSlice.reduce((sum, s) => sum + (s.rating ?? 800), 0) / firstSlice.length;
    const recentAvg = recentSlice.reduce((sum, s) => sum + (s.rating ?? 800), 0) / recentSlice.length;
    const peakRating = rated.reduce((max, s) => Math.max(max, s.rating ?? 800), 800);
    difficultyGain = Math.max(0, Math.round(Math.max(recentAvg - startAvg, (peakRating - startAvg) * 0.6)));
  }

  const pushXp = progressedPushes * 20;
  const difficultyXp = Math.round(difficultyGain / 15);
  const totalXp = Math.round(solveXp + pushXp + difficultyXp);
  const { level, levelProgress } = levelFromXp(totalXp);

  return {
    totalEarnedCoins,
    coinsFromCf,
    coinsFromGithub,
    level,
    levelProgress,
    totalXp,
    health,
    mood,
    moodLabel: moodLabelFromLevel(mood),
    todayWeightedScore: Number(todayWeightedScore.toFixed(1)),
    todaySolves,
    todayPushes: todayGithubPushes,
    newSolvesCount: progressedSolves.length,
    newGithubPushesCount: progressedPushes,
    celebrateSeq: progressedSolves.length + progressedPushes,
    difficultyGain,
  };
}