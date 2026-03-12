"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meeting, MeetingResponse } from "@/lib/types";
import { fetchMeeting, endMeeting } from "@/lib/api-client";
import { LiveTimer } from "@/components/live-timer";

function toMeeting(res: MeetingResponse): Meeting {
  const startMs = new Date(res.startedAt).getTime();
  const endMs = res.endedAt ? new Date(res.endedAt).getTime() : null;
  return {
    id: res.slug,
    slug: res.slug,
    title: res.title,
    status: res.status,
    started_at: res.startedAt,
    ended_at: res.endedAt ?? null,
    attendees: res.attendees,
    startedAt: startMs,
    endedAt: endMs,
    total_cost: res.totalCost,
    totalCost: res.totalCost,
    created_ip: null,
    created_at: res.startedAt,
  };
}

export default function MeetingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const res = await fetchMeeting(params.slug);
      if (!res) {
        setMeeting(null);
        return;
      }
      if (res.endedAt) {
        router.replace(`/meeting/${params.slug}/receipt`);
        return;
      }
      setMeeting(toMeeting(res));
    }
    load();
  }, [params.slug, router]);

  if (meeting === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-mauve">Loading...</div>
      </div>
    );
  }

  if (meeting === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-navy">Meeting not found</h1>
        <p className="mt-2 text-navy/60">
          This meeting doesn&apos;t exist or the link is invalid.
        </p>
      </div>
    );
  }

  async function handleEnd(_totalCost: number) {
    await endMeeting(params.slug);
    router.push(`/meeting/${params.slug}/receipt`);
  }

  return (
    <div className="py-10 sm:py-16">
      <LiveTimer meeting={meeting} onEnd={handleEnd} />
    </div>
  );
}
