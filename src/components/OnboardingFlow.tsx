import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STARTER_ACCESSORIES } from "@/lib/accessories";
import { syncExternalProfile, type SyncedProfileData } from "@/lib/integrations.functions";
import { playCelebrateChirp, playHelloChime } from "@/lib/sound";
import { OledAccessoryThumbnail, OledModule } from "./OledPreview";

interface OnboardingFlowProps {
  onComplete: (payload: {
    userName: string;
    buddyName: string;
    codeforcesHandle: string;
    githubHandle: string;
    starterIds: string[];
    profileData: SyncedProfileData | null;
  }) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [userName, setUserName] = useState("");
  const [buddyName, setBuddyName] = useState("");
  const [cfHandle, setCfHandle] = useState("");
  const [ghHandle, setGhHandle] = useState("");
  const [selectedStarterId, setSelectedStarterId] = useState<string>(STARTER_ACCESSORIES[0]?.id ?? "pixel-shades");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedData, setSyncedData] = useState<SyncedProfileData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const runSync = useServerFn(syncExternalProfile);

  const handleStart = () => {
    playHelloChime();
    setStep(1);
  };

  const handleNamesNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !buddyName.trim()) {
      setFormError("Please enter both your name and your desk buddy's name.");
      return;
    }
    setFormError(null);
    setStep(2);
  };

  const handleAccountsNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const cf = cfHandle.trim();
    const gh = ghHandle.trim();
    if (!cf && !gh) {
      setSyncError("Enter at least your Codeforces handle or GitHub username to link your buddy.");
      return;
    }
    setSyncError(null);
    setSyncing(true);
    try {
      const res = await runSync({ data: { codeforcesHandle: cf, githubHandle: gh } });
      setSyncedData(res);
      const errParts = [res.codeforces?.error, res.github?.error].filter(Boolean);
      if (errParts.length > 0 && res.metrics.totalEarnedCoins === 0 && !res.github?.avatarUrl && !res.codeforces?.rank) {
        setSyncError(errParts.join(" "));
        setSyncing(false);
        return;
      }
      setSyncing(false);
      setStep(3);
    } catch {
      setSyncError("Could not reach the sync service right now. You can retry or continue anyway.");
      setSyncing(false);
    }
  };

  const handleFinish = () => {
    playCelebrateChirp();
    onComplete({
      userName: userName.trim(),
      buddyName: buddyName.trim(),
      codeforcesHandle: cfHandle.trim(),
      githubHandle: ghHandle.trim(),
      starterIds: selectedStarterId ? [selectedStarterId] : [],
      profileData: syncedData,
    });
  };

  const selectedAccessory = STARTER_ACCESSORIES.find((a) => a.id === selectedStarterId);
  const previewEyes = selectedAccessory?.slot === "eyes" ? selectedAccessory.id : null;
  const previewMouth = selectedAccessory?.slot === "mouth" ? selectedAccessory.id : null;

  if (step === 0) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
        <div
          aria-hidden
          className="animate-hello-glow pointer-events-none absolute size-[420px] rounded-full bg-primary/15 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 size-[360px] rounded-full bg-health/12 blur-[110px]"
        />

        <div className="animate-hello relative z-10 flex max-w-md flex-col items-center">
          <p className="mb-4 font-mono text-xs tracking-[0.28em] text-muted-foreground uppercase">
            codo desk buddy
          </p>
          <h1 className="font-display text-8xl italic tracking-tight text-foreground sm:text-9xl">
            hello
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Meet your ESP32 coding companion. Link your Codeforces and GitHub to unlock accessories for its 0.96&quot; OLED face.
          </p>
          <Button onClick={handleStart} size="lg" className="mt-10 rounded-full px-8 font-medium">
            Set up your buddy
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNamesNext} className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Who&apos;s coding together?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Give your desk buddy a name before pairing it with your accounts.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-name">Your name</Label>
                <Input
                  id="user-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Priyanka"
                  maxLength={40}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buddy-name">Desk buddy&apos;s name</Label>
                <Input
                  id="buddy-name"
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  placeholder="e.g. Bit"
                  maxLength={32}
                />
              </div>
            </div>

            <div className="mx-auto max-w-xs">
              <OledModule
                buddyName={buddyName || "Your Buddy"}
                mood={2}
                health={85}
                eyesAccessoryId={null}
                mouthAccessoryId={null}
                compact
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex justify-end">
              <Button type="submit" className="rounded-full px-6">
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAccountsNext} className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Connect Codeforces &amp; GitHub
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Distinct solves and pushes power {buddyName}&apos;s mood, health, level, and CodoCoins balance.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cf-handle">Codeforces handle</Label>
                <Input
                  id="cf-handle"
                  value={cfHandle}
                  onChange={(e) => setCfHandle(e.target.value)}
                  placeholder="e.g. tourist"
                  maxLength={48}
                  autoFocus
                />
                <p className="font-mono text-[11px] text-muted-foreground">
                  &lt;1100: 10 · &lt;1500: 20 · 1500+: 30 coins
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gh-handle">GitHub username</Label>
                <Input
                  id="gh-handle"
                  value={ghHandle}
                  onChange={(e) => setGhHandle(e.target.value)}
                  placeholder="e.g. octocat"
                  maxLength={48}
                />
                <p className="font-mono text-[11px] text-muted-foreground">Each push: 15 codocoins</p>
              </div>
            </div>

            {syncError && <p className="text-sm text-destructive">{syncError}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                {syncError && (
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>
                    Continue anyway
                  </Button>
                )}
                <Button type="submit" disabled={syncing} className="rounded-full px-6">
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Syncing accounts…
                    </>
                  ) : (
                    <>
                      Link &amp; Sync
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Pick {buddyName}&apos;s starter look
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Choose one complimentary basic accessory right off the bat. Everything renders live at 128×64.
                </p>
              </div>
              {syncedData && (
                <div className="rounded-xl border border-coin/35 bg-background px-3 py-2 text-right font-mono text-xs">
                  <div className="text-coin">{syncedData.metrics.totalEarnedCoins.toLocaleString()} codocoins</div>
                  <div className="text-lavender">Lv {syncedData.metrics.level} / 50</div>
                </div>
              )}
            </div>

            <div className="mx-auto max-w-sm">
              <OledModule
                buddyName={buddyName}
                mood={syncedData?.metrics.mood ?? 2}
                health={syncedData?.metrics.health ?? 80}
                eyesAccessoryId={previewEyes}
                mouthAccessoryId={previewMouth}
                compact
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STARTER_ACCESSORIES.map((acc) => {
                const active = selectedStarterId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedStarterId(acc.id)}
                    className={`group rounded-xl border p-2.5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-background/60 hover:border-lavender/70"
                    }`}
                  >
                    <OledAccessoryThumbnail accessoryId={acc.id} />
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-medium text-foreground">{acc.name}</span>
                      {active && <Check className="size-3.5 shrink-0 text-primary" />}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{acc.slot}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" onClick={handleFinish} className="rounded-full px-6">
                <Sparkles className="mr-2 size-4" />
                Enter the Shop
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}