import {
  CalendarEvent,
  ZoomMeeting,
  MeetingResponse,
  Attendee,
  VoteOption,
  VoteResults,
} from "./types";

// ── Connection checks (cached 30s) ─────────────────────

let googleCache: { connected: boolean; ts: number } | null = null;
let zoomCache: { connected: boolean; ts: number } | null = null;
const CACHE_TTL = 30_000;

export async function checkGoogleConnection(): Promise<boolean> {
  if (googleCache && Date.now() - googleCache.ts < CACHE_TTL) {
    return googleCache.connected;
  }
  try {
    const res = await fetch("/api/calendar/events", { credentials: "include" });
    const connected = res.ok;
    googleCache = { connected, ts: Date.now() };
    return connected;
  } catch {
    googleCache = { connected: false, ts: Date.now() };
    return false;
  }
}

export async function checkZoomConnection(): Promise<boolean> {
  if (zoomCache && Date.now() - zoomCache.ts < CACHE_TTL) {
    return zoomCache.connected;
  }
  try {
    const res = await fetch("/api/calendar/zoom-meetings", {
      credentials: "include",
    });
    const connected = res.ok;
    zoomCache = { connected, ts: Date.now() };
    return connected;
  } catch {
    zoomCache = { connected: false, ts: Date.now() };
    return false;
  }
}

export function clearConnectionCache() {
  googleCache = null;
  zoomCache = null;
}

// ── Calendar data ───────────────────────────────────────

export async function fetchGoogleEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/calendar/events", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? data ?? [];
}

export async function fetchZoomMeetings(): Promise<ZoomMeeting[]> {
  const res = await fetch("/api/calendar/zoom-meetings", {
    credentials: "include",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.meetings ?? data ?? [];
}

// ── Meetings CRUD ───────────────────────────────────────

export async function createMeeting(
  title: string,
  attendees: Attendee[]
): Promise<MeetingResponse> {
  const res = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, attendees }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create meeting");
  }
  return res.json();
}

export async function fetchMeeting(
  slug: string
): Promise<MeetingResponse | null> {
  const res = await fetch(`/api/meetings/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function endMeeting(
  slug: string
): Promise<{ totalCost: number; duration: number } | null> {
  const res = await fetch(`/api/meetings/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "end" }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Votes ───────────────────────────────────────────────

export async function castVote(
  slug: string,
  option: VoteOption,
  voterId: string
): Promise<boolean> {
  const res = await fetch(`/api/meetings/${slug}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote: option, voterId }),
  });
  return res.ok;
}

export async function fetchVoteResults(slug: string): Promise<VoteResults> {
  const res = await fetch(`/api/meetings/${slug}/vote`);
  if (!res.ok) {
    return {
      total: 0,
      results: { worth_it: 0, could_be_async: 0, too_many_people: 0, too_long: 0 },
    };
  }
  return res.json();
}
