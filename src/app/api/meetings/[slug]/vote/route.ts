import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { VoteOption, VoteResults } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_VOTES: VoteOption[] = [
  "worth_it",
  "could_be_async",
  "too_many_people",
  "too_long",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIp(request);

  const { allowed, retryAfter } = await checkRateLimit(ip, "vote");
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    if (!VALID_VOTES.includes(body.vote)) {
      return NextResponse.json(
        { error: `Invalid vote. Must be one of: ${VALID_VOTES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Find the meeting
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id, status")
      .eq("slug", slug)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    if (meeting.status !== "ended") {
      return NextResponse.json(
        { error: "Can only vote on ended meetings." },
        { status: 400 }
      );
    }

    // Insert vote (unique constraint on meeting_id + voter_ip handles dedup)
    const { error: voteError } = await supabase.from("votes").insert({
      meeting_id: meeting.id,
      vote: body.vote,
      voter_ip: ip,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        return NextResponse.json(
          { error: "You have already voted on this meeting." },
          { status: 409 }
        );
      }
      console.error("Failed to cast vote:", voteError);
      return NextResponse.json(
        { error: "Failed to cast vote." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  // Find the meeting
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id")
    .eq("slug", slug)
    .single();

  if (meetingError || !meeting) {
    return NextResponse.json(
      { error: "Meeting not found." },
      { status: 404 }
    );
  }

  // Get all votes for this meeting
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("vote")
    .eq("meeting_id", meeting.id);

  if (votesError) {
    console.error("Failed to fetch votes:", votesError);
    return NextResponse.json(
      { error: "Failed to fetch votes." },
      { status: 500 }
    );
  }

  const results: VoteResults = {
    total: votes?.length ?? 0,
    results: {
      worth_it: 0,
      could_be_async: 0,
      too_many_people: 0,
      too_long: 0,
    },
  };

  for (const v of votes ?? []) {
    const vote = v.vote as VoteOption;
    if (vote in results.results) {
      results.results[vote]++;
    }
  }

  return NextResponse.json(results);
}
