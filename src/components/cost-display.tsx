"use client";

import { formatCost } from "@/lib/cost-calculator";

interface CostDisplayProps {
  cost: number;
}

export function CostDisplay({ cost }: CostDisplayProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring — slow spin */}
      <div className="spin-slow absolute size-64 rounded-full border-2 border-dashed border-mauve/30 sm:size-80" />

      {/* Inner static ring */}
      <div className="absolute size-52 rounded-full border border-mauve-light/50 sm:size-64" />

      {/* Gradient glow behind number */}
      <div className="absolute size-40 rounded-full bg-gradient-to-br from-mauve-pale/80 to-pink/5 blur-2xl sm:size-52" />

      {/* The cost number */}
      <div className="cost-ticker cost-glow relative z-10 text-center">
        <p className="text-brand-gradient font-mono text-5xl font-extrabold tracking-tighter sm:text-7xl">
          {formatCost(cost)}
        </p>
      </div>
    </div>
  );
}
