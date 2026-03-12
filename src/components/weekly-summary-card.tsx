"use client";

import { useEffect, useState } from "react";
import { DashboardMeeting } from "@/lib/types";
import { formatCost } from "@/lib/cost-calculator";
import { Card, CardContent } from "@/components/ui/card";

const STORAGE_KEY = "meeting-cost-weekly-summaries";
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DaySummary {
  date: string;
  totalCost: number;
  meetingCount: number;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function loadWeekSummaries(): DaySummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWeekSummaries(summaries: DaySummary[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

interface WeeklySummaryCardProps {
  todayMeetings: DashboardMeeting[];
}

export function WeeklySummaryCard({ todayMeetings }: WeeklySummaryCardProps) {
  const [weekData, setWeekData] = useState<DaySummary[]>([]);

  useEffect(() => {
    const weekStart = getWeekStart();
    const todayKey = getDateKey(new Date());

    // Load stored summaries, filter to current week
    const stored = loadWeekSummaries().filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && s.date !== todayKey;
    });

    // Compute today's summary from live data
    const todayCost = todayMeetings.reduce((sum, m) => sum + m.accruedCost, 0);
    const todaySummary: DaySummary = {
      date: todayKey,
      totalCost: todayCost,
      meetingCount: todayMeetings.length,
    };

    const merged = [...stored.filter((s) => s.date !== todayKey), todaySummary];
    saveWeekSummaries(merged);

    // Build full week array (Mon–Sun)
    const full: DaySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = getDateKey(d);
      const existing = merged.find((s) => s.date === key);
      full.push(existing ?? { date: key, totalCost: 0, meetingCount: 0 });
    }

    setWeekData(full);
  }, [todayMeetings]);

  const totalCost = weekData.reduce((sum, d) => sum + d.totalCost, 0);
  const totalMeetings = weekData.reduce((sum, d) => sum + d.meetingCount, 0);
  const maxCost = Math.max(...weekData.map((d) => d.totalCost), 1);
  const avgCost = totalMeetings > 0 ? totalCost / totalMeetings : 0;

  return (
    <Card className="card-brand overflow-hidden bg-white">
      <div className="accent-bar" />
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/50">
          This Week
        </p>
        <p className="cost-ticker text-brand-gradient mt-1 text-3xl font-extrabold tracking-tight">
          {formatCost(totalCost)}
        </p>

        {/* Bar chart */}
        <div className="mt-4 space-y-1.5">
          {weekData.map((day, i) => {
            const pct = maxCost > 0 ? (day.totalCost / maxCost) * 100 : 0;
            const isToday = day.date === getDateKey(new Date());
            return (
              <div key={day.date} className="flex items-center gap-2">
                <span
                  className={`w-7 text-[10px] ${
                    isToday
                      ? "font-bold text-navy"
                      : "text-navy/40"
                  }`}
                >
                  {DAY_NAMES[i]}
                </span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-mauve-pale/40">
                  <div
                    className="vote-bar-fill h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 0)}%` }}
                  />
                </div>
                <span className="cost-ticker w-14 text-right text-[10px] text-navy/50">
                  {day.totalCost > 0 ? formatCost(day.totalCost) : "—"}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-navy/50">
          Avg {formatCost(avgCost)}/meeting · {totalMeetings} meeting
          {totalMeetings !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
