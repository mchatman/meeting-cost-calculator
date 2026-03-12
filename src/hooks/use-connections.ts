"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectionStatus } from "@/lib/types";
import {
  checkGoogleConnection,
  checkZoomConnection,
  clearConnectionCache,
} from "@/lib/api-client";

export function useConnections(): ConnectionStatus & { refresh: () => void } {
  const [google, setGoogle] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    const [g, z] = await Promise.all([
      checkGoogleConnection(),
      checkZoomConnection(),
    ]);
    setGoogle(g);
    setZoom(z);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    clearConnectionCache();
    check();
  }, [check]);

  useEffect(() => {
    check();

    // Detect OAuth redirect: ?connected=google or ?connected=zoom
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected === "google" || connected === "zoom") {
      clearConnectionCache();
      // Small delay to let cookies settle
      setTimeout(() => check(), 500);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [check]);

  return { google, zoom, loading, refresh };
}
