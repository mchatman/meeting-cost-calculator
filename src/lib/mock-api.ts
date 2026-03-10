import { nanoid } from "nanoid";
import { Meeting, Attendee, Vote, VoteOption, VoteResults } from "./types";

// In-memory store
const meetings = new Map<string, Meeting>();
const votes = new Map<string, Vote[]>();

export function createMeeting(title: string, attendees: Attendee[]): Meeting {
  const slug = nanoid(8);
  const now = new Date().toISOString();
  const meeting: Meeting = {
    id: nanoid(),
    slug,
    title,
    status: "active",
    attendees,
    startedAt: Date.now(),
    started_at: now,
    endedAt: null,
    ended_at: null,
    totalCost: null,
    total_cost: null,
    created_ip: null,
    created_at: now,
  };
  meetings.set(slug, meeting);
  votes.set(slug, []);
  return meeting;
}

export function getMeeting(slug: string): Meeting | null {
  return meetings.get(slug) ?? null;
}

export function endMeeting(slug: string, totalCost: number): Meeting | null {
  const meeting = meetings.get(slug);
  if (!meeting) return null;
  const now = new Date();
  meeting.endedAt = now.getTime();
  meeting.ended_at = now.toISOString();
  meeting.totalCost = totalCost;
  meeting.total_cost = totalCost;
  meeting.status = "ended";
  return meeting;
}

export function castVote(
  slug: string,
  option: VoteOption,
  voterId: string
): boolean {
  const meetingVotes = votes.get(slug);
  if (!meetingVotes) return false;

  // Check if voter already voted
  if (meetingVotes.some((v) => v.voterId === voterId)) return false;

  meetingVotes.push({
    id: nanoid(),
    meeting_id: slug,
    meetingId: slug,
    vote: option,
    option,
    voterId,
    voter_ip: null,
    created_at: new Date().toISOString(),
  });
  return true;
}

export function getVotes(slug: string): VoteResults {
  const meetingVotes = votes.get(slug) ?? [];
  return {
    total: meetingVotes.length,
    results: {
      worth_it: meetingVotes.filter((v) => v.vote === "worth_it").length,
      could_be_async: meetingVotes.filter((v) => v.vote === "could_be_async").length,
      too_many_people: meetingVotes.filter((v) => v.vote === "too_many_people").length,
      too_long: meetingVotes.filter((v) => v.vote === "too_long").length,
    },
  };
}

export function hasVoted(slug: string, voterId: string): boolean {
  const meetingVotes = votes.get(slug) ?? [];
  return meetingVotes.some((v) => v.voterId === voterId);
}
