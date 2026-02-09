"use client";

import { useEffect, useCallback } from "react";

export type WatchlistChangeDetail = {
  symbol: string;
  company: string;
  action: "added" | "removed";
};

const EVENT_NAME = "watchlist-change";

/**
 * Dispatch a global watchlist change event so every component stays in sync.
 */
export function dispatchWatchlistChange(detail: WatchlistChangeDetail) {
  window.dispatchEvent(new CustomEvent<WatchlistChangeDetail>(EVENT_NAME, { detail }));
}

/**
 * Subscribe to watchlist change events fired by *other* components.
 */
export function useWatchlistSync(handler: (detail: WatchlistChangeDetail) => void) {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const listener = (e: Event) => {
      stableHandler((e as CustomEvent<WatchlistChangeDetail>).detail);
    };
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
  }, [stableHandler]);
}
