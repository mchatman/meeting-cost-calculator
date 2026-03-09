import { Attendee } from "./types";

export function getCostPerSecond(attendees: Attendee[]): number {
  const totalHourlyRate = attendees.reduce((sum, a) => sum + a.hourlyRate, 0);
  return totalHourlyRate / 3600;
}

export function calculateTotalCost(
  attendees: Attendee[],
  startedAt: Date,
  endedAt: Date
): number {
  const seconds = (endedAt.getTime() - startedAt.getTime()) / 1000;
  const cost = getCostPerSecond(attendees) * seconds;
  return Math.round(cost * 100) / 100;
}
