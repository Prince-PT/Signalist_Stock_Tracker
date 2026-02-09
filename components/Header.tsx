import Link from "next/link";
import Image from "next/image";
import Navitems from "./NavItems";
import UserDropdown from "./UserDropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

const Header = async ({ user }: { user: User }) => {
  const [stocks, watchlistSymbols] = await Promise.all([
    searchStocks(),
    getWatchlistSymbolsByEmail(user.email),
  ]);

  const watchlistSet = new Set(watchlistSymbols.map((s) => s.toUpperCase()));
  const initialStocks = stocks.map((stock) => ({
    ...stock,
    isInWatchlist: watchlistSet.has(stock.symbol.toUpperCase()),
  }));

  return (
    <header className="sticky top-0 header">
      <div className=" container header-wrapper">
        <Link href="/">
          <Image
            src="assets/icons/logo.svg"
            alt="Signalist Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          {/* Navitems */}
          <Navitems initialStocks={initialStocks} userEmail={user.email} />
        </nav>
        {/* User Dropdown */}
        <UserDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  );
};

export default Header;
