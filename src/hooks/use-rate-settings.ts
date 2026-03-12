"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getDefaultRate,
  setDefaultRate as persistRate,
} from "@/lib/rate-settings";

export function useRateSettings() {
  const [rate, setRateState] = useState(75);

  useEffect(() => {
    setRateState(getDefaultRate());
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(newRate);
    persistRate(newRate);
  }, []);

  return { rate, setRate };
}
