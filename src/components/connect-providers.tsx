"use client";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectProvidersProps {
  google: boolean;
  zoom: boolean;
  loading: boolean;
  compact?: boolean;
}

export function ConnectProviders({
  google,
  zoom,
  loading,
  compact,
}: ConnectProvidersProps) {
  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-mauve-pale/50" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-mauve-pale/50" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {google ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <Check className="size-3.5" />
            Google Calendar
          </span>
        ) : (
          <a
            href="/api/auth/google"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "border-mauve-light/60 text-navy hover:border-pink hover:text-pink"
            )}
          >
            Connect Google
          </a>
        )}
        {zoom ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <Check className="size-3.5" />
            Zoom
          </span>
        ) : (
          <a
            href="/api/auth/zoom"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "border-mauve-light/60 text-navy hover:border-pink hover:text-pink"
            )}
          >
            Connect Zoom
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="card-brand bg-white">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">Google Calendar</p>
            <p className="text-xs text-navy/50">Import your calendar events</p>
          </div>
          {google ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Check className="size-3.5" />
              Connected
            </span>
          ) : (
            <a
              href="/api/auth/google"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-navy text-white hover:bg-navy-light"
              )}
            >
              Connect
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="card-brand bg-white">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"
                fill="#2D8CFF"
              />
              <path
                d="M7.5 9.2v5.6c0 .44.36.8.8.8h5.4l2.8 2.4v-2.4h.5c.44 0 .8-.36.8-.8V9.2c0-.44-.36-.8-.8-.8H8.3c-.44 0-.8.36-.8.8z"
                fill="white"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">Zoom</p>
            <p className="text-xs text-navy/50">Import your Zoom meetings</p>
          </div>
          {zoom ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Check className="size-3.5" />
              Connected
            </span>
          ) : (
            <a
              href="/api/auth/zoom"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-navy text-white hover:bg-navy-light"
              )}
            >
              Connect
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
