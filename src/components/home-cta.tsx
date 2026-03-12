"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConnections } from "@/hooks/use-connections";
import { ConnectProviders } from "@/components/connect-providers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeCta() {
  const { google, zoom, loading } = useConnections();
  const [justConnected, setJustConnected] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) setJustConnected(connected);
  }, []);

  if (justConnected) {
    return (
      <div className="animate-fade-in-up mx-auto mt-12 max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-emerald-700">
          {justConnected === "google" ? "Google Calendar" : "Zoom"} connected
          successfully!
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants(),
            "mt-3 bg-navy text-white hover:bg-navy-light"
          )}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const isConnected = google || zoom;

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <div className="accent-bar mb-4" />
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/50">
        {isConnected ? "Auto-track your meetings" : "Or connect your calendar"}
      </p>
      {isConnected ? (
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-mauve-light/60 text-navy hover:border-pink hover:text-pink"
          )}
        >
          Open Dashboard
        </Link>
      ) : (
        <ConnectProviders
          google={google}
          zoom={zoom}
          loading={loading}
          compact
        />
      )}
    </div>
  );
}
