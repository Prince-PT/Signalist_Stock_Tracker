"use client";

import { useCallback, useState, useTransition } from "react";
import { Star } from "lucide-react";
import {
  addToWatchlistByEmail,
  removeFromWatchlistByEmail,
} from "@/lib/actions/watchlist.actions";
import {
  dispatchWatchlistChange,
  useWatchlistSync,
} from "@/hooks/useWatchlistSync";

interface WatchlistButtonProps {
  userEmail: string;
  symbol: string;
  company: string;
  initialIsInWatchlist: boolean;
}

export default function WatchlistButton({
  userEmail,
  symbol,
  company,
  initialIsInWatchlist,
}: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [isPending, startTransition] = useTransition();

  // Listen for changes from other components (e.g. search bar star)
  useWatchlistSync(
    useCallback(
      (detail) => {
        if (detail.symbol.toUpperCase() === symbol.toUpperCase()) {
          setIsInWatchlist(detail.action === "added");
        }
      },
      [symbol],
    ),
  );

  const toggleWatchlist = () => {
    startTransition(async () => {
      if (isInWatchlist) {
        const success = await removeFromWatchlistByEmail(userEmail, symbol);
        if (success) {
          setIsInWatchlist(false);
          dispatchWatchlistChange({ symbol, company, action: "removed" });
        }
      } else {
        const success = await addToWatchlistByEmail(userEmail, symbol, company);
        if (success) {
          setIsInWatchlist(true);
          dispatchWatchlistChange({ symbol, company, action: "added" });
        }
      }
    });
  };

  return (
    <button
      onClick={toggleWatchlist}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isInWatchlist
          ? "bg-yellow-500 text-white hover:bg-yellow-600"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <Star className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`} />
      {isPending
        ? "Updating..."
        : isInWatchlist
          ? "Remove from Watchlist"
          : "Add to Watchlist"}
    </button>
  );
}
