import {inngest} from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.action";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { formatDateToday } from "../utils";

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    async ({event, step}) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk Tolerance: ${event.data.riskTolerance}
            - Preferred Industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('gemini-welcome-intro', {
            model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
            body: {
                contents: [
                    {role: 'user', 
                        parts: [
                            {text: prompt}
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Signalist! You now have the tools to track markates and make samarter investment decisions.';

            // Email sending logic here
            return await sendWelcomeEmail({
                email: event.data.email,
                name: event.data.name,
                intro: introText
            });

        })
        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }

)

export const sendDailyNewsSummary = inngest.createFunction(
    {id: 'daily-news-summary'},
    [{event: 'app/send.daily.news'}, {cron: '0 12 * * *'}],
    async ({step}) => {
        // Step 1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if(!users || users.length === 0) {
            return {
                success: false,
                message: 'No users found for news delivery'
            };
        }
        
        // Step 2: For each user, fetch personalized news based on their watchlist
        const newsResults = await step.run('fetch-user-news', async () => {
            const userNewsData: Array<{
                user: typeof users[0];
                symbols: string[];
                news: MarketNewsArticle[];
            }> = [];

            let generalNews: MarketNewsArticle[] | null = null;

            for (const user of users) {
                try {
                    // Get user's watchlist symbols
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    
                    // Fetch news (up to 6 articles)
                    // If user has watchlist symbols, fetch personalized news
                    // Otherwise fetch general market news (cached after first call)
                    let news: MarketNewsArticle[];
                    if (symbols.length > 0) {
                        news = await getNews(symbols);
                    } else {
                        if (generalNews === null) {
                            generalNews = await getNews();
                        }
                        news = generalNews;
                    }

                    userNewsData.push({
                        user,
                        symbols,
                        news,
                    });
                } catch (error) {
                       console.error(`Error fetching news for userId=${user.id}:`, error);
                    // Continue with next user
                    continue;
                }
            }

            return userNewsData;
        });

        // Step 3: (Placeholder) Summarize news using AI
        const userNewsSummaries : {user : User, newsContent: string | null}[] = [];

        for(const {user, news} of newsResults){
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news, null ,2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),body: {
                        contents: [
                            {role: 'user', parts:[{text: prompt}]}
                        ]
                    }
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No news available today.';
                userNewsSummaries.push({user, newsContent});
            }
            catch(error){
                console.error(`Error summarizing news for user ${user.email}:`, error);
                userNewsSummaries.push({user, newsContent: null});
            }
        }

        // Step 4: (Placeholder) Send email with news summary
        await step.run('send-news-emails', async () => {
            await Promise.all(userNewsSummaries.map(async ({user, newsContent}) => { 
                if(!newsContent) return false;

                return await sendNewsSummaryEmail(
                    user.email,
                    formatDateToday(),
                    newsContent
                );
            }));
        });

        return {
            success: true,
            message: `Daily news summary processed for ${newsResults.length} users`,
            usersProcessed: newsResults.length,
        }
    }
)