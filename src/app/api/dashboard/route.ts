import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!user.orgId) {
    return NextResponse.json(
      { error: "No organization found." },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "week"; // week, month, quarter

  const supabase = getSupabase();
  const now = new Date();
  let periodStart: Date;

  switch (period) {
    case "month":
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      periodStart = new Date(now.getFullYear(), quarterMonth, 1);
      break;
    case "week":
    default:
      periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      periodStart.setHours(0, 0, 0, 0);
      break;
  }

  // Fetch all meetings for this org in the period
  const { data: meetings, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("org_id", user.orgId)
    .gte("scheduled_start", periodStart.toISOString())
    .order("scheduled_start", { ascending: false });

  if (error) {
    console.error("Dashboard query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }

  const allMeetings = meetings || [];
  const endedMeetings = allMeetings.filter((m) => m.status === "ended");
  const activeMeetings = allMeetings.filter((m) => m.status === "active");

  // Total cost
  const totalCost = endedMeetings.reduce(
    (sum, m) => sum + (parseFloat(m.total_cost) || 0),
    0
  );

  // Total meeting hours
  const totalHours = endedMeetings.reduce((sum, m) => {
    if (m.scheduled_start && m.scheduled_end) {
      const start = new Date(m.scheduled_start);
      const end = new Date(m.scheduled_end);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  // Total attendee hours (meeting hours × attendees)
  const totalAttendeeHours = endedMeetings.reduce((sum, m) => {
    if (m.scheduled_start && m.scheduled_end) {
      const start = new Date(m.scheduled_start);
      const end = new Date(m.scheduled_end);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours * (m.attendee_count || 1);
    }
    return sum;
  }, 0);

  // Most expensive meetings
  const mostExpensive = [...endedMeetings]
    .sort((a, b) => (parseFloat(b.total_cost) || 0) - (parseFloat(a.total_cost) || 0))
    .slice(0, 10)
    .map((m) => ({
      title: m.title,
      cost: parseFloat(m.total_cost) || 0,
      attendeeCount: m.attendee_count,
      duration: m.scheduled_start && m.scheduled_end
        ? Math.round(
            (new Date(m.scheduled_end).getTime() -
              new Date(m.scheduled_start).getTime()) /
              (1000 * 60)
          )
        : 0,
      date: m.scheduled_start,
    }));

  // Cost by day (for chart)
  const costByDay: Record<string, number> = {};
  for (const m of endedMeetings) {
    if (m.scheduled_start) {
      const day = new Date(m.scheduled_start).toISOString().split("T")[0];
      costByDay[day] = (costByDay[day] || 0) + (parseFloat(m.total_cost) || 0);
    }
  }

  // Average meeting cost
  const avgCost =
    endedMeetings.length > 0 ? totalCost / endedMeetings.length : 0;

  // Average attendees per meeting
  const avgAttendees =
    allMeetings.length > 0
      ? allMeetings.reduce((sum, m) => sum + (m.attendee_count || 1), 0) /
        allMeetings.length
      : 0;

  return NextResponse.json({
    period,
    periodStart: periodStart.toISOString(),
    summary: {
      totalCost: Math.round(totalCost * 100) / 100,
      totalMeetings: allMeetings.length,
      endedMeetings: endedMeetings.length,
      activeMeetings: activeMeetings.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalAttendeeHours: Math.round(totalAttendeeHours * 10) / 10,
      avgCostPerMeeting: Math.round(avgCost * 100) / 100,
      avgAttendeesPerMeeting: Math.round(avgAttendees * 10) / 10,
    },
    mostExpensive,
    costByDay,
  });
}
