'use server';

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";

/**
 * Helper to resolve a userId from email
 */
async function resolveUserId(email: string): Promise<string | null> {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Database connection is not established");

    const user = await db.collection('user').findOne<{ id: string; _id: unknown; email: string }>({ email });

    if (!user) {
        console.log('No user found for provided email.');
        return null;
    }

    return (user.id as string) || String(user._id || '') || null;
}

/**
 * Get all watchlist symbols for a user by their email
 * @param email - User's email address
 * @returns Array of stock symbols or empty array if user not found
 */
export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    if (!email) return [];
    try {
        const userId = await resolveUserId(email);
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (error) {
        console.error("Error fetching watchlist symbols by email:", error);
        return [];
    }
};

/**
 * Get full watchlist items (symbol + company) for a user by email
 */
export const getWatchlistByEmail = async (email: string): Promise<{ symbol: string; company: string }[]> => {
    if (!email) return [];
    try {
        const userId = await resolveUserId(email);
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1, company: 1 }).lean();
        return items.map((i) => ({ symbol: String(i.symbol), company: String(i.company) }));
    } catch (error) {
        console.error("Error fetching watchlist by email:", error);
        return [];
    }
};

/**
 * Remove a stock from a user's watchlist by email and symbol
 */
export const removeFromWatchlistByEmail = async (email: string, symbol: string): Promise<boolean> => {
    if (!email || !symbol) return false;
    try {
        const userId = await resolveUserId(email);
        if (!userId) return false;

        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
        return true;
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return false;
    }
};

/**
 * Add a stock to a user's watchlist by email
 */
export const addToWatchlistByEmail = async (
    email: string,
    symbol: string,
    company: string
): Promise<boolean> => {
    if (!email || !symbol || !company) return false;
    try {
        const userId = await resolveUserId(email);
        if (!userId) return false;

        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company,
        });
        return true;
    } catch (error: unknown) {
        // Duplicate key means it already exists – treat as success
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
            return true;
        }
        console.error("Error adding to watchlist:", error);
        return false;
    }
};

/**
 * Check if a stock is in a user's watchlist
 */
export const isInWatchlistByEmail = async (email: string, symbol: string): Promise<boolean> => {
    if (!email || !symbol) return false;
    try {
        const userId = await resolveUserId(email);
        if (!userId) return false;

        const item = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() }).lean();
        return !!item;
    } catch (error) {
        console.error("Error checking watchlist:", error);
        return false;
    }
};
