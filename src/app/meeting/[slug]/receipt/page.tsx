"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Meeting, VoteOption, VoteResults as VoteResultsType } from "@/lib/types";
import { getMeeting, castVote, getVotes, hasVoted } from "@/lib/mock-api";
import { MeetingReceipt } from "@/components/meeting-receipt";
import { VoteButtons } from "@/components/vote-buttons";
import { VoteResults } from "@/components/vote-results";
import { ShareButtons } from "@/components/share-buttons";

function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("voter-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("voter-id", id);
  }
  return id;
}

export default function ReceiptPage() {
  const params = useParams<{ slug: string }>();
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState<VoteResultsType>({
    total: 0,
    results: {
      worth_it: 0,
      could_be_async: 0,
      too_many_people: 0,
      too_long: 0,
    },
  });

  useEffect(() => {
    const m = getMeeting(params.slug);
    setMeeting(m);
    if (m) {
      setResults(getVotes(params.slug));
      const voterId = getVoterId();
      setVoted(hasVoted(params.slug, voterId));
    }
  }, [params.slug]);

  function handleVote(option: VoteOption) {
    const voterId = getVoterId();
    const success = castVote(params.slug, option, voterId);
    if (success) {
      setVoted(true);
      setResults(getVotes(params.slug));
    }
  }

  if (meeting === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-mauve">Loading...</div>
      </div>
    );
  }

  if (meeting === null || !meeting.endedAt) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-navy">Meeting not found</h1>
        <p className="mt-2 text-navy/60">
          This meeting doesn&apos;t exist or hasn&apos;t ended yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="blob blob-pink absolute -right-20 top-0 h-64 w-64"
        aria-hidden="true"
      />
      <div
        className="blob blob-navy absolute -left-16 bottom-20 h-48 w-48"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:py-20">
        {/* Two-column editorial layout on desktop */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          {/* Left: Receipt card */}
          <div className="animate-fade-in-up flex justify-center lg:justify-end">
            <MeetingReceipt meeting={meeting} />
          </div>

          {/* Right: Vote + share — stacked */}
          <div className="space-y-8">
            <div className="animate-fade-in-up animate-delay-1">
              <VoteButtons onVote={handleVote} disabled={voted} />
            </div>

            <div className="animate-fade-in-up animate-delay-2">
              <VoteResults results={results} />
            </div>

            <div className="animate-fade-in-up animate-delay-3">
              <div className="accent-bar mb-6" />
              <ShareButtons meeting={meeting} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
