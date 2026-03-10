"use client";

import { useState } from "react";
import { Meeting } from "@/lib/types";
import { formatCost } from "@/lib/cost-calculator";
import { Check, Copy, Share2 } from "lucide-react";

interface ShareButtonsProps {
  meeting: Meeting;
}

export function ShareButtons({ meeting }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Our "${meeting.title}" meeting cost ${formatCost(meeting.totalCost ?? 0)}!`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silently fail
    }
  }

  function shareToTwitter() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  }

  function shareToLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <p className="section-heading text-[11px] font-bold uppercase tracking-[0.2em] text-navy/60">
        <Share2 className="mr-1.5 inline-block size-3" />
        Share
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={copyLink}
          className={`hover-lift flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            copied
              ? "border-navy/30 bg-navy/5 text-navy"
              : "border-mauve-light/60 bg-white text-navy/60 hover:border-pink/40 hover:text-pink"
          }`}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={shareToTwitter}
          className="hover-lift flex flex-1 items-center justify-center gap-2 rounded-xl border border-mauve-light/60 bg-white px-4 py-3 text-sm font-medium text-navy/60 transition-all hover:border-pink/40 hover:text-pink"
        >
          X / Twitter
        </button>
        <button
          onClick={shareToLinkedIn}
          className="hover-lift flex flex-1 items-center justify-center gap-2 rounded-xl border border-mauve-light/60 bg-white px-4 py-3 text-sm font-medium text-navy/60 transition-all hover:border-pink/40 hover:text-pink"
        >
          LinkedIn
        </button>
      </div>
    </div>
  );
}
