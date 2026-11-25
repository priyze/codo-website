import { useCallback, useEffect, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { getAccessoryById } from "./accessories";
import type { SyncedProfileData } from "./integrations.functions";
import type { SyncBaseline } from "./scoring";

export const STORAGE_KEY = "codogotchi_state_v2";
const LEGACY_STORAGE_KEY = "codo_desk_buddy_v1";

export interface BuddyState {
  onboarded: boolean;
  userName: string;
  buddyName: string;
  codeforcesHandle: string;
  githubHandle: string;
  ownedIds: string[];
  equippedEyesId: string | null;
  equippedMouthId: string | null;
  spentCoins: number;
  baseline: SyncBaseline | null;
  profileData: SyncedProfileData | null;
}

const DEFAULT_STATE: BuddyState = {
  onboarded: false,
  userName: "",
  buddyName: "",
  codeforcesHandle: "",
  githubHandle: "",
  ownedIds: [],
  equippedEyesId: null,
  equippedMouthId: null,
  spentCoins: 0,
  baseline: null,
  profileData: null,
};

function readStorage(): BuddyState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<BuddyState>;
    const baseline = parsed.baseline ?? parsed.profileData?.baseline ?? null;
    const migrated: BuddyState = {
      ...DEFAULT_STATE,
      ...parsed,
      ownedIds: Array.isArray(parsed.ownedIds) ? parsed.ownedIds : [],
      baseline,
    };
    // Legacy v1 state counted historical solves before baseline tracking existed — reset progression to 0
    if (!baseline && migrated.profileData) {
      migrated.spentCoins = 0;
      migrated.profileData = {
        ...migrated.profileData,
        metrics: {
          ...migrated.profileData.metrics,
          totalEarnedCoins: 0,
          coinsFromCf: 0,
          coinsFromGithub: 0,
          level: 0,
          levelProgress: 0,
          totalXp: 0,
          newSolvesCount: 0,
          newGithubPushesCount: 0,
          celebrateSeq: 0,
          difficultyGain: 0,
        },
      };
    }
    return migrated;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeStorage(next: BuddyState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
}

export function useBuddyStore() {
  const hydrated = useHydrated();
  const [state, setState] = useState<BuddyState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setState(readStorage());
    setReady(true);
  }, [hydrated]);

  const update = useCallback((updater: (prev: BuddyState) => BuddyState) => {
    setState((prev) => {
      const next = updater(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    (payload: {
      userName: string;
      buddyName: string;
      codeforcesHandle: string;
      githubHandle: string;
      starterIds: string[];
      profileData: SyncedProfileData | null;
    }) => {
      update((prev) => {
        let eyesId: string | null = null;
        let mouthId: string | null = null;
        for (const id of payload.starterIds) {
          const acc = getAccessoryById(id);
          if (acc?.slot === "eyes" && !eyesId) eyesId = acc.id;
          if (acc?.slot === "mouth" && !mouthId) mouthId = acc.id;
        }
        return {
          ...prev,
          onboarded: true,
          userName: payload.userName.trim(),
          buddyName: payload.buddyName.trim(),
          codeforcesHandle: payload.codeforcesHandle.trim(),
          githubHandle: payload.githubHandle.trim(),
          ownedIds: Array.from(new Set([...prev.ownedIds, ...payload.starterIds])),
          equippedEyesId: eyesId,
          equippedMouthId: mouthId,
          spentCoins: 0,
          baseline: payload.profileData?.baseline ?? null,
          profileData: payload.profileData,
        };
      });
    },
    [update],
  );

  const updateProfileSettings = useCallback(
    (payload: {
      userName: string;
      buddyName: string;
      codeforcesHandle: string;
      githubHandle: string;
      profileData: SyncedProfileData | null;
    }) => {
      update((prev) => {
        const nextCf = payload.codeforcesHandle.trim();
        const nextGh = payload.githubHandle.trim();
        const handlesChanged = nextCf !== prev.codeforcesHandle || nextGh !== prev.githubHandle;
        return {
          ...prev,
          userName: payload.userName.trim(),
          buddyName: payload.buddyName.trim(),
          codeforcesHandle: nextCf,
          githubHandle: nextGh,
          spentCoins: handlesChanged ? 0 : prev.spentCoins,
          baseline: handlesChanged
            ? payload.profileData?.baseline ?? null
            : prev.baseline ?? payload.profileData?.baseline ?? null,
          profileData: payload.profileData,
        };
      });
    },
    [update],
  );

  const setProfileData = useCallback(
    (profileData: SyncedProfileData) => {
      update((prev) => ({
        ...prev,
        baseline: prev.baseline ?? profileData.baseline,
        profileData,
      }));
    },
    [update],
  );

  const buyAccessory = useCallback(
    (accessoryId: string, price: number): boolean => {
      let purchased = false;
      update((prev) => {
        if (prev.ownedIds.includes(accessoryId)) return prev;
        const earned = prev.profileData?.metrics.totalEarnedCoins ?? 0;
        const balance = Math.max(0, earned - prev.spentCoins);
        if (balance < price) return prev;
        purchased = true;
        const acc = getAccessoryById(accessoryId);
        return {
          ...prev,
          ownedIds: [...prev.ownedIds, accessoryId],
          spentCoins: prev.spentCoins + price,
          equippedEyesId: acc?.slot === "eyes" ? accessoryId : prev.equippedEyesId,
          equippedMouthId: acc?.slot === "mouth" ? accessoryId : prev.equippedMouthId,
        };
      });
      return purchased;
    },
    [update],
  );

  const toggleEquip = useCallback(
    (accessoryId: string) => {
      const acc = getAccessoryById(accessoryId);
      if (!acc) return;
      update((prev) => {
        if (!prev.ownedIds.includes(accessoryId)) return prev;
        if (acc.slot === "eyes") {
          return { ...prev, equippedEyesId: prev.equippedEyesId === accessoryId ? null : accessoryId };
        }
        return { ...prev, equippedMouthId: prev.equippedMouthId === accessoryId ? null : accessoryId };
      });
    },
    [update],
  );

  const earnedCoins = state.profileData?.metrics.totalEarnedCoins ?? 0;
  const coinBalance = Math.max(0, earnedCoins - state.spentCoins);
  const level = state.profileData?.metrics.level ?? 0;
  const health = state.profileData?.metrics.health ?? 60;
  const mood = state.profileData?.metrics.mood ?? 1;

  return {
    ready,
    state,
    earnedCoins,
    coinBalance,
    level,
    health,
    mood,
    completeOnboarding,
    updateProfileSettings,
    setProfileData,
    buyAccessory,
    toggleEquip,
  };
}