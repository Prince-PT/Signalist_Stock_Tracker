"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import {
  addToWatchlistByEmail,
  removeFromWatchlistByEmail,
  getWatchlistSymbolsByEmail,
} from "@/lib/actions/watchlist.actions";
import {
  dispatchWatchlistChange,
  useWatchlistSync,
} from "@/hooks/useWatchlistSync";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
  userEmail,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sync watchlist status from other components
  useWatchlistSync(
    useCallback((detail) => {
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol.toUpperCase() === detail.symbol.toUpperCase()
            ? { ...s, isInWatchlist: detail.action === "added" }
            : s,
        ),
      );
    }, []),
  );

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true);
    try {
      const [results, watchlistSymbols] = await Promise.all([
        searchStocks(searchTerm.trim()),
        userEmail ? getWatchlistSymbolsByEmail(userEmail) : Promise.resolve([]),
      ]);
      const watchlistSet = new Set(
        watchlistSymbols.map((s) => s.toUpperCase()),
      );
      setStocks(
        results.map((s) => ({
          ...s,
          isInWatchlist: watchlistSet.has(s.symbol.toUpperCase()),
        })),
      );
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  const handleToggleWatchlist = (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userEmail) return;

    setPendingSymbol(stock.symbol);
    startTransition(async () => {
      try {
        if (stock.isInWatchlist) {
          const success = await removeFromWatchlistByEmail(
            userEmail,
            stock.symbol,
          );
          if (success) {
            setStocks((prev) =>
              prev.map((s) =>
                s.symbol === stock.symbol ? { ...s, isInWatchlist: false } : s,
              ),
            );
            dispatchWatchlistChange({
              symbol: stock.symbol,
              company: stock.name,
              action: "removed",
            });
          }
        } else {
          const success = await addToWatchlistByEmail(
            userEmail,
            stock.symbol,
            stock.name,
          );
          if (success) {
            setStocks((prev) =>
              prev.map((s) =>
                s.symbol === stock.symbol ? { ...s, isInWatchlist: true } : s,
              ),
            );
            dispatchWatchlistChange({
              symbol: stock.symbol,
              company: stock.name,
              action: "added",
            });
          }
        }
      } finally {
        setPendingSymbol(null);
      }
    });
  };

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="search-input"
          />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? "Search results" : "Popular stocks"}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock) => (
                <li key={stock.symbol} className="search-item">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="search-item-name">{stock.name}</div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} | {stock.exchange} | {stock.type}
                      </div>
                    </div>
                    {userEmail && (
                      <button
                        onClick={(e) => handleToggleWatchlist(e, stock)}
                        disabled={pendingSymbol === stock.symbol}
                        className="p-1 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                        title={
                          stock.isInWatchlist
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }
                      >
                        <Star
                          className={`h-4 w-4 transition-colors ${
                            pendingSymbol === stock.symbol
                              ? "text-gray-500 animate-pulse"
                              : stock.isInWatchlist
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-500 hover:text-yellow-500"
                          }`}
                        />
                      </button>
                    )}
                    {!userEmail && <Star className="h-4 w-4 text-gray-500" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
