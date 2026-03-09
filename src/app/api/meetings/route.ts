import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCostPerSecond } from "@/lib/cost-calculator";
import { CreateMeetingRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const { allowed, retryAfter } = await checkRateLimit(ip, "create_meeting");
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${retryAfter}.` },
        { status: 429 }
      );
    }

    const body: CreateMeetingRequest = await request.json();

    if (!body.attendees || body.attendees.length === 0) {
      return NextResponse.json(
        { error: "At least one attendee is required." },
        { status: 400 }
      );
    }

    for (const attendee of body.attendees) {
      if (!attendee.role || typeof attendee.hourlyRate !== "number" || attendee.hourlyRate <= 0) {
        return NextResponse.json(
          { error: "Each attendee must have a role and a positive hourlyRate." },
          { status: 400 }
        );
      }
    }

    const slug = generateSlug();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("meetings")
      .insert({
        slug,
        title: body.title || null,
        attendees: body.attendees,
        created_ip: ip,
      })
      .select("started_at")
      .single();

    if (error) {
      console.error("Failed to create meeting:", error);
      return NextResponse.json(
        { error: "Failed to create meeting." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        slug,
        startedAt: data.started_at,
        costPerSecond: getCostPerSecond(body.attendees),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
