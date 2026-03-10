"use client";

import { VoteOption, VoteResults as VoteResultsType, VOTE_LABELS } from "@/lib/types";

interface VoteResultsProps {
  results: VoteResultsType;
}

const VOTE_OPTIONS: VoteOption[] = [
  "worth_it",
  "could_be_async",
  "too_many_people",
  "too_long",
];

export function VoteResults({ results }: VoteResultsProps) {
  if (results.total === 0) return null;

  return (
    <div className="space-y-4">
      <p className="section-heading text-[11px] font-bold uppercase tracking-[0.2em] text-navy/60">
        Results ({results.total} vote{results.total !== 1 ? "s" : ""})
      </p>
      <div className="space-y-3">
        {VOTE_OPTIONS.map((option) => {
          const count = results[option];
          const percentage =
            results.total > 0 ? (count / results.total) * 100 : 0;
          return (
            <div key={option} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-navy/60">
                  {VOTE_LABELS[option]}
                </span>
                <span className="font-mono text-navy/50">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-mauve-pale/60">
                <div
                  className="vote-bar-fill h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
