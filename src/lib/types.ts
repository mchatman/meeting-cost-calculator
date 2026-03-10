export interface Attendee {
  id: string;
  role: string;
  hourlyRate: number;
}

export interface Meeting {
  id: string;
  slug: string;
  title: string | null;
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
  attendees: Attendee[];
  startedAt: number; // Date.now() timestamp — used by frontend timer
  endedAt: number | null;
  total_cost: number | null;
  totalCost: number | null;
  created_ip: string | null;
  created_at: string;
}

export interface MeetingResponse {
  slug: string;
  title: string | null;
  status: "active" | "ended";
  startedAt: string;
  endedAt: string | null;
  attendees: Attendee[];
  costPerSecond: number;
  totalCost: number | null;
}

export type VoteOption =
  | "worth_it"
  | "could_be_async"
  | "too_many_people"
  | "too_long";

export interface Vote {
  id: string;
  meeting_id: string;
  vote: VoteOption;
  voter_ip: string | null;
  created_at: string;
  // Frontend aliases
  meetingId: string;
  option: VoteOption;
  voterId: string;
}

export interface VoteResults {
  total: number;
  results: Record<VoteOption, number>;
}

export interface CreateMeetingRequest {
  title?: string;
  attendees: Attendee[];
}

export interface EndMeetingResponse {
  totalCost: number;
  duration: number;
}

export const VOTE_LABELS: Record<VoteOption, string> = {
  worth_it: "Worth it!",
  could_be_async: "Could be async",
  too_many_people: "Too many people",
  too_long: "Too long",
};
