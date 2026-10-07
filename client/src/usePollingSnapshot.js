import { useCallback, useEffect, useRef, useState } from "react";
import { getCachedSnapshot, saveCachedSnapshot } from "@/lib/db";

export function usePollingSnapshot({ fetcher, intervalMs = 5000, enabled = true, cacheKey = "" }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const runningRef = useRef(false);

  // Load from Dexie cache on initial mount for instant 0ms offline rendering
  useEffect(() => {
    if (!cacheKey) return;
    let isCurrent = true;

    getCachedSnapshot(cacheKey).then((cached) => {
      if (isCurrent && cached) {
        setSnapshot((current) => current || cached);
        setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [cacheKey]);

  const refetch = useCallback(async () => {
    if (!enabled || runningRef.current) return;
    runningRef.current = true;
    try {
      // If offline, do not attempt network fetch
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }
      const data = await fetcher();
      setSnapshot(data);
      setError("");
      if (cacheKey && data) {
        saveCachedSnapshot(cacheKey, data);
      }
    } catch (err) {
      // Don't show hard failure if we already have data loaded from cache
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
      runningRef.current = false;
    }
  }, [cacheKey, enabled, fetcher]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
    const id = window.setInterval(refetch, intervalMs);
    const onFocus = () => refetch();
    const onVisibility = () => {
      if (!document.hidden) refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, refetch]);

  return { snapshot, setSnapshot, loading, error, refetch };
}
