import type { HeatmapDay } from "@/lib/integrations.functions";

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3",
  4: "bg-heat-4",
};

interface ActivityHeatmapProps {
  days: HeatmapDay[];
  unitLabel: string;
  emptyNote?: string;
}

export function ActivityHeatmap({ days, unitLabel, emptyNote }: ActivityHeatmapProps) {
  if (days.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyNote ?? "No activity recorded yet."}</p>;
  }

  // Group into columns of 7 days (52-53 weeks)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalCount = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} ${unitLabel}`}
                  className={`size-[11px] rounded-[2px] ${LEVEL_CLASSES[day.level]} transition-transform hover:scale-125`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-mono">
          {totalCount.toLocaleString()} {unitLabel} in the last 12 months
        </span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <span key={lvl} className={`inline-block size-2.5 rounded-[2px] ${LEVEL_CLASSES[lvl]}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}