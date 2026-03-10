import { getSupabase } from "./supabase";

interface RateLimitConfig {
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  create_meeting: { maxPerMinute: 5, maxPerHour: 15, maxPerDay: 30 },
  vote: { maxPerMinute: 10, maxPerHour: 30, maxPerDay: 100 },
};

export async function checkRateLimit(
  ip: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: string }> {
  const config = LIMITS[action];
  if (!config) return { allowed: true };

  const supabase = getSupabase();
  const now = new Date();

  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { count: minuteCount } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("action", action)
    .gte("created_at", oneMinuteAgo);

  if ((minuteCount ?? 0) >= config.maxPerMinute) {
    return { allowed: false, retryAfter: "1 minute" };
  }

  const { count: hourCount } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("action", action)
    .gte("created_at", oneHourAgo);

  if ((hourCount ?? 0) >= config.maxPerHour) {
    return { allowed: false, retryAfter: "1 hour" };
  }

  const { count: dayCount } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("action", action)
    .gte("created_at", oneDayAgo);

  if ((dayCount ?? 0) >= config.maxPerDay) {
    return { allowed: false, retryAfter: "24 hours" };
  }

  // Record this action
  await supabase.from("rate_limits").insert({ ip_address: ip, action });

  return { allowed: true };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
