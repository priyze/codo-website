import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { calculateBuddyMetrics, type BuddyMetrics, type DistinctSolve, type SyncBaseline } from "./scoring";

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RatingPoint {
  contestId: number;
  contestName: string;
  rank: number;
  rating: number;
  date: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface CodeforcesStats {
  handle: string;
  currentRating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  highestContestRanking: number | null;
  distinctSolvedCount: number;
  ratingHistory: RatingPoint[];
  tagFrequencies: TagCount[];
  heatmap: HeatmapDay[];
  error: string | null;
}

export interface GithubPopularRepo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
}

export interface GithubStats {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  totalPushes: number;
  todayPushes: number;
  mostPopularRepo: GithubPopularRepo | null;
  heatmap: HeatmapDay[];
  heatmapSource: "contributions" | "events";
  error: string | null;
}

export interface SyncedProfileData {
  syncedAt: string;
  baseline: SyncBaseline;
  codeforces: CodeforcesStats | null;
  github: GithubStats | null;
  metrics: BuddyMetrics;
}

function formatDateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildYearHeatmap(countsByDate: Map<string, number>, nowMs: number): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date(nowMs);
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = formatDateUTC(d);
    const count = countsByDate.get(key) ?? 0;
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    days.push({ date: key, count, level });
  }
  return days;
}

async function fetchCodeforces(handle: string, nowMs: number): Promise<{
  stats: CodeforcesStats;
  distinctSolves: DistinctSolve[];
  activeDates: Set<string>;
}> {
  const cleanHandle = handle.trim();
  const encoded = encodeURIComponent(cleanHandle);
  const emptyStats: CodeforcesStats = {
    handle: cleanHandle,
    currentRating: null,
    maxRating: null,
    rank: null,
    maxRank: null,
    highestContestRanking: null,
    distinctSolvedCount: 0,
    ratingHistory: [],
    tagFrequencies: [],
    heatmap: buildYearHeatmap(new Map(), nowMs),
    error: null,
  };

  try {
    const [infoRes, ratingRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encoded}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${encoded}`),
      fetch(`https://codeforces.com/api/user.status?handle=${encoded}&from=1&count=1500`),
    ]);

    const infoJson = (await infoRes.json()) as {
      status: string;
      comment?: string;
      result?: Array<{
        handle: string;
        rating?: number;
        maxRating?: number;
        rank?: string;
        maxRank?: string;
      }>;
    };

    if (infoJson.status !== "OK" || !infoJson.result?.[0]) {
      return {
        stats: { ...emptyStats, error: infoJson.comment ?? "Codeforces handle not found." },
        distinctSolves: [],
        activeDates: new Set(),
      };
    }

    const user = infoJson.result[0];
    const ratingJson = ratingRes.ok
      ? ((await ratingRes.json()) as {
          status: string;
          result?: Array<{
            contestId: number;
            contestName: string;
            rank: number;
            newRating: number;
            ratingUpdateTimeSeconds: number;
          }>;
        })
      : { status: "FAILED", result: [] };

    const ratingHistory: RatingPoint[] =
      ratingJson.status === "OK" && ratingJson.result
        ? ratingJson.result.map((r) => ({
            contestId: r.contestId,
            contestName: r.contestName,
            rank: r.rank,
            rating: r.newRating,
            date: formatDateUTC(new Date(r.ratingUpdateTimeSeconds * 1000)),
          }))
        : [];

    const highestContestRanking =
      ratingHistory.length > 0
        ? ratingHistory.reduce((best, r) => (r.rank < best ? r.rank : best), ratingHistory[0]!.rank)
        : null;

    const statusJson = statusRes.ok
      ? ((await statusRes.json()) as {
          status: string;
          result?: Array<{
            verdict?: string;
            creationTimeSeconds: number;
            problem: {
              contestId?: number;
              index: string;
              name: string;
              rating?: number;
              tags?: string[];
            };
          }>;
        })
      : { status: "FAILED", result: [] };

    const distinctMap = new Map<string, DistinctSolve>();
    if (statusJson.status === "OK" && statusJson.result) {
      // Walk oldest -> newest so each distinct problem records its first AC time
      const subs = [...statusJson.result].reverse();
      for (const sub of subs) {
        if (sub.verdict !== "OK") continue;
        const pid = `${sub.problem.contestId ?? "gym"}-${sub.problem.index}-${sub.problem.name}`;
        if (distinctMap.has(pid)) continue;
        distinctMap.set(pid, {
          id: pid,
          rating: sub.problem.rating ?? null,
          solvedAtSec: sub.creationTimeSeconds,
          tags: sub.problem.tags ?? [],
        });
      }
    }

    const distinctSolves = Array.from(distinctMap.values());
    const dayCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    const activeDates = new Set<string>();

    for (const s of distinctSolves) {
      const d = formatDateUTC(new Date(s.solvedAtSec * 1000));
      dayCounts.set(d, (dayCounts.get(d) ?? 0) + 1);
      activeDates.add(d);
      for (const t of s.tags) {
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
      }
    }

    const tagFrequencies: TagCount[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return {
      stats: {
        handle: user.handle,
        currentRating: user.rating ?? null,
        maxRating: user.maxRating ?? null,
        rank: user.rank ?? null,
        maxRank: user.maxRank ?? null,
        highestContestRanking,
        distinctSolvedCount: distinctSolves.length,
        ratingHistory,
        tagFrequencies,
        heatmap: buildYearHeatmap(dayCounts, nowMs),
        error: null,
      },
      distinctSolves,
      activeDates,
    };
  } catch {
    return {
      stats: { ...emptyStats, error: "Could not reach Codeforces right now. Try syncing again shortly." },
      distinctSolves: [],
      activeDates: new Set(),
    };
  }
}

