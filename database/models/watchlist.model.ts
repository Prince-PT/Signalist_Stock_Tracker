import { Schema, model, models, Document } from "mongoose";

export interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>({
    userId: {
        type: String,
        required: [true, "User ID is required"],
        index: true,
    },
    symbol: {
        type: String,
        required: [true, "Symbol is required"],
        uppercase: true,
        trim: true,
    },
    company: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index: prevent duplicate symbols per user
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const Watchlist = models?.Watchlist || model<WatchlistItem>("Watchlist", WatchlistSchema);

export default Watchlist;
