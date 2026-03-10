import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getZoomMeetings } from "@/lib/zoom";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("zoom_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated. Connect Zoom first." },
      { status: 401 }
    );
  }

  try {
    const meetings = await getZoomMeetings(accessToken);
    return NextResponse.json({ meetings });
  } catch (err) {
    console.error("Zoom API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Zoom meetings." },
      { status: 500 }
    );
  }
}
