"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Star, TrendingUp, Trash2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getWatchlistByEmail,
  removeFromWatchlistByEmail,
} from "@/lib/actions/watchlist.actions";
import {
  dispatchWatchlistChange,
  useWatchlistSync,
} from "@/hooks/useWatchlistSync";

interface WatchlistItem {
  symbol: string;
  company: string;
}

export default function WatchlistDropdown({
  userEmail,
}: {
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync watchlist from other components (search bar, stock page button)
  useWatchlistSync(
    useCallback((detail) => {
      if (detail.action === "added") {
        setWatchlist((prev) => {
          if (
            prev.some(
              (item) =>
                item.symbol.toUpperCase() === detail.symbol.toUpperCase(),
            )
          )
            return prev;
          return [
            ...prev,
            { symbol: detail.symbol.toUpperCase(), company: detail.company },
          ];
        });
      } else {
        setWatchlist((prev) =>
          prev.filter(
            (item) => item.symbol.toUpperCase() !== detail.symbol.toUpperCase(),
          ),
        );
      }
    }, []),
  );

  // Fetch watchlist when the popover opens
  useEffect(() => {
    if (!open || !userEmail) return;

    startTransition(async () => {
      try {
        const data = await getWatchlistByEmail(userEmail);
        setWatchlist(data);
      } catch {
        setWatchlist([]);
      } finally {
        setHasFetched(true);
      }
    });
  }, [open, userEmail]);

  const handleRemove = (symbol: string) => {
    const removed = watchlist.find((item) => item.symbol === symbol);
    startTransition(async () => {
      const success = await removeFromWatchlistByEmail(userEmail, symbol);
      if (success) {
        setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
        dispatchWatchlistChange({
          symbol,
          company: removed?.company ?? symbol,
          action: "removed",
        });
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative hover:text-yellow-500 transition-colors cursor-pointer flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>Watchlist</span>
          {watchlist.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-yellow-500 text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {watchlist.length}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        sideOffset={12}
        className="w-80 max-h-96 overflow-y-auto p-0 bg-gray-900 border-gray-700"
      >
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200">My Watchlist</h3>
          <span className="text-xs text-gray-500">
            {watchlist.length} stock{watchlist.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isPending && !hasFetched ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Star className="h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">Your watchlist is empty</p>
            <p className="text-xs text-gray-500 mt-1">
              Search for stocks and add them to your watchlist
            </p>
          </div>
        ) : (
          <ul className="py-1">
            {watchlist.map((item) => (
              <li
                key={item.symbol}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors group"
              >
                <Link
                  href={`/stocks/${item.symbol}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <TrendingUp className="h-4 w-4 text-yellow-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {item.symbol}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.company}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.symbol)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1 rounded cursor-pointer"
                  title={`Remove ${item.symbol}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
