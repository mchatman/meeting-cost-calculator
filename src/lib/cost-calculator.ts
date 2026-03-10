import { Attendee } from "./types";

export function calculateCostPerSecond(attendees: Attendee[]): number {
  return attendees.reduce((sum, a) => sum + a.hourlyRate / 3600, 0);
}

export function calculateTotalCost(
  attendees: Attendee[],
  elapsedSeconds: number
): number {
  return calculateCostPerSecond(attendees) * elapsedSeconds;
}

export function calculateElapsedSeconds(
  startedAt: number,
  endedAt?: number | null
): number {
  const end = endedAt ?? Date.now();
  return Math.max(0, (end - startedAt) / 1000);
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost);
}
