const ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_URL = "https://api.zoom.us/v2";

function getCredentials() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri =
    process.env.ZOOM_REDIRECT_URI ||
    "http://localhost:3000/api/auth/callback/zoom";

  if (!clientId || !clientSecret) {
    throw new Error("Missing ZOOM_CLIENT_ID or ZOOM_CLIENT_SECRET");
  }

  return { clientId, clientSecret, redirectUri };
}

export function getZoomAuthUrl(): string {
  const { clientId, redirectUri } = getCredentials();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });
  return `${ZOOM_AUTH_URL}?${params.toString()}`;
}

export async function getZoomTokensFromCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getCredentials();

  const response = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zoom token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getZoomMeetings(accessToken: string) {
  const response = await fetch(`${ZOOM_API_URL}/users/me/meetings?type=upcoming&page_size=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zoom API error: ${error}`);
  }

  const data = await response.json();

  return (data.meetings || []).map((meeting: {
    id: number;
    topic: string;
    start_time: string;
    duration: number;
    join_url: string;
  }) => ({
    id: String(meeting.id),
    title: meeting.topic || "Untitled Meeting",
    startTime: meeting.start_time || "",
    duration: meeting.duration || 0,
    joinUrl: meeting.join_url || null,
  }));
}

export async function getZoomMeetingParticipants(accessToken: string, meetingId: string) {
  const response = await fetch(`${ZOOM_API_URL}/meetings/${meetingId}/registrants`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Registrants may not be available for all meeting types, fall back gracefully
  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.registrants || []).map((p: {
    email: string;
    first_name: string;
    last_name: string;
  }) => ({
    email: p.email || "",
    name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
  }));
}
