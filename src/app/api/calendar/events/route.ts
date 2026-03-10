import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUpcomingEvents } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Connect Google Calendar first." },
      { status: 401 }
    );
  }

  try {
    const events = await getUpcomingEvents(accessToken);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("Calendar API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch calendar events." },
      { status: 500 }
    );
  }
}
