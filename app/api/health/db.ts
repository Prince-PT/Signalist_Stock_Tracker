import { connectToDatabase } from "@/database/mongoose";
import mongoose, { Connection } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to database
    await connectToDatabase();

    // Get connection info
    const state = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };

    const db = mongoose.connection.db;
    let dbInfo: {
      name?: string;
      host?: string;
      uptime?: number | string;
      collectionsCount?: number;
      collections?: string[];
    } = {};

    if (db) {
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();

      dbInfo = {
        name: (db as { name?: string }).name || "trading_platform",
        host: serverStatus.host || "N/A",
        uptime: serverStatus.uptime
          ? Math.floor(serverStatus.uptime / 60)
          : "N/A",
      };

      // List collections
      const collections = await db.listCollections().toArray();
      dbInfo.collectionsCount = collections.length;
      dbInfo.collections = collections.map((c) => c.name);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Database connection successful",
        connectionState: states[state],
        connectionStateCode: state,
        databaseInfo: dbInfo,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
