"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Meeting } from "@/lib/types";
import { getMeeting, endMeeting } from "@/lib/mock-api";
import { LiveTimer } from "@/components/live-timer";

export default function MeetingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);

  useEffect(() => {
    const m = getMeeting(params.slug);
    if (m && m.endedAt) {
      router.replace(`/meeting/${params.slug}/receipt`);
      return;
    }
    setMeeting(m);
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

  function handleEnd(totalCost: number) {
    endMeeting(params.slug, totalCost);
    router.push(`/meeting/${params.slug}/receipt`);
  }

  return (
    <div className="py-10 sm:py-16">
      <LiveTimer meeting={meeting} onEnd={handleEnd} />
    </div>
  );
}