async function fetchGithub(username: string, nowMs: number): Promise<{
  stats: GithubStats;
  activeDates: Set<string>;
  pushTimestampsSec: number[];
}> {
  const clean = username.trim();
  const encoded = encodeURIComponent(clean);
  const headers = {
    "User-Agent": "Codogotchi/1.0",
    Accept: "application/vnd.github+json",
  };
  const emptyStats: GithubStats = {
    username: clean,
    name: null,
    avatarUrl: null,
    bio: null,
    profileUrl: `https://github.com/${encoded}`,
    publicRepos: 0,
    followers: 0,
    totalPushes: 0,
    todayPushes: 0,
    mostPopularRepo: null,
    heatmap: buildYearHeatmap(new Map(), nowMs),
    heatmapSource: "events",
    error: null,
  };

  try {
    const [userRes, reposRes, eventsRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encoded}`, { headers }),
      fetch(`https://api.github.com/users/${encoded}/repos?per_page=100&sort=updated`, { headers }),
      fetch(`https://api.github.com/users/${encoded}/events/public?per_page=100`, { headers }),
      fetch(`https://github.com/users/${encoded}/contributions`, {
        headers: { "User-Agent": "Codogotchi/1.0", Accept: "text/html" },
      }).catch(() => null),
    ]);

    if (!userRes.ok) {
      return {
        stats: {
          ...emptyStats,
          error: userRes.status === 404 ? "GitHub username not found." : "GitHub rate limit reached; try again shortly.",
        },
        activeDates: new Set(),
        pushTimestampsSec: [],
      };
    }

    const user = (await userRes.json()) as {
      login: string;
      name: string | null;
      avatar_url: string | null;
      bio: string | null;
      html_url: string;
      public_repos: number;
      followers: number;
    };

    const repos = reposRes.ok
      ? ((await reposRes.json()) as Array<{
          name: string;
          description: string | null;
          stargazers_count: number;
          forks_count: number;
          language: string | null;
          html_url: string;
          fork: boolean;
        }>)
      : [];

    const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    const topRepo = sortedRepos[0];
    const mostPopularRepo: GithubPopularRepo | null = topRepo
      ? {
          name: topRepo.name,
          description: topRepo.description,
          stars: topRepo.stargazers_count,
          forks: topRepo.forks_count,
          language: topRepo.language,
          url: topRepo.html_url,
        }
      : null;

    const events = eventsRes.ok
      ? ((await eventsRes.json()) as Array<{ type: string; created_at: string }>)
      : [];

    const todayStr = formatDateUTC(new Date(nowMs));
    let todayPushes = 0;
    let eventPushes = 0;
    const eventDateCounts = new Map<string, number>();
    const activeDates = new Set<string>();
    const pushTimestampsSec: number[] = [];

    for (const ev of events) {
      if (ev.type !== "PushEvent") continue;
      eventPushes += 1;
      const ts = Math.floor(Date.parse(ev.created_at) / 1000);
      if (Number.isFinite(ts)) pushTimestampsSec.push(ts);
      const d = ev.created_at.slice(0, 10);
      eventDateCounts.set(d, (eventDateCounts.get(d) ?? 0) + 1);
      activeDates.add(d);
      if (d === todayStr) todayPushes += 1;
    }

    // Try parsing the full 365-day public contributions calendar
    let heatmap: HeatmapDay[] = buildYearHeatmap(eventDateCounts, nowMs);
    let heatmapSource: "contributions" | "events" = "events";
    let calendarContributionTotal = 0;

    if (contribRes && contribRes.ok) {
      const html = await contribRes.text();
      const parsedDays: HeatmapDay[] = [];
      const cellRe = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"/g;
      let m: RegExpExecArray | null;
      while ((m = cellRe.exec(html)) !== null) {
        const date = m[1]!;
        const level = Number(m[2]!) as 0 | 1 | 2 | 3 | 4;
        const estCount = level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : 10;
        if (level > 0) {
          activeDates.add(date);
          calendarContributionTotal += estCount;
        }
        parsedDays.push({ date, count: eventDateCounts.get(date) ?? estCount, level });
      }
      if (parsedDays.length >= 60) {
        parsedDays.sort((a, b) => a.date.localeCompare(b.date));
        heatmap = parsedDays.slice(-365);
        heatmapSource = "contributions";
      }
    }

    const totalPushes = Math.max(eventPushes, Math.round(calendarContributionTotal * 0.45));

    return {
      stats: {
        username: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        profileUrl: user.html_url,
        publicRepos: user.public_repos,
        followers: user.followers,
        totalPushes,
        todayPushes,
        mostPopularRepo,
        heatmap,
        heatmapSource,
        error: null,
      },
      activeDates,
      pushTimestampsSec,
    };
  } catch {
    return {
      stats: { ...emptyStats, error: "Could not reach GitHub right now. Try syncing again shortly." },
      activeDates: new Set(),
      pushTimestampsSec: [],
    };
  }
}

