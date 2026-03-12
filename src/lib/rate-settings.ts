const STORAGE_KEY = "meeting-cost-default-rate";
const DEFAULT_RATE = 75;

export function getDefaultRate(): number {
  if (typeof window === "undefined") return DEFAULT_RATE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = parseFloat(stored);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_RATE;
}

export function setDefaultRate(rate: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(rate));
}
