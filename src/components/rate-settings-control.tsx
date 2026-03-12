"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RateSettingsControlProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

const QUICK_PICKS = [75, 95, 120];

export function RateSettingsControl({
  rate,
  onRateChange,
}: RateSettingsControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/70">
        Default Rate
      </Label>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-navy/60">$</span>
        <Input
          type="number"
          min={1}
          value={rate}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v > 0) onRateChange(v);
          }}
          className="h-8 w-20 border-mauve-light/60 text-center text-sm text-navy focus-visible:border-pink focus-visible:ring-pink/20"
        />
        <span className="text-xs text-navy/50">/hr</span>
      </div>
      <div className="flex gap-1.5">
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick}
            type="button"
            onClick={() => onRateChange(pick)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              rate === pick
                ? "bg-pink/10 text-pink"
                : "bg-mauve-pale/50 text-navy/50 hover:bg-mauve-pale hover:text-navy/70"
            }`}
          >
            ${pick}
          </button>
        ))}
      </div>
    </div>
  );
}
