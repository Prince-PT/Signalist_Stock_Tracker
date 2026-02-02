#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run this to verify your MongoDB connection is working properly
 * 
 * Usage: node scripts/test-db.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function testDatabaseConnection() {
  console.log("🔄 Starting database connection test...\n");

  // Step 1: Check if MONGODB_URI is defined
  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI is not defined");
    console.log(
      "   Please create a .env.local file with your MongoDB connection string"
    );
    console.log("   See .env.local.example for the format\n");
    process.exit(1);
  }

  console.log("✅ MONGODB_URI is defined");
  console.log(`   URI: ${MONGODB_URI.substring(0, 50)}...\n`);

  try {
    // Step 2: Connect to MongoDB
    console.log("🔗 Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("✅ Successfully connected to MongoDB\n");

    // Step 3: Check connection status
    const state = mongoose.connection.readyState;
    const states = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };
    console.log(`📊 Connection State: ${states[state]} (${state})`);

    // Step 4: Get database information
    const db = mongoose.connection.db;
    if (db) {
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();

      console.log("\n📈 Database Information:");
      const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "trading_platform";
      console.log(`   Database Name: ${dbName}`);
      console.log(`   Server: ${serverStatus.host || "N/A"}`);
      console.log(
        `   Uptime: ${serverStatus.uptime ? Math.floor(serverStatus.uptime / 60) + " minutes" : "N/A"}`
      );

      // Step 5: List collections
      const collections = await db.listCollections().toArray();
      console.log(`\n📦 Collections Found: ${collections.length}`);
      if (collections.length > 0) {
        collections.forEach((collection) => {
          console.log(`   - ${collection.name}`);
        });
      } else {
        console.log("   (No collections yet)");
      }
    }

    console.log("\n✅ All tests passed! Your database connection is working.\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed:");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      if (error.message.includes("ECONNREFUSED")) {
        console.log(
          "\n   💡 Tip: Make sure MongoDB is running locally, or your connection URI is correct"
        );
      }
      if (error.message.includes("authentication failed")) {
        console.log(
          "\n   💡 Tip: Check your username and password in MONGODB_URI"
        );
      }
      if (error.message.includes("getaddrinfo ENOTFOUND")) {
        console.log("\n   💡 Tip: Check if the MongoDB server address is reachable");
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testDatabaseConnection();
