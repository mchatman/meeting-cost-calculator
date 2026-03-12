"use client";

import { DashboardMeeting } from "@/lib/types";
import { formatCost, formatDuration } from "@/lib/cost-calculator";
import { CostDisplay } from "@/components/cost-display";

interface ActiveMeetingHeroProps {
  meeting: DashboardMeeting;
  currentCost: number;
  elapsed: number;
}

export function ActiveMeetingHero({
  meeting,
  currentCost,
  elapsed,
}: ActiveMeetingHeroProps) {
  const endsAt = meeting.endTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-pink/20 bg-gradient-to-br from-white to-pink/5 p-6 sm:p-8">
      <div className="accent-bar mb-6" />

      {/* Title + status */}
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">
          {meeting.title}
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-pink/10 px-4 py-1.5">
          <span className="pulse-dot" />
          <span className="text-xs font-semibold uppercase tracking-wider text-pink">
            Live
          </span>
        </div>
      </div>

      {/* Cost display */}
      <div className="flex justify-center py-4">
        <CostDisplay cost={currentCost} />
      </div>

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-navy/60">
        <span className="cost-ticker font-mono font-medium">
          {formatDuration(elapsed)}
        </span>
        <span className="text-mauve-light">·</span>
        <span>
          {meeting.attendeeCount} attendee
          {meeting.attendeeCount !== 1 ? "s" : ""}
        </span>
        <span className="text-mauve-light">·</span>
        <span>Ends at {endsAt}</span>
        <span className="text-mauve-light">·</span>
        <span className="cost-ticker font-semibold text-pink">
          {formatCost(meeting.costPerSecond * 60)}/min
        </span>
      </div>
    </div>
  );
}
