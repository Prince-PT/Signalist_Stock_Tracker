import TradingViewWidgets from "@/components/TradingViewWidgets";
import WatchlistButton from "@/components/WatchlistButton";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { isInWatchlistByEmail } from "@/lib/actions/watchlist.actions";
import { getCompanyName } from "@/lib/actions/finnhub.actions";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

const SCRIPT_BASE =
  "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email ?? "";

  const [inWatchlist, companyName] = await Promise.all([
    isInWatchlistByEmail(email, symbol),
    getCompanyName(symbol),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}symbol-info.js`}
          config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
          height={170}
        />
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
          config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
          height={600}
        />
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}advanced-chart.js`}
          config={BASELINE_WIDGET_CONFIG(symbol)}
          height={600}
        />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        <WatchlistButton
          userEmail={email}
          symbol={symbol}
          company={companyName}
          initialIsInWatchlist={inWatchlist}
        />
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}technical-analysis.js`}
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
          height={400}
        />
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}symbol-profile.js`}
          config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
          height={440}
        />
        <TradingViewWidgets
          scriptUrl={`${SCRIPT_BASE}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
          height={464}
        />
      </div>
    </div>
  );
}
