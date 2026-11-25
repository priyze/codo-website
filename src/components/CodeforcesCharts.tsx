import { ClientOnly } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RatingPoint, TagCount } from "@/lib/integrations.functions";

export function CodeforcesRatingChart({ history }: { history: RatingPoint[] }) {
  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No rated Codeforces contests found for this handle yet.
      </p>
    );
  }

  const ratings = history.map((h) => h.rating);
  const minR = Math.max(0, Math.floor((Math.min(...ratings) - 120) / 100) * 100);
  const maxR = Math.ceil((Math.max(...ratings) + 120) / 100) * 100;

  return (
    <ClientOnly fallback={<div className="h-60 w-full rounded-xl bg-muted/40" />}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="cfRatingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
            />
            <YAxis
              domain={[minR, maxR]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0]?.payload as RatingPoint | undefined;
                if (!pt) return null;
                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                    <div className="font-medium text-foreground">{pt.contestName}</div>
                    <div className="mt-1 flex items-center gap-3 font-mono text-muted-foreground">
                      <span className="text-primary">Rating {pt.rating}</span>
                      <span>Rank #{pt.rank}</span>
                      <span>{pt.date}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="var(--color-primary)"
              strokeWidth={2.2}
              fill="url(#cfRatingFill)"
              isAnimationActive={false}
              activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

export function ProblemCategoriesList({ tags }: { tags: TagCount[] }) {
  if (tags.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No solved problem categories found yet.
      </p>
    );
  }

  const maxCount = Math.max(1, tags[0]?.count ?? 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tags.map((item) => {
        const pct = Math.max(6, Math.round((item.count / maxCount) * 100));
        return (
          <div key={item.tag} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium text-foreground">{item.tag}</span>
              <span className="font-mono text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-lavender transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}