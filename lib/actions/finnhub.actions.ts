  'use server';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

/**
 * Generic fetch function for Finnhub API
 * @param url - Full URL to fetch from
 * @param revalidateSeconds - Optional cache revalidation time
 */
async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const options: RequestInit = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Validate a news article has required fields
 */
function isValidArticle(article: RawNewsArticle): boolean {
    return !!(
        article.headline &&
        article.summary &&
        article.source &&
        article.url &&
        article.datetime
    );
}

/**
 * Format a raw article into MarketNewsArticle
 */
function formatArticle(article: RawNewsArticle): MarketNewsArticle {
    return {
        id: article.id,
        headline: article.headline || '',
        summary: article.summary || '',
        source: article.source || '',
        url: article.url || '',
        datetime: article.datetime || 0,
        category: article.category || '',
        related: article.related || '',
        image: article.image,
    };
}

/**
 * Get date range for last 5 days
 */
function getDateRange() {
    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 5);

    return {
        from: fiveDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
    };
}

/**
 * Fetch news articles for given symbols or general market news
 * @param symbols - Optional array of stock symbols
 * @returns Array of up to 6 news articles
 */
export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        if (!FINNHUB_API_KEY) {
            throw new Error('FINNHUB_API_KEY is not configured');
        }

        // If symbols provided, fetch company-specific news
        if (symbols && symbols.length > 0) {
            const cleanSymbols = symbols
                .map(s => s.trim().toUpperCase())
                .filter(s => s.length > 0);

            if (cleanSymbols.length === 0) {
                throw new Error('No valid symbols provided');
            }

            const { from, to } = getDateRange();
            const collectedArticles: MarketNewsArticle[] = [];
            const maxRounds = 6;
            let currentRound = 0;

            // Round-robin through symbols, taking one article per round
            while (collectedArticles.length < 6 && currentRound < maxRounds) {
                for (const symbol of cleanSymbols) {
                    if (collectedArticles.length >= 6) break;

                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url);

                        // Find the first valid article for this round
                        const validArticle = articles
                            .slice(currentRound, currentRound + 1)
                            .find(isValidArticle);

                        if (validArticle) {
                            collectedArticles.push(formatArticle(validArticle));
                        }
                    } catch (error) {
                        console.error(`Error fetching news for ${symbol}:`, error);
                        continue;
                    }
                }
                currentRound++;
            }

            // Sort by datetime (newest first)
            return collectedArticles.sort((a, b) => b.datetime - a.datetime);
        }

        // No symbols - fetch general market news
        const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
        const articles = await fetchJSON<RawNewsArticle[]>(url);

        // Deduplicate by id, url, and headline
        const seen = new Set<string>();
        const deduplicated = articles.filter(article => {
            const key = `${article.id}-${article.url}-${article.headline}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return isValidArticle(article);
        });

        // Take top 6 and format
        return deduplicated.slice(0, 6).map(formatArticle);

    } catch (error) {
        console.error('Error in getNews:', error);
        throw new Error('Failed to fetch news');
    }
}
