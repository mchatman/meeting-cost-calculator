export interface Attendee {
  id: string;
  role: string;
  hourlyRate: number;
}

export interface Meeting {
  id: string;
  slug: string;
  title: string;
  attendees: Attendee[];
  startedAt: number; // Date.now() timestamp
  endedAt: number | null;
  totalCost: number | null;
}

export type VoteOption =
  | "worth_it"
  | "could_be_async"
  | "too_many_people"
  | "too_long";

export interface Vote {
  id: string;
  meetingId: string;
  option: VoteOption;
  voterId: string;
}

export interface VoteResults {
  worth_it: number;
  could_be_async: number;
  too_many_people: number;
  too_long: number;
  total: number;
}

export const VOTE_LABELS: Record<VoteOption, string> = {
  worth_it: "Worth it!",
  could_be_async: "Could be async",
  too_many_people: "Too many people",
  too_long: "Too long",
};