const baselineSchema = z.object({
  startedAtSec: z.number().int().nonnegative(),
  initialSolvedIds: z.array(z.string()).max(5000),
  initialGithubPushes: z.number().int().nonnegative(),
});

const syncInputSchema = z.object({
  codeforcesHandle: z.string().trim().max(64),
  githubHandle: z.string().trim().max(64),
  baseline: baselineSchema.nullable().optional(),
});

export const syncExternalProfile = createServerFn({ method: "POST" })
  .inputValidator((input) => syncInputSchema.parse(input))
  .handler(async ({ data }): Promise<SyncedProfileData> => {
    const nowMs = Date.now();
    const nowSec = Math.floor(nowMs / 1000);
    const [cfResult, ghResult] = await Promise.all([
      data.codeforcesHandle ? fetchCodeforces(data.codeforcesHandle, nowMs) : Promise.resolve(null),
      data.githubHandle ? fetchGithub(data.githubHandle, nowMs) : Promise.resolve(null),
    ]);

    // Count distinct active days in the last 14 days across both accounts
    const combinedActive = new Set<string>();
    const cutoffMs = nowMs - 14 * 86_400_000;
    const cutoffStr = formatDateUTC(new Date(cutoffMs));
    for (const d of cfResult?.activeDates ?? []) {
      if (d >= cutoffStr) combinedActive.add(d);
    }
    for (const d of ghResult?.activeDates ?? []) {
      if (d >= cutoffStr) combinedActive.add(d);
    }

    const distinctSolves = cfResult?.distinctSolves ?? [];
    const totalGithubPushes = ghResult?.stats.totalPushes ?? 0;

    // First-time link establishes a baseline snapshot so Codogotchi always starts at Level 0 & 0 coins.
    const baseline: SyncBaseline = data.baseline ?? {
      startedAtSec: nowSec,
      initialSolvedIds: distinctSolves.map((s) => s.id),
      initialGithubPushes: totalGithubPushes,
    };

    const eventPushesAfterStart = (ghResult?.pushTimestampsSec ?? []).filter(
      (ts) => ts >= baseline.startedAtSec,
    ).length;
    const deltaPushes = Math.max(0, totalGithubPushes - baseline.initialGithubPushes);
    const newGithubPushesSinceStart = data.baseline ? Math.max(eventPushesAfterStart, deltaPushes) : 0;

    const metrics = calculateBuddyMetrics({
      distinctSolves,
      totalGithubPushes,
      todayGithubPushes: ghResult?.stats.todayPushes ?? 0,
      newGithubPushesSinceStart,
      activeDaysLast14: combinedActive.size,
      baseline,
      nowMs,
    });

    return {
      syncedAt: new Date(nowMs).toISOString(),
      baseline,
      codeforces: cfResult?.stats ?? null,
      github: ghResult?.stats ?? null,
      metrics,
    };
  });