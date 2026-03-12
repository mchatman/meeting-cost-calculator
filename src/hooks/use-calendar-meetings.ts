"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DashboardMeeting,
  CalendarEvent,
  ZoomMeeting,
} from "@/lib/types";
import { fetchGoogleEvents, fetchZoomMeetings } from "@/lib/api-client";
import { getDefaultRate } from "@/lib/rate-settings";

function computeStatus(
  start: Date,
  end: Date,
  now: Date
): "upcoming" | "in-progress" | "ended" {
  if (now < start) return "upcoming";
  if (now >= start && now < end) return "in-progress";
  return "ended";
}

function normalizeGoogleEvent(
  event: CalendarEvent,
  rate: number,
  now: Date
): DashboardMeeting {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const count = event.attendeeCount || event.attendees?.length || 1;
  const costPerSecond = (rate * count) / 3600;
  const status = computeStatus(start, end, now);

  let accruedCost = 0;
  if (status === "ended") {
    accruedCost = costPerSecond * ((end.getTime() - start.getTime()) / 1000);
  } else if (status === "in-progress") {
    accruedCost = costPerSecond * ((now.getTime() - start.getTime()) / 1000);
  }

  return {
    id: `google-${event.id}`,
    title: event.title,
    startTime: start,
    endTime: end,
    attendeeCount: count,
    attendeeNames: event.attendees?.map((a) => a.name || a.email) ?? [],
    source: "google",
    meetLink: event.meetLink,
    hourlyRate: rate,
    costPerSecond,
    status,
    accruedCost,
  };
}

function normalizeZoomMeeting(
  meeting: ZoomMeeting,
  rate: number,
  now: Date
): DashboardMeeting {
  const start = new Date(meeting.startTime);
  const end = new Date(start.getTime() + meeting.duration * 60_000);
  const count = 1; // Zoom doesn't provide attendee count upfront
  const costPerSecond = (rate * count) / 3600;
  const status = computeStatus(start, end, now);

  let accruedCost = 0;
  if (status === "ended") {
    accruedCost = costPerSecond * ((end.getTime() - start.getTime()) / 1000);
  } else if (status === "in-progress") {
    accruedCost = costPerSecond * ((now.getTime() - start.getTime()) / 1000);
  }

  return {
    id: `zoom-${meeting.id}`,
    title: meeting.title,
    startTime: start,
    endTime: end,
    attendeeCount: count,
    attendeeNames: [],
    source: "zoom",
    meetLink: meeting.joinUrl,
    hourlyRate: rate,
    costPerSecond,
    status,
    accruedCost,
  };
}

function dedup(meetings: DashboardMeeting[]): DashboardMeeting[] {
  const result: DashboardMeeting[] = [];
  const seen = new Set<string>();

  // Sort so Google events come first (richer data)
  const sorted = [...meetings].sort((a, b) =>
    a.source === "google" && b.source === "zoom" ? -1 : 1
  );

  for (const m of sorted) {
    // Check for overlap: same time window (within 5 min) and similar title
    const isDup = result.some((existing) => {
      const timeOverlap =
        Math.abs(existing.startTime.getTime() - m.startTime.getTime()) <
        5 * 60_000;
      const titleMatch =
        existing.title.toLowerCase().includes(m.title.toLowerCase().slice(0, 10)) ||
        m.title.toLowerCase().includes(existing.title.toLowerCase().slice(0, 10));
      return timeOverlap && titleMatch;
    });

    if (!isDup && !seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }

  return result;
}

export function useCalendarMeetings(
  googleConnected: boolean,
  zoomConnected: boolean,
  rate: number
) {
  const [meetings, setMeetings] = useState<DashboardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const now = new Date();
      const currentRate = rate || getDefaultRate();

      const [googleEvents, zoomMeetings] = await Promise.all([
        googleConnected ? fetchGoogleEvents() : Promise.resolve([]),
        zoomConnected ? fetchZoomMeetings() : Promise.resolve([]),
      ]);

      const googleNormalized = googleEvents.map((e) =>
        normalizeGoogleEvent(e, currentRate, now)
      );
      const zoomNormalized = zoomMeetings.map((m) =>
        normalizeZoomMeeting(m, currentRate, now)
      );

      const all = dedup([...googleNormalized, ...zoomNormalized]);
      all.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      setMeetings(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  }, [googleConnected, zoomConnected, rate]);

  useEffect(() => {
    if (!googleConnected && !zoomConnected) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll, googleConnected, zoomConnected]);

  return { meetings, loading, error, refetch: fetchAll };
}
