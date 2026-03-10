import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export function getAuthenticatedClient(accessToken: string) {
  const client = getOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  return client;
}

export async function getUpcomingEvents(accessToken: string) {
  const auth = getAuthenticatedClient(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Get events from now through end of tomorrow
  const tomorrow = new Date(endOfDay);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 20,
  });

  const events = response.data.items || [];

  return events.map((event) => ({
    id: event.id,
    title: event.summary || "Untitled Meeting",
    startTime: event.start?.dateTime || event.start?.date || "",
    endTime: event.end?.dateTime || event.end?.date || "",
    attendees: (event.attendees || []).map((a) => ({
      email: a.email || "",
      name: a.displayName || a.email || "Unknown",
      status: a.responseStatus || "needsAction",
    })),
    attendeeCount: event.attendees?.length || 1,
    meetLink: event.hangoutLink || null,
  }));
}
