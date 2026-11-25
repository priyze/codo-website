import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Coins, Eye, Lock, RefreshCw, Smile, X } from "lucide-react";
import { toast } from "sonner";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { OledAccessoryThumbnail, OledModule } from "@/components/OledPreview";
import { ShopHeader } from "@/components/ShopHeader";
import { Button } from "@/components/ui/button";
import { ACCESSORIES, getAccessoryById, type Accessory, type AccessorySlot } from "@/lib/accessories";
import { useBuddyStore } from "@/lib/buddy-store";
import { syncExternalProfile } from "@/lib/integrations.functions";
import { MAX_LEVEL, moodLabelFromLevel } from "@/lib/scoring";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Codo — Desk Buddy Accessory Shop" },
      {
        name: "description",
        content: "Shop 0.96 inch OLED eye and mouth accessories for your ESP32 desk buddy using CodoCoins earned from Codeforces and GitHub.",
      },
      { property: "og:title", content: "Codo — Desk Buddy Accessory Shop" },
      {
        property: "og:description",
        content: "Shop 0.96 inch OLED eye and mouth accessories for your ESP32 desk buddy using CodoCoins earned from Codeforces and GitHub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const {
    ready,
    state,
    coinBalance,
    level,
    health,
    mood,
    completeOnboarding,
    setProfileData,
    buyAccessory,
    toggleEquip,
  } = useBuddyStore();

  const [slotFilter, setSlotFilter] = useState<"all" | AccessorySlot>("all");
  const [previewAccessory, setPreviewAccessory] = useState<Accessory | null>(null);
  const [celebrateTick, setCelebrateTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const runSync = useServerFn(syncExternalProfile);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!state.onboarded) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  const visibleAccessories =
    slotFilter === "all" ? ACCESSORIES : ACCESSORIES.filter((a) => a.slot === slotFilter);

  const activeEyesId =
    previewAccessory?.slot === "eyes" ? previewAccessory.id : state.equippedEyesId;
  const activeMouthId =
    previewAccessory?.slot === "mouth" ? previewAccessory.id : state.equippedMouthId;

  const equippedEyes = getAccessoryById(state.equippedEyesId);
  const equippedMouth = getAccessoryById(state.equippedMouthId);
  const levelProgress = state.profileData?.metrics.levelProgress ?? 0;

  const handleRefreshSync = async () => {
    if (!state.codeforcesHandle && !state.githubHandle) {
      toast.error("Add your Codeforces or GitHub handle in Profile to sync.");
      return;
    }
    setSyncing(true);
    try {
      const res = await runSync({
        data: {
          codeforcesHandle: state.codeforcesHandle,
          githubHandle: state.githubHandle,
        },
      });
      setProfileData(res);
      setCelebrateTick((n) => n + 1);
      toast.success(`Synced! ${res.metrics.totalEarnedCoins.toLocaleString()} lifetime codocoins.`);
    } catch {
      toast.error("Sync failed — please try again in a moment.");
    } finally {
      setSyncing(false);
    }
  };

  const handlePurchase = (acc: Accessory) => {
    if (level < acc.unlockLevel) {
      toast.error(`Reach Level ${acc.unlockLevel} to unlock ${acc.name}.`);
      return;
    }
    if (coinBalance < acc.price) {
      toast.error(`Need ${acc.price - coinBalance} more codocoins for ${acc.name}.`);
      return;
    }
    const ok = buyAccessory(acc.id, acc.price);
    if (ok) {
      setPreviewAccessory(null);
      setCelebrateTick((n) => n + 1);
      toast.success(`Equipped ${acc.name} on ${state.buddyName}!`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShopHeader
        userName={state.userName}
        buddyName={state.buddyName}
        coinBalance={coinBalance}
        level={level}
        avatarUrl={state.profileData?.github?.avatarUrl ?? null}
        activePage="shop"
      />

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="space-y-4 lg:sticky lg:top-20">
          <OledModule
            buddyName={state.buddyName}
            mood={mood}
            health={health}
            eyesAccessoryId={activeEyesId}
            mouthAccessoryId={activeMouthId}
            celebrateTick={celebrateTick}
          />

          {previewAccessory && (
            <div className="flex items-center justify-between rounded-xl border border-primary/50 bg-primary/10 px-3.5 py-2 text-xs">
              <span>
                Previewing <strong className="text-primary">{previewAccessory.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setPreviewAccessory(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear preview"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">{state.buddyName}&apos;s Vitals</h2>
                <p className="text-xs text-muted-foreground">Mood: {moodLabelFromLevel(mood)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshSync}
                disabled={syncing}
                className="h-8 rounded-full px-3 text-xs"
              >
                <RefreshCw className={`mr-1.5 size-3 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Health</span>
                <span className="text-health">{health} / 100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-health transition-all" style={{ width: `${health}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Level</span>
                <span className="text-lavender">
                  Lv {level} / {MAX_LEVEL}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-lavender transition-all"
                  style={{ width: `${level >= MAX_LEVEL ? 100 : Math.max(8, levelProgress)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => equippedEyes && toggleEquip(equippedEyes.id)}
                disabled={!equippedEyes}
                className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2 text-left text-xs disabled:opacity-60"
              >
                <span className="truncate">
                  <span className="block font-mono text-[10px] text-muted-foreground uppercase">Eyes</span>
                  {equippedEyes?.name ?? "None"}
                </span>
                {equippedEyes && <X className="size-3 shrink-0 text-muted-foreground" />}
              </button>
              <button
                type="button"
                onClick={() => equippedMouth && toggleEquip(equippedMouth.id)}
                disabled={!equippedMouth}
                className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2 text-left text-xs disabled:opacity-60"
              >
                <span className="truncate">
                  <span className="block font-mono text-[10px] text-muted-foreground uppercase">Mouth</span>
                  {equippedMouth?.name ?? "None"}
                </span>
                {equippedMouth && <X className="size-3 shrink-0 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Accessory Shop</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                128×64 OLED eye &amp; mouth gear unlocked as {state.buddyName} levels up to 50.
              </p>
            </div>

            <div className="flex rounded-full border border-border bg-card p-1 text-xs">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "eyes", label: "Eyes", icon: Eye },
                  { key: "mouth", label: "Mouth & Cheeks", icon: Smile },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSlotFilter(tab.key)}
                  className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                    slotFilter === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleAccessories.map((acc) => {
              const owned = state.ownedIds.includes(acc.id);
              const equipped =
                state.equippedEyesId === acc.id || state.equippedMouthId === acc.id;
              const locked = !owned && level < acc.unlockLevel;
              const canAfford = coinBalance >= acc.price;

              return (
                <article
                  key={acc.id}
                  onMouseEnter={() => setPreviewAccessory(acc)}
                  onMouseLeave={() => setPreviewAccessory((cur) => (cur?.id === acc.id ? null : cur))}
                  className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
                    equipped
                      ? "border-primary bg-card ring-1 ring-primary/40"
                      : "border-border bg-card hover:border-lavender/70"
                  }`}
                >
                  <div>
                    <OledAccessoryThumbnail accessoryId={acc.id} />
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{acc.name}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                          locked
                            ? "bg-muted text-muted-foreground"
                            : "bg-lavender/15 text-lavender"
                        }`}
                      >
                        Lv {acc.unlockLevel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{acc.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                    {owned ? (
                      <span className="font-mono text-xs text-health">Owned</span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-xs font-medium text-coin">
                        <Coins className="size-3.5" />
                        {acc.price}
                      </span>
                    )}

                    {owned ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={equipped ? "secondary" : "default"}
                        onClick={() => toggleEquip(acc.id)}
                        className="h-8 rounded-full px-3.5 text-xs"
                      >
                        {equipped ? (
                          <>
                            <Check className="mr-1 size-3.5" />
                            Equipped
                          </>
                        ) : (
                          "Equip"
                        )}
                      </Button>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <Lock className="size-3" />
                        Lv {acc.unlockLevel}
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handlePurchase(acc)}
                        className="h-8 rounded-full px-3.5 text-xs"
                      >
                        {canAfford ? "Buy" : "Need coins"}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
