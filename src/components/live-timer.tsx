"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Meeting } from "@/lib/types";
import {
  calculateCostPerSecond,
  calculateElapsedSeconds,
  formatDuration,
  formatCost,
} from "@/lib/cost-calculator";
import { CostDisplay } from "@/components/cost-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LiveTimerProps {
  meeting: Meeting;
  onEnd: (totalCost: number) => void;
}

export function LiveTimer({ meeting, onEnd }: LiveTimerProps) {
  const [currentCost, setCurrentCost] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const costPerSecond = calculateCostPerSecond(meeting.attendees);

  const tick = useCallback(() => {
    const seconds = calculateElapsedSeconds(meeting.startedAt);
    setElapsed(seconds);
    setCurrentCost(costPerSecond * seconds);
    rafRef.current = requestAnimationFrame(tick);
  }, [meeting.startedAt, costPerSecond]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  function handleEnd() {
    cancelAnimationFrame(rafRef.current);
    onEnd(currentCost);
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background blobs */}
      <div
        className="blob blob-mauve absolute -left-20 top-0 h-60 w-60 sm:h-80 sm:w-80"
        aria-hidden="true"
      />
      <div
        className="blob blob-pink absolute -right-16 top-20 h-48 w-48 sm:h-64 sm:w-64"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5">
        {/* Title + status bar */}
        <div className="animate-fade-in-up mb-8 flex flex-col items-center gap-2 text-center sm:mb-12">
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">
            {meeting.title}
          </h1>
          <div className="flex items-center gap-2 rounded-full bg-pink/10 px-4 py-1.5">
            <span className="pulse-dot" />
            <span className="text-xs font-semibold uppercase tracking-wider text-pink">
              Live
            </span>
          </div>
        </div>

        {/* Central cost display with rings */}
        <div className="animate-fade-in-up animate-delay-1 flex justify-center py-6 sm:py-10">
          <CostDisplay cost={currentCost} />
        </div>

        {/* Elapsed time + End button — centered together */}
        <div className="animate-fade-in-up animate-delay-2 mb-10 flex flex-col items-center gap-3 sm:mb-14">
          <div className="cost-ticker inline-flex items-center gap-3 rounded-full border border-mauve-light/50 bg-white/80 px-6 py-2.5 font-mono text-xl font-medium text-navy/60 shadow-sm backdrop-blur-sm">
            {formatDuration(elapsed)}
          </div>
          <Button
            size="sm"
            className="hover-lift rounded-full bg-pink px-6 text-sm font-semibold text-white shadow-md hover:bg-pink/80"
            onClick={handleEnd}
          >
            End Meeting
          </Button>
        </div>

        {/* Attendee chips */}
        <div className="animate-fade-in-up animate-delay-3 mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-mauve-light/40 bg-white/60 p-4 backdrop-blur-sm">
            {meeting.attendees.map((attendee) => (
              <Badge
                key={attendee.id}
                variant="secondary"
                className="border border-mauve-light/50 bg-mauve-pale/60 px-3 py-1.5 text-xs text-navy/70"
              >
                {attendee.role}
                <span className="ml-1.5 font-mono text-navy/55">
                  {formatCost(attendee.hourlyRate)}/hr
                </span>
              </Badge>
            ))}
            <div className="flex items-center gap-1.5 px-2 text-xs text-navy/55">
              <span className="cost-ticker font-semibold text-pink">
                {formatCost(costPerSecond * 60)}/min
              </span>
              burn rate
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
