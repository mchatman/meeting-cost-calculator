"use client";

import { Meeting } from "@/lib/types";
import {
  calculateElapsedSeconds,
  formatDuration,
  formatCost,
} from "@/lib/cost-calculator";

interface MeetingReceiptProps {
  meeting: Meeting;
}

export function MeetingReceipt({ meeting }: MeetingReceiptProps) {
  const elapsed = calculateElapsedSeconds(meeting.startedAt, meeting.endedAt);
  const meetingDate = new Date(meeting.startedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative w-full max-w-md">
      {/* Decorative blob behind card */}
      <div
        className="blob blob-mauve absolute -right-12 -top-12 h-40 w-40 opacity-50"
        aria-hidden="true"
      />

      <div className="card-brand receipt-border relative overflow-hidden rounded-2xl border-2 bg-white p-6 sm:p-8">
        {/* Diagonal corner accent */}
        <div
          className="absolute -right-6 -top-6 h-20 w-20 rotate-45 bg-gradient-to-br from-mauve-pale to-pink/10"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative mb-6 text-center">
          <div className="mx-auto mb-3 w-16 accent-bar" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-navy/50">
            Meeting Receipt
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy">{meeting.title}</h2>
          <p className="mt-1 text-xs text-navy/55">{meetingDate}</p>
        </div>

        {/* Attendee line items */}
        <div className="space-y-0">
          {meeting.attendees.map((attendee, i) => {
            const attendeeCost = (attendee.hourlyRate / 3600) * elapsed;
            return (
              <div
                key={attendee.id}
                className={`flex justify-between py-2.5 text-sm ${
                  i < meeting.attendees.length - 1
                    ? "border-b border-dashed border-mauve-light/40"
                    : ""
                }`}
              >
                <span className="text-navy/70">{attendee.role}</span>
                <span className="cost-ticker font-mono text-navy/60">
                  {formatCost(attendeeCost)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Duration */}
        <div className="mt-4 flex justify-between rounded-lg bg-mauve-pale/40 px-4 py-2.5 text-sm">
          <span className="text-navy/60">Duration</span>
          <span className="cost-ticker font-mono font-medium text-navy/60">
            {formatDuration(elapsed)}
          </span>
        </div>

        {/* Total */}
        <div className="mt-5">
          <div className="accent-bar mb-4" />
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-navy/50">
              Total
            </span>
            <span className="cost-ticker text-brand-gradient text-3xl font-extrabold">
              {formatCost(meeting.totalCost ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
