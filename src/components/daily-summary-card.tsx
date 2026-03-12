"use client";

import { DashboardMeeting } from "@/lib/types";
import { formatCost } from "@/lib/cost-calculator";
import { Card, CardContent } from "@/components/ui/card";

interface DailySummaryCardProps {
  meetings: DashboardMeeting[];
}

export function DailySummaryCard({ meetings }: DailySummaryCardProps) {
  const totalCost = meetings.reduce((sum, m) => sum + m.accruedCost, 0);
  const totalMinutes = meetings.reduce((sum, m) => {
    const now = new Date();
    const end = m.status === "ended" ? m.endTime : m.status === "in-progress" ? now : m.startTime;
    const start = m.startTime;
    return sum + Math.max(0, (end.getTime() - start.getTime()) / 60_000);
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  return (
    <Card className="card-brand overflow-hidden bg-white">
      <div className="accent-bar" />
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/50">
          Today&apos;s Cost
        </p>
        <p className="cost-ticker text-brand-gradient mt-1 text-3xl font-extrabold tracking-tight">
          {formatCost(totalCost)}
        </p>
        <p className="mt-2 text-xs text-navy/50">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""}
          {totalMinutes > 0 && (
            <>
              {" · "}
              {hours > 0 && `${hours}h `}
              {mins}m
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
