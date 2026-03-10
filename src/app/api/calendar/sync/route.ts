import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { syncCalendarToMeetings } from "@/lib/calendar-sync";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  if (!user.orgId) {
    return NextResponse.json(
      { error: "You must belong to an organization to sync meetings." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected. Please connect your calendar first." },
      { status: 400 }
    );
  }

  // Get org's default hourly rate
  const supabase = getSupabase();
  const { data: org } = await supabase
    .from("organizations")
    .select("default_hourly_rate")
    .eq("id", user.orgId)
    .single();

  const hourlyRate = org?.default_hourly_rate || 50;

  try {
    const result = await syncCalendarToMeetings(
      accessToken,
      user.orgId,
      user.id,
      hourlyRate
    );

    return NextResponse.json({
      message: `Synced ${result.synced} events (${result.created} new, ${result.updated} updated).`,
      ...result,
    });
  } catch (err) {
    console.error("Calendar sync error:", err);
    return NextResponse.json(
      { error: "Failed to sync calendar. Your Google session may have expired." },
      { status: 500 }
    );
  }
}
