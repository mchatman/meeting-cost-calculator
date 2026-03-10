import { nanoid } from "nanoid";
import { Meeting, Attendee, Vote, VoteOption, VoteResults } from "./types";

// In-memory store
const meetings = new Map<string, Meeting>();
const votes = new Map<string, Vote[]>();

export function createMeeting(title: string, attendees: Attendee[]): Meeting {
  const slug = nanoid(8);
  const meeting: Meeting = {
    id: nanoid(),
    slug,
    title,
    attendees,
    startedAt: Date.now(),
    endedAt: null,
    totalCost: null,
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
  meeting.endedAt = Date.now();
  meeting.totalCost = totalCost;
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
    meetingId: slug,
    option,
    voterId,
  });
  return true;
}

export function getVotes(slug: string): VoteResults {
  const meetingVotes = votes.get(slug) ?? [];
  return {
    worth_it: meetingVotes.filter((v) => v.option === "worth_it").length,
    could_be_async: meetingVotes.filter((v) => v.option === "could_be_async")
      .length,
    too_many_people: meetingVotes.filter((v) => v.option === "too_many_people")
      .length,
    too_long: meetingVotes.filter((v) => v.option === "too_long").length,
    total: meetingVotes.length,
  };
}

export function hasVoted(slug: string, voterId: string): boolean {
  const meetingVotes = votes.get(slug) ?? [];
  return meetingVotes.some((v) => v.voterId === voterId);
}
