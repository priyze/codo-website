import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, GitFork, Loader2, RefreshCw, Star, User } from "lucide-react";
import { toast } from "sonner";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { CodeforcesRatingChart, ProblemCategoriesList } from "@/components/CodeforcesCharts";
import { ShopHeader } from "@/components/ShopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBuddyStore } from "@/lib/buddy-store";
import { syncExternalProfile } from "@/lib/integrations.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Stats — Codo Desk Buddy" },
      {
        name: "description",
        content: "Manage your desk buddy settings and inspect live Codeforces rating history, problem categories, and GitHub activity heatmaps.",
      },
      { property: "og:title", content: "Profile & Stats — Codo Desk Buddy" },
      {
        property: "og:description",
        content: "Manage your desk buddy settings and inspect live Codeforces rating history, problem categories, and GitHub activity heatmaps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { ready, state, coinBalance, level, updateProfileSettings } = useBuddyStore();
  const runSync = useServerFn(syncExternalProfile);

  const [userName, setUserName] = useState("");
  const [buddyName, setBuddyName] = useState("");
  const [cfHandle, setCfHandle] = useState("");
  const [ghHandle, setGhHandle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setUserName(state.userName);
    setBuddyName(state.buddyName);
    setCfHandle(state.codeforcesHandle);
    setGhHandle(state.githubHandle);
  }, [ready, state.userName, state.buddyName, state.codeforcesHandle, state.githubHandle]);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  const cf = state.profileData?.codeforces ?? null;
  const gh = state.profileData?.github ?? null;
  const metrics = state.profileData?.metrics ?? null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !buddyName.trim()) {
      toast.error("Your name and desk buddy's name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const synced =
        cfHandle.trim() || ghHandle.trim()
          ? await runSync({
              data: {
                codeforcesHandle: cfHandle.trim(),
                githubHandle: ghHandle.trim(),
              },
            })
          : null;

      updateProfileSettings({
        userName: userName.trim(),
        buddyName: buddyName.trim(),
        codeforcesHandle: cfHandle.trim(),
        githubHandle: ghHandle.trim(),
        profileData: synced,
      });

      const warns = [synced?.codeforces?.error, synced?.github?.error].filter(Boolean);
      if (warns.length > 0) {
        toast.warning(`Saved settings. Note: ${warns.join(" ")}`);
      } else {
        toast.success("Profile updated and stats synced.");
      }
    } catch {
      toast.error("Could not sync external stats right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShopHeader
        userName={state.userName}
        buddyName={state.buddyName}
        coinBalance={coinBalance}
        level={level}
        avatarUrl={gh?.avatarUrl ?? null}
        activePage="profile"
      />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* Identity + Editable Account Settings */}
        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {gh?.avatarUrl ? (
                  <img
                    src={gh.avatarUrl}
                    alt={gh.username}
                    className="size-16 rounded-2xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <User className="size-7" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold">{state.userName || "Coder"}</h1>
                  {gh?.username && (
                    <a
                      href={gh.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                    >
                      @{gh.username}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h2 className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">About Me</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                  {gh?.bio || "No GitHub bio set on this account yet."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 font-mono text-xs">
              <div>
                <div className="text-muted-foreground">Public Repos</div>
                <div className="mt-0.5 text-base font-semibold text-foreground">{gh?.publicRepos ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Followers</div>
                <div className="mt-0.5 text-base font-semibold text-foreground">{gh?.followers ?? "—"}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">Profile &amp; Buddy Settings</h2>
                <p className="text-xs text-muted-foreground">
                  Update your names or linked Codeforces and GitHub handles anytime.
                </p>
              </div>
              <Button type="submit" disabled={saving} className="rounded-full px-5">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Syncing…
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 size-3.5" />
                    Save &amp; Sync
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-user-name">Your name</Label>
                <Input
                  id="edit-user-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-buddy-name">Desk buddy&apos;s name</Label>
                <Input
                  id="edit-buddy-name"
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  maxLength={32}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-cf-handle">Codeforces handle</Label>
                <Input
                  id="edit-cf-handle"
                  value={cfHandle}
                  onChange={(e) => setCfHandle(e.target.value)}
                  placeholder="Codeforces username"
                  maxLength={48}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-gh-handle">GitHub username</Label>
                <Input
                  id="edit-gh-handle"
                  value={ghHandle}
                  onChange={(e) => setGhHandle(e.target.value)}
                  placeholder="GitHub username"
                  maxLength={48}
                />
              </div>
            </div>

            {metrics && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border/70 bg-background/70 px-4 py-2.5 font-mono text-xs text-muted-foreground">
                <span>
                  CF coins: <strong className="text-coin">{metrics.coinsFromCf.toLocaleString()}</strong>
                </span>
                <span>
                  GitHub coins: <strong className="text-coin">{metrics.coinsFromGithub.toLocaleString()}</strong>
                </span>
                <span>
                  Difficulty gain: <strong className="text-lavender">+{metrics.difficultyGain}</strong>
                </span>
              </div>
            )}
          </form>
        </section>

        {/* Codeforces Analytics */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Codeforces</h2>
            {cf?.handle && (
              <a
                href={`https://codeforces.com/profile/${encodeURIComponent(cf.handle)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
              >
                {cf.handle}
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {cf?.error && <p className="text-sm text-destructive">{cf.error}</p>}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase">Current Contest Rating</div>
              <div className="mt-2 font-mono text-3xl font-semibold text-primary">
                {cf?.currentRating ?? "—"}
              </div>
              <div className="mt-1 text-xs capitalize text-muted-foreground">{cf?.rank ?? "Unrated"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase">Max Contest Rating</div>
              <div className="mt-2 font-mono text-3xl font-semibold text-lavender">
                {cf?.maxRating ?? "—"}
              </div>
              <div className="mt-1 text-xs capitalize text-muted-foreground">{cf?.maxRank ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase">Highest Contest Ranking</div>
              <div className="mt-2 font-mono text-3xl font-semibold text-coin">
                {cf?.highestContestRanking != null ? `#${cf.highestContestRanking}` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Best placement across rated rounds</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="font-mono text-[11px] text-muted-foreground uppercase">Distinct Problems Solved</div>
              <div className="mt-2 font-mono text-3xl font-semibold text-health">
                {cf?.distinctSolvedCount ?? 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Unique accepted submissions</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Rating Graph</h3>
            <CodeforcesRatingChart history={cf?.ratingHistory ?? []} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Problems Solved Heatmap</h3>
            <ActivityHeatmap
              days={cf?.heatmap ?? []}
              unitLabel="problems solved"
              emptyNote="Link a Codeforces handle to see your solve heatmap."
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Categories of Problems Solved</h3>
            <ProblemCategoriesList tags={cf?.tagFrequencies ?? []} />
          </div>
        </section>

        {/* GitHub Analytics */}
        <section className="space-y-5 pb-8">
          <h2 className="text-2xl font-semibold tracking-tight">GitHub</h2>
          {gh?.error && <p className="text-sm text-destructive">{gh.error}</p>}

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[11px] text-muted-foreground uppercase">Most Popular Repository</div>
            {gh?.mostPopularRepo ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl space-y-1.5">
                  <a
                    href={gh.mostPopularRepo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-lg font-semibold text-primary hover:underline"
                  >
                    {gh.mostPopularRepo.name}
                    <ExternalLink className="size-4" />
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {gh.mostPopularRepo.description || "No repository description provided."}
                  </p>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs">
                  {gh.mostPopularRepo.language && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      {gh.mostPopularRepo.language}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-coin">
                    <Star className="size-3.5" />
                    {gh.mostPopularRepo.stars.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <GitFork className="size-3.5" />
                    {gh.mostPopularRepo.forks.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Link a GitHub username with public repositories to display your top repo.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">GitHub Activity Heatmap</h3>
              {gh && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {gh.heatmapSource === "contributions"
                    ? "12-month public contributions"
                    : "Recent public push events"}
                </span>
              )}
            </div>
            <ActivityHeatmap
              days={gh?.heatmap ?? []}
              unitLabel="contributions"
              emptyNote="Link a GitHub username to view your contribution heatmap."
            />
          </div>
        </section>
      </main>
    </div>
  );
}