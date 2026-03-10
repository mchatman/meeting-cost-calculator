"use client";

import { VoteOption, VOTE_LABELS } from "@/lib/types";
import { VoteIcon } from "@/components/vote-icons";

const VOTE_OPTIONS: VoteOption[] = [
  "worth_it",
  "could_be_async",
  "too_many_people",
  "too_long",
];

interface VoteButtonsProps {
  onVote: (option: VoteOption) => void;
  disabled: boolean;
}

export function VoteButtons({ onVote, disabled }: VoteButtonsProps) {
  return (
    <div className="space-y-4">
      <p className="section-heading text-[11px] font-bold uppercase tracking-[0.2em] text-navy/60">
        How was this meeting?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {VOTE_OPTIONS.map((option) => (
          <button
            key={option}
            className="vote-btn hover-lift flex flex-col items-center gap-2.5 rounded-xl border border-mauve-light/60 bg-white px-4 py-5 text-sm font-medium text-navy transition-colors hover:border-pink/40 hover:text-pink disabled:pointer-events-none disabled:opacity-40"
            onClick={() => onVote(option)}
            disabled={disabled}
          >
            <VoteIcon option={option} className="size-10" />
            <span className="relative z-10">{VOTE_LABELS[option]}</span>
          </button>
        ))}
      </div>
      {disabled && (
        <p className="text-center text-xs font-medium text-mauve">
          You&apos;ve already voted — thanks!
        </p>
      )}
    </div>
  );
}
