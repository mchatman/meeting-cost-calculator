"use client";

import { Attendee } from "@/lib/types";
import { SALARY_PRESETS, CUSTOM_ROLE } from "@/lib/salary-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AttendeeInputProps {
  attendee: Attendee;
  onChange: (updated: Attendee) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function AttendeeInput({
  attendee,
  onChange,
  onRemove,
  canRemove,
}: AttendeeInputProps) {
  const isCustom =
    attendee.role === CUSTOM_ROLE ||
    !SALARY_PRESETS.some((p) => p.role === attendee.role);

  function handleRoleChange(value: string | null) {
    if (!value) return;
    if (value === CUSTOM_ROLE) {
      onChange({ ...attendee, role: CUSTOM_ROLE, hourlyRate: 0 });
    } else {
      const preset = SALARY_PRESETS.find((p) => p.role === value);
      if (preset) {
        onChange({ ...attendee, role: preset.role, hourlyRate: preset.hourlyRate });
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Select
          value={isCustom ? CUSTOM_ROLE : attendee.role}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger className="border-mauve-light w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {SALARY_PRESETS.map((preset) => (
              <SelectItem key={preset.role} value={preset.role}>
                {preset.role} (${preset.hourlyRate}/hr)
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value={CUSTOM_ROLE}>Custom role</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-32">
        <Input
          type="number"
          min={0}
          placeholder="$/hr"
          value={attendee.hourlyRate || ""}
          onChange={(e) =>
            onChange({
              ...attendee,
              hourlyRate: parseFloat(e.target.value) || 0,
            })
          }
          disabled={!isCustom}
          className="border-mauve-light"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove attendee"
        className="text-navy/40 hover:text-pink hover:bg-pink/10"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
