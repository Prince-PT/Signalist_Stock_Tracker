# Database Connection Testing Guide

## Step-by-Step Instructions to Test Your Database Connection

### Method 1: Using the Test Script (Node.js)

**Prerequisites:**
- Node.js installed
- MongoDB connection string ready
- `.env.local` file created

**Steps:**

1. **Create your `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your MongoDB URI:**
   - For **MongoDB Atlas** (cloud):
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trading_platform?retryWrites=true&w=majority
     ```
   - For **Local MongoDB**:
     ```
     MONGODB_URI=mongodb://localhost:27017/trading_platform
     ```

3. **Install `dotenv` package** (if not already installed):
   ```bash
   npm install dotenv
   ```

4. **Run the test script:**
   ```bash
   npx ts-node scripts/test-db.ts
   ```

**Expected Output:**
```
🔄 Starting database connection test...

✅ MONGODB_URI is defined
   URI: mongodb+srv://your_username:your_password@...

🔗 Attempting to connect to MongoDB...
✅ Successfully connected to MongoDB

📊 Connection State: Connected (1)

📈 Database Information:
   Database Name: trading_platform
   Server: cluster0-shard-00-00.xxxxx.mongodb.net
   Uptime: 120 minutes

📦 Collections Found: 0
   (No collections yet)

✅ All tests passed! Your database connection is working.

🔌 Disconnected from MongoDB
```

---

### Method 2: Using Browser/HTTP Request

**Steps:**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Make a request to the health endpoint:**
   - Using `curl`:
     ```bash
     curl http://localhost:3000/api/health/db
     ```
   
   - Using a browser:
     ```
     http://localhost:3000/api/health/db
     ```
   
   - Using VS Code REST Client extension:
     ```
     GET http://localhost:3000/api/health/db
     ```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "connectionState": "Connected",
  "connectionStateCode": 1,
  "databaseInfo": {
    "name": "trading_platform",
    "host": "cluster0-shard-00-00.xxxxx.mongodb.net",
    "uptime": 120,
    "collectionsCount": 0,
    "collections": []
  },
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "connect ECONNREFUSED 127.0.0.1:27017",
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

---

### Method 3: Verify Manually in Your App

You can test the connection by importing and using it in your API routes or server components:

```typescript
import { connectToDatabase } from "@/database/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Troubleshooting Common Issues

### ❌ Error: "MONGODB_URI is not defined"
**Solution:** 
- Create `.env.local` file in the project root
- Add your MongoDB connection string to it

### ❌ Error: "ECONNREFUSED"
**Solution:**
- Make sure MongoDB is running locally (if using local MongoDB)
- Check that the connection URI is correct
- Verify network connectivity if using cloud MongoDB (MongoDB Atlas)

### ❌ Error: "authentication failed"
**Solution:**
- Check your username and password in the MONGODB_URI
- Ensure special characters in password are URL-encoded
- Verify the user has access to the database

### ❌ Error: "ENOTFOUND" or "getaddrinfo ENOTFOUND"
**Solution:**
- Check the MongoDB server hostname/address
- Verify your internet connection if using cloud MongoDB
- Check firewall settings if using local MongoDB

### ❌ Error: "MongoNetworkError"
**Solution:**
- For MongoDB Atlas: Check IP whitelist and allow your current IP
- Verify cluster is active
- Check connection string format

---

## MongoDB Atlas Setup (if needed)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user with username and password
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Click "Connect" and copy the connection string
6. Replace `<username>` and `<password>` with your credentials
7. Paste into `.env.local`

---

## Local MongoDB Setup (Alternative)

1. **Install MongoDB:**
   ```bash
   # macOS with Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Windows: Download installer from https://www.mongodb.com/try/download/community
   
   # Linux (Ubuntu):
   sudo apt-get install -y mongodb
   sudo systemctl start mongodb
   ```

2. **Use connection string:**
   ```
   MONGODB_URI=mongodb://localhost:27017/trading_platform
   ```

3. **Verify it's running:**
   ```bash
   mongosh
   # Should open MongoDB shell if running
   ```
