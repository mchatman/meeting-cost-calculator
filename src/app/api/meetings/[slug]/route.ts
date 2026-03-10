import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getCostPerSecond, calculateTotalCost } from "@/lib/cost-calculator";
import { Meeting, MeetingResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Meeting not found." },
      { status: 404 }
    );
  }

  const meeting = data as Meeting;
  const response: MeetingResponse = {
    slug: meeting.slug,
    title: meeting.title,
    status: meeting.status,
    startedAt: meeting.started_at,
    endedAt: meeting.ended_at,
    attendees: meeting.attendees,
    costPerSecond: getCostPerSecond(meeting.attendees),
    totalCost: meeting.total_cost,
  };

  return NextResponse.json(response);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    if (body.action !== "end") {
      return NextResponse.json(
        { error: "Invalid action. Use 'end'." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: meeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*")
      .eq("slug", slug)
      .single();

    if (fetchError || !meeting) {
      return NextResponse.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    if (meeting.status === "ended") {
      return NextResponse.json(
        { error: "Meeting already ended." },
        { status: 409 }
      );
    }

    const endedAt = new Date();
    const totalCost = calculateTotalCost(
      meeting.attendees,
      new Date(meeting.started_at),
      endedAt
    );
    const duration = Math.round(
      (endedAt.getTime() - new Date(meeting.started_at).getTime()) / 1000
    );

    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        status: "ended",
        ended_at: endedAt.toISOString(),
        total_cost: totalCost,
      })
      .eq("slug", slug);

    if (updateError) {
      console.error("Failed to end meeting:", updateError);
      return NextResponse.json(
        { error: "Failed to end meeting." },
        { status: 500 }
      );
    }

    return NextResponse.json({ totalCost, duration });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
