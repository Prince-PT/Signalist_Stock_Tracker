<p align="center">
  <img src="public/assets/icons/logo.svg" alt="Signalist Logo" width="280" />
</p>

<p align="center">
  <strong>Track real-time stock prices, get personalized alerts, and explore detailed company insights — all in one place.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
</p>

---

## 📸 Preview

<p align="center">
  <img src="public/assets/images/dashboard-preview.png" alt="Signalist Dashboard" width="100%" />
</p>

---

## 📋 Table of Contents

- [📸 Preview](#-preview)
- [📋 Table of Contents](#-table-of-contents)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [🏗 Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🔐 Environment Variables](#-environment-variables)
- [📁 Project Structure](#-project-structure)
- [🔄 Key Workflows](#-key-workflows)
  - [🔍 Stock Search](#-stock-search)
  - [⭐ Watchlist Sync](#-watchlist-sync)
  - [📧 AI-Powered Emails](#-ai-powered-emails)
- [📜 Scripts](#-scripts)
- [📄 License](#-license)

---

## ✨ Features

| Area | Details |
|---|---|
| **Dashboard** | Market overview, stock heatmap, top stories, and market quotes via embedded TradingView widgets |
| **Stock Details** | Interactive candlestick & baseline charts, technical analysis, company profile, and financials per symbol |
| **Search** | Global stock search (⌘K / Ctrl+K) powered by the Finnhub API with debounced results |
| **Watchlist** | Add / remove stocks from a personal watchlist — synced in real-time across the search bar, stock page, and header dropdown |
| **Authentication** | Email & password sign-up / sign-in with session management via [Better Auth](https://www.better-auth.com/) |
| **Personalized Onboarding** | Collects investment goals, risk tolerance, preferred industry, and country — then sends an AI-generated welcome email |
| **Daily News Summary** | Cron-based Inngest function fetches watchlist-relevant news, summarizes it with Gemini AI, and emails it to each user |
| **Email Delivery** | Transactional emails (welcome + daily digest) sent via Nodemailer / Gmail SMTP |

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — App Router, Server Components, Server Actions
- **[React 19](https://react.dev/)** — `useTransition`, `useCallback`, hooks-based architecture
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling with `tw-animate-css`
- **[Radix UI](https://www.radix-ui.com/)** — Accessible primitives (Dialog, Dropdown, Popover, Select, Avatar)
- **[shadcn/ui](https://ui.shadcn.com/)** — Pre-built component library on top of Radix
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[TradingView Widgets](https://www.tradingview.com/widget/)** — Embedded financial charts

### Backend
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** + **[Mongoose 9](https://mongoosejs.com/)** — Database & ODM
- **[Better Auth](https://www.better-auth.com/)** — Authentication framework with MongoDB adapter
- **[Inngest](https://www.inngest.com/)** — Background jobs & cron (welcome email, daily news digest)
- **[Google Gemini AI](https://ai.google.dev/)** — Generates personalized email content via `gemini-2.5-flash-lite`
- **[Finnhub API](https://finnhub.io/)** — Stock search, company profiles, and market news
- **[Nodemailer](https://nodemailer.com/)** — Email transport (Gmail SMTP)

---

## 🏗 Architecture

```
Browser
  │
  ├── Next.js App Router (RSC + Client Components)
  │     ├── Server Actions  →  MongoDB (Mongoose)
  │     ├── Server Actions  →  Finnhub API
  │     └── Middleware       →  Better Auth session check
  │
  ├── Inngest (Background)
  │     ├── app/user.created  →  Gemini AI  →  Welcome Email
  │     └── cron 0 12 * * *   →  Finnhub News  →  Gemini AI  →  Daily Digest Email
  │
  └── TradingView Embedded Widgets (client-side iframes)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **MongoDB Atlas** cluster (or local MongoDB)
- API keys for **Finnhub**, **Gemini**, and a **Gmail App Password**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/trading_platform.git
cd trading_platform

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
# Then fill in the values (see section below)

# 4. Start the dev server
npm run dev

# 5. (Optional) Start the Inngest dev server for background jobs
npx inngest-cli@latest dev
```

The app will be running at **http://localhost:3000**.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
NODE_ENV=development

NEXT_PUBLIC_BASE_URL=http://localhost:3000
MONGODB_URI=<your-mongodb-connection-string>

BETTER_AUTH_SECRET=<random-secret-string>
BETTER_AUTH_URL=http://localhost:3000

GEMINI_API_KEY=<your-google-gemini-api-key>

NODEMAILER_USER=<your-gmail-address>
NODEMAILER_PASSWORD=<your-gmail-app-password>

FINNHUB_API_KEY=<your-finnhub-api-key>
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | Secret for session signing (generate a random 32+ char string) |
| `BETTER_AUTH_URL` | Base URL of the app |
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini models |
| `NODEMAILER_USER` | Gmail address used to send emails |
| `NODEMAILER_PASSWORD` | Gmail [App Password](https://support.google.com/accounts/answer/185833) (not your regular password) |
| `FINNHUB_API_KEY` | Free API key from [finnhub.io](https://finnhub.io/) |

---

## 📁 Project Structure

```
trading_platform/
├── app/
│   ├── (auth)/                  # Auth pages (sign-in, sign-up)
│   ├── (root)/                  # Authenticated pages
│   │   ├── page.tsx             # Dashboard — market overview
│   │   └── stocks/[symbol]/     # Stock detail page
│   ├── api/inngest/             # Inngest webhook route
│   ├── layout.tsx               # Root layout (fonts, toaster)
│   └── globals.css              # Tailwind + theme variables
│
├── components/
│   ├── Header.tsx               # Sticky header with nav
│   ├── NavItems.tsx             # Navigation links (Dashboard, Search, Watchlist)
│   ├── SearchCommand.tsx        # ⌘K search dialog with watchlist stars
│   ├── WatchlistButton.tsx      # Add/remove watchlist on stock page
│   ├── WatchlistDropdown.tsx    # Header watchlist popover
│   ├── TradingViewWidgets.tsx   # Reusable TradingView embed
│   ├── UserDropdown.tsx         # User avatar menu
│   ├── forms/                   # Form field components
│   └── ui/                      # shadcn/ui primitives
│
├── database/
│   ├── mongoose.ts              # MongoDB connection singleton
│   └── models/
│       └── watchlist.model.ts   # Watchlist Mongoose schema
│
├── hooks/
│   ├── useDebounce.ts           # Debounce hook for search
│   ├── useTradingViewWidget.tsx # TradingView script loader
│   └── useWatchlistSync.ts     # Cross-component watchlist event bus
│
├── lib/
│   ├── constants.ts             # Nav items, widget configs, form options
│   ├── utils.ts                 # Utility helpers (cn, date formatting)
│   ├── actions/                 # Server Actions
│   │   ├── auth.actions.ts      # Sign-up, sign-in, sign-out
│   │   ├── finnhub.actions.ts   # Stock search, news, company profile
│   │   ├── user.action.ts       # User queries
│   │   └── watchlist.actions.ts # CRUD for watchlist
│   ├── better-auth/auth.ts      # Better Auth instance
│   ├── inngest/                 # Background functions
│   │   ├── client.ts            # Inngest client (Gemini AI)
│   │   ├── function.ts          # Welcome email + daily news cron
│   │   └── prompts.ts           # AI prompt templates
│   └── nodemailer/              # Email transport & templates
│
├── middleware/index.ts          # Auth guard (redirect to /sign-in)
├── types/global.d.ts            # Global TypeScript declarations
└── public/assets/               # Static images, icons, logos
```

---

## 🔄 Key Workflows

### 🔍 Stock Search
1. User presses **⌘K** (or clicks Search)
2. Debounced query hits `searchStocks()` → Finnhub API
3. Results are cross-referenced with user's watchlist via `getWatchlistSymbolsByEmail()`
4. Star icons reflect current watchlist status; clicking a star adds/removes instantly

### ⭐ Watchlist Sync
All three watchlist surfaces (search bar, stock page button, header dropdown) communicate via a **custom event bus** (`useWatchlistSync` hook):
1. Any component that adds/removes a stock dispatches a `watchlist-change` event
2. All other components listen and update their local state immediately
3. No page refresh needed — fully real-time within the client

### 📧 AI-Powered Emails
1. **On sign-up** → Inngest event `app/user.created` triggers Gemini AI to generate a personalized welcome email based on the user's profile, then sends it via Nodemailer
2. **Daily at 12:00 UTC** → Inngest cron fetches each user's watchlist, pulls relevant news from Finnhub, summarizes with Gemini AI, and emails the digest

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx inngest-cli@latest dev` | Start Inngest dev server (for background jobs) |

---

## 📄 License

This project is for educational / personal use. Feel free to fork and adapt it to your needs.

---

<p align="center">
  Built with ❤️ using Next.js, MongoDB, Inngest & TradingView
</p>
