import { google } from "googleapis";
import { getAuthenticatedClient } from "./google";
import { getSupabase } from "./supabase";

interface CalendarEvent {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  organizerEmail: string;
  attendeeCount: number;
  attendeeEmails: string[];
  meetLink: string | null;
  hasDescription: boolean;
  isRecurring: boolean;
}

export async function fetchCalendarEvents(
  accessToken: string,
  daysBack: number = 7,
  daysForward: number = 7
): Promise<CalendarEvent[]> {
  const auth = getAuthenticatedClient(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const timeMin = new Date(now);
  timeMin.setDate(timeMin.getDate() - daysBack);
  const timeMax = new Date(now);
  timeMax.setDate(timeMax.getDate() + daysForward);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 200,
  });

  const events = response.data.items || [];

  return events
    .filter((event) => {
      // Only include events with a start/end time (skip all-day events)
      return event.start?.dateTime && event.end?.dateTime;
    })
    .map((event) => ({
      eventId: event.id || "",
      title: event.summary || "Untitled Meeting",
      startTime: event.start!.dateTime!,
      endTime: event.end!.dateTime!,
      organizerEmail: event.organizer?.email || "",
      attendeeCount: Math.max(event.attendees?.length || 1, 1),
      attendeeEmails: (event.attendees || [])
        .map((a) => a.email || "")
        .filter(Boolean),
      meetLink: event.hangoutLink || null,
      hasDescription: !!(event.description && event.description.trim().length > 0),
      isRecurring: !!event.recurringEventId,
    }));
}

export async function syncCalendarToMeetings(
  accessToken: string,
  orgId: string,
  userId: string,
  hourlyRate: number
): Promise<{ synced: number; created: number; updated: number }> {
  const events = await fetchCalendarEvents(accessToken);
  const supabase = getSupabase();

  let created = 0;
  let updated = 0;

  for (const event of events) {
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    const durationSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
    const costPerSecond = (event.attendeeCount * hourlyRate) / 3600;
    const totalCost = Math.round(costPerSecond * durationSeconds * 100) / 100;

    const now = new Date();
    const status = endDate <= now ? "ended" : "active";

    // Check if this event already exists
    const { data: existing } = await supabase
      .from("meetings")
      .select("id")
      .eq("org_id", orgId)
      .eq("calendar_event_id", event.eventId)
      .maybeSingle();

    const meetingData = {
      org_id: orgId,
      calendar_event_id: event.eventId,
      calendar_source: "google" as const,
      title: event.title,
      status,
      started_at: event.startTime,
      ended_at: status === "ended" ? event.endTime : null,
      scheduled_start: event.startTime,
      scheduled_end: event.endTime,
      attendee_count: event.attendeeCount,
      attendees: event.attendeeEmails.map((email) => ({
        role: "Attendee",
        hourlyRate,
        email,
      })),
      hourly_rate: hourlyRate,
      total_cost: status === "ended" ? totalCost : null,
      organizer_email: event.organizerEmail,
      synced_by: userId,
      slug: event.eventId.substring(0, 8),
    };

    if (existing) {
      await supabase
        .from("meetings")
        .update(meetingData)
        .eq("id", existing.id);
      updated++;
    } else {
      await supabase.from("meetings").insert(meetingData);
      created++;
    }
  }

  return { synced: events.length, created, updated };
}
