"use client";

import { useConnections } from "@/hooks/use-connections";
import { useRateSettings } from "@/hooks/use-rate-settings";
import { useCalendarMeetings } from "@/hooks/use-calendar-meetings";
import { useMeetingAutoTracker } from "@/hooks/use-meeting-auto-tracker";
import { ConnectProviders } from "@/components/connect-providers";
import { RateSettingsControl } from "@/components/rate-settings-control";
import { ActiveMeetingHero } from "@/components/active-meeting-hero";
import { DashboardMeetingList } from "@/components/dashboard-meeting-list";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { WeeklySummaryCard } from "@/components/weekly-summary-card";

export default function DashboardPage() {
  const { google, zoom, loading: connLoading } = useConnections();
  const { rate, setRate } = useRateSettings();
  const { meetings, loading: meetingsLoading } = useCalendarMeetings(
    google,
    zoom,
    rate
  );
  const { activeMeeting, currentCost, elapsed } =
    useMeetingAutoTracker(meetings);

  const isConnected = google || zoom;
  const isLoading = connLoading || meetingsLoading;

  // Not connected state
  if (!connLoading && !isConnected) {
    return (
      <div className="relative overflow-hidden">
        <div
          className="blob blob-mauve absolute -right-20 top-10 h-72 w-72"
          aria-hidden="true"
        />
        <div
          className="blob blob-pink absolute -left-16 top-40 h-52 w-52"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-5 py-16">
          <div className="animate-fade-in-up mx-auto max-w-lg text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-navy sm:text-4xl">
              Connect your calendar
            </h1>
            <p className="mt-4 text-base text-navy/50">
              Link your Google Calendar or Zoom to automatically track meeting
              costs throughout the day.
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-1 mx-auto mt-10 max-w-lg">
            <ConnectProviders
              google={google}
              zoom={zoom}
              loading={connLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  // Today's meetings (filter to today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayMeetings = meetings.filter(
    (m) => m.startTime >= today && m.startTime < tomorrow
  );

  // Update accrued cost for active meeting in the list
  const displayMeetings = todayMeetings.map((m) =>
    activeMeeting && m.id === activeMeeting.id
      ? { ...m, accruedCost: currentCost, status: "in-progress" as const }
      : m
  );

  return (
    <div className="relative overflow-hidden">
      <div
        className="blob blob-mauve absolute -right-20 top-10 h-72 w-72 sm:h-96 sm:w-96"
        aria-hidden="true"
      />
      <div
        className="blob blob-pink absolute -left-16 bottom-20 h-40 w-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-8 sm:py-12">
        {/* Top bar: Rate settings + Connect buttons */}
        <div className="animate-fade-in-up mb-8 flex flex-wrap items-center justify-between gap-4">
          <RateSettingsControl rate={rate} onRateChange={setRate} />
          <ConnectProviders
            google={google}
            zoom={zoom}
            loading={connLoading}
            compact
          />
        </div>

        {/* Active meeting hero */}
        {activeMeeting && (
          <div className="mb-8">
            <ActiveMeetingHero
              meeting={activeMeeting}
              currentCost={currentCost}
              elapsed={elapsed}
            />
          </div>
        )}

        {/* Main content grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-mauve">
              Loading your meetings...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left: Meeting list */}
            <div className="animate-fade-in-up animate-delay-1">
              <h2 className="section-heading mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-navy/60">
                Today&apos;s Meetings
              </h2>
              <DashboardMeetingList meetings={displayMeetings} />
            </div>

            {/* Right: Summaries */}
            <div className="space-y-4">
              <div className="animate-fade-in-up animate-delay-2">
                <DailySummaryCard meetings={displayMeetings} />
              </div>
              <div className="animate-fade-in-up animate-delay-3">
                <WeeklySummaryCard todayMeetings={displayMeetings} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
