import { describe, expect, it } from "vitest";
import { ACCESSORIES, STARTER_ACCESSORIES } from "@/lib/accessories";
import {
  MAX_LEVEL,
  calculateBuddyMetrics,
  coinsForProblemRating,
  type DistinctSolve,
} from "@/lib/scoring";

describe("CodoCoins & Desk Buddy Scoring Rules", () => {
  it("awards 10 coins for sub-1100, 20 for sub-1500, and 30 for 1500+ Codeforces problems", () => {
    expect(coinsForProblemRating(800)).toBe(10);
    expect(coinsForProblemRating(1099)).toBe(10);
    expect(coinsForProblemRating(1100)).toBe(20);
    expect(coinsForProblemRating(1499)).toBe(20);
    expect(coinsForProblemRating(1500)).toBe(30);
    expect(coinsForProblemRating(2400)).toBe(30);
  });

  it("counts only distinct Codeforces problems and awards 15 coins per GitHub push", () => {
    const now = Date.UTC(2026, 10, 25, 12, 0, 0);
    const sec = Math.floor(now / 1000);
    const solves: DistinctSolve[] = [
      { id: "100-A", rating: 900, solvedAtSec: sec, tags: ["math"] },
      { id: "100-A", rating: 900, solvedAtSec: sec + 60, tags: ["math"] }, // duplicate ignored
      { id: "100-B", rating: 1300, solvedAtSec: sec, tags: ["greedy"] },
      { id: "100-C", rating: 1700, solvedAtSec: sec, tags: ["dp"] },
    ];
    const metrics = calculateBuddyMetrics({
      distinctSolves: solves,
      totalGithubPushes: 4,
      todayGithubPushes: 1,
      activeDaysLast14: 7,
      nowMs: now,
    });

    // 10 + 20 + 30 = 60 from CF, 4 * 15 = 60 from GitHub
    expect(metrics.coinsFromCf).toBe(60);
    expect(metrics.coinsFromGithub).toBe(60);
    expect(metrics.totalEarnedCoins).toBe(120);
    expect(metrics.moodLabel).toBe("Ecstatic");
  });

  it("caps desk buddy level at 50 and keeps health within 0-100", () => {
    const now = Date.UTC(2026, 10, 25, 12, 0, 0);
    const baseSec = Math.floor(now / 1000) - 86400 * 30;
    const solves: DistinctSolve[] = Array.from({ length: 1200 }, (_, i) => ({
      id: `p-${i}`,
      rating: i < 10 ? 800 : 2800,
      solvedAtSec: baseSec + i * 100,
      tags: ["dp"],
    }));
    const metrics = calculateBuddyMetrics({
      distinctSolves: solves,
      totalGithubPushes: 1500,
      todayGithubPushes: 5,
      activeDaysLast14: 14,
      nowMs: now,
    });

    expect(metrics.level).toBe(MAX_LEVEL);
    expect(metrics.level).toBe(50);
    expect(metrics.health).toBeGreaterThanOrEqual(0);
    expect(metrics.health).toBeLessThanOrEqual(100);
  });

  it("provides at most 4 basic starter accessories and only eyes/mouth slots", () => {
    expect(STARTER_ACCESSORIES.length).toBeLessThanOrEqual(4);
    expect(STARTER_ACCESSORIES.length).toBeGreaterThan(0);
    for (const acc of ACCESSORIES) {
      expect(["eyes", "mouth"]).toContain(acc.slot);
      expect(acc.unlockLevel).toBeGreaterThanOrEqual(1);
      expect(acc.unlockLevel).toBeLessThanOrEqual(50);
    }
  });
});