"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardMeeting } from "@/lib/types";

export function useMeetingAutoTracker(meetings: DashboardMeeting[]) {
  const [activeMeeting, setActiveMeeting] = useState<DashboardMeeting | null>(
    null
  );
  const [currentCost, setCurrentCost] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const tick = useCallback(() => {
    if (!activeMeeting) return;

    const now = Date.now();
    const start = activeMeeting.startTime.getTime();
    const end = activeMeeting.endTime.getTime();

    if (now >= end) {
      // Meeting ended
      const totalSeconds = (end - start) / 1000;
      setCurrentCost(activeMeeting.costPerSecond * totalSeconds);
      setElapsed(totalSeconds);
      setActiveMeeting(null);
      return;
    }

    const seconds = (now - start) / 1000;
    setElapsed(seconds);
    setCurrentCost(activeMeeting.costPerSecond * seconds);
    rafRef.current = requestAnimationFrame(tick);
  }, [activeMeeting]);

  // Scan for active meetings every 10s
  useEffect(() => {
    function scan() {
      const now = new Date();
      const active = meetings.find(
        (m) => m.startTime <= now && now < m.endTime
      );
      setActiveMeeting((prev) => {
        if (active?.id === prev?.id) return prev;
        return active ?? null;
      });
    }

    scan();
    checkIntervalRef.current = setInterval(scan, 10_000);
    return () => clearInterval(checkIntervalRef.current);
  }, [meetings]);

  // rAF loop for active meeting
  useEffect(() => {
    if (!activeMeeting) {
      setCurrentCost(0);
      setElapsed(0);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeMeeting, tick]);

  return { activeMeeting, currentCost, elapsed };
}
