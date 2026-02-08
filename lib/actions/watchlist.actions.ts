'use server';

import { connectToDatabase } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";

/**
 * Get all watchlist symbols for a user by their email
 * @param email - User's email address
 * @returns Array of stock symbols or empty array if user not found
 */
export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    if(!email) return [];
    try {
        // Connect to database
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        
        if (!db) {
            throw new Error("Database connection is not established");
        }

        // Find user by email in the Better Auth users collection
        const user = await db.collection('user').findOne<{ id: string; _id: unknown; email: string }>({ email },);


        // If user not found, return empty array
        if (!user) {
            console.log('No user found for provided email.');
            return [];
        }

        // Get the userId (prefer id field, fallback to _id)
        const userId = (user.id as string) || String(user._id || '');
        if(!userId) return [];
         
        const items = await Watchlist.find({ userId }, {symbol: 1}).lean();
        return items.map((i) => String(i.symbol));


    } catch (error) {
        console.error("Error fetching watchlist symbols by email:", error);
        return [];
    }
};
