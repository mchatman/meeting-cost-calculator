"use client";

import { DashboardMeeting } from "@/lib/types";
import { formatCost } from "@/lib/cost-calculator";
import { Badge } from "@/components/ui/badge";

interface DashboardMeetingListProps {
  meetings: DashboardMeeting[];
}

function formatTimeRange(start: Date, end: Date) {
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function relativeTime(date: Date): string {
  const diff = date.getTime() - Date.now();
  const mins = Math.round(diff / 60_000);
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  return `in ${hours}h ${mins % 60}m`;
}

function SourceIcon({ source }: { source: "google" | "zoom" }) {
  if (source === "google") {
    return (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  }
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#2D8CFF" />
      <path
        d="M7.5 9.2v5.6c0 .44.36.8.8.8h5.4l2.8 2.4v-2.4h.5c.44 0 .8-.36.8-.8V9.2c0-.44-.36-.8-.8-.8H8.3c-.44 0-.8.36-.8.8z"
        fill="white"
      />
    </svg>
  );
}

function MeetingRow({ meeting }: { meeting: DashboardMeeting }) {
  const isActive = meeting.status === "in-progress";
  const isEnded = meeting.status === "ended";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        isActive
          ? "border-pink/40 bg-pink/5"
          : "border-mauve-light/40 bg-white/60"
      }`}
    >
      {/* Time */}
      <div className="w-28 shrink-0 text-xs text-navy/50">
        {formatTimeRange(meeting.startTime, meeting.endTime)}
      </div>

      {/* Title + source */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-navy">
            {meeting.title}
          </span>
          <SourceIcon source={meeting.source} />
        </div>
      </div>

      {/* Attendee count */}
      <Badge
        variant="secondary"
        className="shrink-0 border-mauve-light/50 bg-mauve-pale/40 text-[10px] text-navy/60"
      >
        {meeting.attendeeCount}
      </Badge>

      {/* Status / cost */}
      <div className="w-24 shrink-0 text-right">
        {isActive && (
          <div className="flex items-center justify-end gap-1.5">
            <span className="pulse-dot !size-2" />
            <span className="cost-ticker text-sm font-semibold text-pink">
              {formatCost(meeting.accruedCost)}
            </span>
          </div>
        )}
        {meeting.status === "upcoming" && (
          <span className="text-xs text-navy/40">
            {relativeTime(meeting.startTime)}
          </span>
        )}
        {isEnded && (
          <div className="flex items-center justify-end gap-1.5">
            <svg
              className="size-3.5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="cost-ticker text-sm font-medium text-navy/60">
              {formatCost(meeting.accruedCost)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardMeetingList({ meetings }: DashboardMeetingListProps) {
  const inProgress = meetings.filter((m) => m.status === "in-progress");
  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const ended = meetings.filter((m) => m.status === "ended");

  const sorted = [...inProgress, ...upcoming, ...ended];

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-mauve-light/30 bg-mauve-pale/20 p-8 text-center">
        <p className="text-sm text-navy/50">No meetings today</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((meeting) => (
        <MeetingRow key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
