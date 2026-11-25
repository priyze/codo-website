import { Link } from "@tanstack/react-router";
import { Coins, User, ArrowLeft } from "lucide-react";
import { MAX_LEVEL } from "@/lib/scoring";

interface ShopHeaderProps {
  userName: string;
  buddyName: string;
  coinBalance: number;
  level: number;
  avatarUrl: string | null;
  activePage: "shop" | "profile";
}

export function ShopHeader({
  userName,
  buddyName,
  coinBalance,
  level,
  avatarUrl,
  activePage,
}: ShopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-foreground">codo</div>
              <div className="font-mono text-[11px] text-muted-foreground">{buddyName || "desk buddy"}</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-coin/35 bg-card px-3 py-1.5 font-mono text-xs font-medium text-coin">
            <Coins className="size-3.5" />
            <span>{coinBalance.toLocaleString()}</span>
            <span className="hidden text-muted-foreground sm:inline">codocoins</span>
          </div>

          <div className="hidden items-center gap-1.5 rounded-full border border-lavender/35 bg-card px-3 py-1.5 font-mono text-xs text-lavender sm:flex">
            <span>Lv {level}</span>
            <span className="text-muted-foreground">/ {MAX_LEVEL}</span>
          </div>

          {activePage === "shop" ? (
            <Link
              to="/profile"
              aria-label="Open profile"
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-xs font-medium text-foreground transition-colors hover:border-primary/70"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName || "Profile"} className="size-7 rounded-full object-cover" />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground">
                  <User className="size-3.5" />
                </span>
              )}
              <span className="max-w-24 truncate">{userName || "Profile"}</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/70"
            >
              <ArrowLeft className="size-3.5" />
              Shop
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}