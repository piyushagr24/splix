import { useCallback, useEffect, useRef, useState } from "react";

export function usePollingSnapshot({ fetcher, intervalMs = 5000, enabled = true }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const runningRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!enabled || runningRef.current) return;
    runningRef.current = true;
    try {
      const data = await fetcher();
      setSnapshot(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
      runningRef.current = false;
    }
  }, [enabled, fetcher]);

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

