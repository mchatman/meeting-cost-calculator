"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Attendee } from "@/lib/types";
import { SALARY_PRESETS } from "@/lib/salary-presets";
import { formatCost } from "@/lib/cost-calculator";
import { createMeeting } from "@/lib/mock-api";
import { AttendeeInput } from "@/components/attendee-input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

function createDefaultAttendee(): Attendee {
  return {
    id: nanoid(6),
    role: SALARY_PRESETS[0].role,
    hourlyRate: SALARY_PRESETS[0].hourlyRate,
  };
}

export function MeetingCreator() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([
    createDefaultAttendee(),
  ]);

  const totalHourlyRate = attendees.reduce((sum, a) => sum + a.hourlyRate, 0);
  const costPerMinute = totalHourlyRate / 60;

  function updateAttendee(index: number, updated: Attendee) {
    setAttendees((prev) => prev.map((a, i) => (i === index ? updated : a)));
  }

  function removeAttendee(index: number) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  function addAttendee() {
    setAttendees((prev) => [...prev, createDefaultAttendee()]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || attendees.length === 0) return;

    const validAttendees = attendees.filter((a) => a.hourlyRate > 0);
    if (validAttendees.length === 0) return;

    const meeting = createMeeting(title.trim(), validAttendees);
    router.push(`/meeting/${meeting.slug}`);
  }

  return (
    <Card className="card-brand relative w-full max-w-xl overflow-hidden bg-white">
      {/* Top accent strip */}
      <div className="accent-bar" />

      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-navy">
            Start a Meeting
          </CardTitle>
          <CardDescription className="text-navy/60">
            Add attendees to see the real-time cost.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/70"
            >
              Meeting Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Weekly Standup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-mauve-light/60 text-navy placeholder:text-navy/40 focus-visible:border-pink focus-visible:ring-pink/20"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/70">
              Attendees
            </Label>

            <div className="space-y-2 rounded-xl bg-mauve-pale/30 p-3">
              {attendees.map((attendee, index) => (
                <AttendeeInput
                  key={attendee.id}
                  attendee={attendee}
                  onChange={(updated) => updateAttendee(index, updated)}
                  onRemove={() => removeAttendee(index)}
                  canRemove={attendees.length > 1}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttendee}
              className="border-mauve border-dashed text-navy hover:border-pink hover:bg-pink/5 hover:text-pink"
            >
              <Plus className="size-4" />
              Add Attendee
            </Button>
          </div>

          {/* Cost summary pill */}
          <div className="flex items-center justify-between rounded-xl bg-navy/5 px-4 py-2.5">
            <span className="text-sm text-navy/60">
              {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}
            </span>
            <span className="cost-ticker text-lg font-bold text-navy">
              {formatCost(costPerMinute)}
              <span className="ml-0.5 text-xs font-normal text-navy/50">/min</span>
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="hover-lift w-full bg-navy text-white shadow-md hover:bg-navy-light"
            size="lg"
            disabled={!title.trim() || attendees.every((a) => a.hourlyRate <= 0)}
          >
            Start Meeting
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
