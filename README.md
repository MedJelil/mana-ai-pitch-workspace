# Mana AI — Retail Pitch Generator

An AI-powered SaaS tool for CPG (consumer packaged goods) brands to generate highly tailored retail pitches, simulate buyer reactions, and manage their product catalog — all in one place.

---

## What it does

Given a product, a specific retail store location, and pitch focus areas, Mana AI calls a large language model and produces:

- **Positioning narrative** — 2–4 sentences tailored to the retailer's priorities
- **Talking points** — bullet-ready for the buyer meeting
- **Suggested pitch** — a ready-to-send paragraph
- **Readiness checklist** — 6 dimensions evaluated per retailer (certifications, price alignment, category fit, velocity proof, margin viability, packaging/format)
- **Issues & suggestions** — objections to anticipate and actionable improvements
- **Buyer simulation** — how a real buyer at that chain would react: their questions, internal red flags, and what would get a yes

All output is saved to the database and pitches can be regenerated at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Animations | Framer Motion |
| Data fetching | TanStack React Query v5 |
| Forms | React Hook Form + Yup |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM + Drizzle Kit |
| Authentication | better-auth (email OTP / magic link) |
| AI — pitch & simulation | Google Gemini (`gemini-2.5-flash`) — default |
| AI — pitch alternative | Anthropic Claude (`claude-sonnet-4`) — opt-in via env |
| Email | Resend + React Email |
| Retailer search | Foursquare Places API |
| Icons | Lucide React |
| Toasts | Sonner |

---

## Project Structure

```
app/
  (dashboard)/
    page.tsx                  ← Generate pitch (home)
    products/page.tsx         ← Product catalog
    history/page.tsx          ← Pitch history
    pitch/[id]/page.tsx       ← Pitch detail + buyer simulation
  api/
    auth/[...all]/            ← better-auth handler
    pitches/
      route.ts                ← GET list / POST create
      [id]/route.ts           ← GET single
      [id]/regenerate/        ← POST regenerate
    products/
      route.ts                ← GET list / POST create
      [id]/route.ts           ← PATCH update / DELETE
    retailer-search/          ← GET store search (Foursquare)
    simulate-buyer/           ← POST buyer simulation (legacy standalone)
  login/page.tsx              ← Passwordless login

components/
  pages/
    GeneratePitch.tsx         ← Main pitch generation form
    Products.tsx              ← Product CRUD with completeness indicator
    PitchHistory.tsx          ← Pitch list with expand/collapse
  RetailerSearch.tsx          ← Foursquare store search + location autocomplete
  MultiSelect.tsx             ← Multi-select dropdown (pitch focus)
  AnimatedOtp.tsx             ← OTP input for login

db/
  schema/
    user.ts / account.ts / session.ts / verification.ts
    product.ts                ← Product catalog schema
    pitch.ts                  ← Pitch + readiness + buyer simulation schema
  migrations/                 ← Drizzle SQL migrations
  seed.ts                     ← Dev seed data

lib/
  api/                        ← Client-side fetch helpers + types
  auth/                       ← better-auth client + session helpers
  pitch/
    generate.ts               ← AI pitch generation (Claude + Gemini, retailer DNA)
    simulate-buyer.ts         ← Standalone Gemini buyer simulation
  us-cities.ts                ← Local city autocomplete dataset

emails/
  template/EmailVerification.tsx
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

# AI providers
ANTHROPIC_API_KEY=          # Claude (optional, used when PITCH_PROVIDER=claude)
GEMINI_API_KEY=             # Gemini (required, default provider)

# AI provider selector — "gemini" (default) or "claude"
PITCH_PROVIDER=gemini

# Foursquare Places API
# Create a Service Key at https://developer.foursquare.com
FOURSQUARE_API_KEY=
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database (Neon recommended)

### Installation

```bash
pnpm install
```

### Database setup

```bash
# Push schema to your database
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed

# Open Drizzle Studio to browse the DB
pnpm db:studio
```

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **OTP in development:** In dev mode, verification codes are printed to the terminal instead of being sent by email. Check your console output after submitting the login form.

---

## Database Scripts

| Script | Description |
|---|---|
| `pnpm db:generate` | Generate Drizzle migration files from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push schema directly (no migration files — use for dev) |
| `pnpm db:studio` | Open Drizzle Studio at `https://local.drizzle.studio` |
| `pnpm db:seed` | Seed the database with sample products and pitches |

---

## Key Features

### Product Catalog
Products are the source of truth for all pitches. Each product has:
- Name, category, description
- Key selling points
- Certifications (USDA Organic, Non-GMO, etc.)
- Velocity / sales data
- Packaging / sustainability notes
- Price positioning

A **completeness indicator** on each product card shows which of the 5 AI-important fields are filled, so you know how well a pitch will perform before generating it.

### Retailer Search
Uses the **Foursquare Places API** to find specific store locations in the US. Type a brand name (e.g. "Whole Foods") and a city/state, and select the exact store you're pitching. Location autocomplete uses a local city dataset — no extra API calls.

### Pitch Generation
Each pitch is generated by a single AI call that returns the full output: positioning, talking points, suggested pitch, readiness checklist, issues, suggestions, and buyer simulation — all in one round-trip, stored in the database on creation.

**Retailer DNA:** The `buildRetailerDNA()` function in `lib/pitch/generate.ts` provides structured strategic context for 11+ retail chains (Whole Foods, Walmart, HEB, Costco, Target, etc.), including their margin expectations, category priorities, typical buyer objections, and deal-breakers. This significantly improves pitch quality.

**Provider switching:** Set `PITCH_PROVIDER=claude` to use Claude instead of Gemini.

### Pitch Regeneration
Any existing pitch can be regenerated — the AI re-runs with the latest product data (in case you've updated the product since the original pitch) and overwrites the record in place. The `retailerBrand` and `storeContext` are stored with each pitch so full context is preserved for regeneration.

### Readiness Checklist
Replaces a simple "fit score" number with 6 actionable dimensions evaluated per retailer:

| Dimension | What it checks |
|---|---|
| Certifications | Does the product hold certs this retailer values? |
| Price alignment | Does the MSRP fit this retailer's typical shelf tier? |
| Category fit | Is this category growing or established here? |
| Velocity / proof | Does the brand have data to back claims? |
| Margin viability | Can the product support this retailer's margin requirements? |
| Packaging / format | Is unit size and case pack right for the channel? |

### Buyer Simulation
Generated alongside the pitch, the buyer simulation shows how a real buyer at that specific chain would react:
- **Questions** they'd ask in the meeting
- **Concerns** they'd flag internally
- **Suggestions** that would increase the chance of a yes

---

## Authentication

Mana uses **better-auth** with email OTP (one-time passcode). No passwords. Users enter their email, receive a 6-digit code (or see it in terminal during development), and are authenticated.

The `AnimatedOtp.tsx` component handles the OTP input with animated digit boxes and auto-submit on completion.

---

## API Reference

All endpoints require authentication (session cookie).

### Products

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| GET | `/api/products` | — | List all products for the current user |
| POST | `/api/products` | `{ name, category, description?, keySellingPoints?, certifications?, velocityData?, packagingSustainability?, pricePositioning? }` | Create a product |
| PATCH | `/api/products/:id` | Any subset of the above fields | Update a product |
| DELETE | `/api/products/:id` | — | Delete a product and all its pitches |

### Pitches

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| GET | `/api/pitches` | — | List all pitches for the current user |
| POST | `/api/pitches` | `{ productId, focus, storeInfo: { retailerBrand, storeName, address, city, state } }` | Generate a new pitch (calls AI) |
| GET | `/api/pitches/:id` | — | Get a single pitch with full detail |
| POST | `/api/pitches/:id/regenerate` | — | Regenerate an existing pitch in-place (calls AI) |

### Retailer Search

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| GET | `/api/retailer-search` | `query`, `near` | Search US retail store locations via Foursquare |

---

## Deployment

The app is a standard Next.js application and deploys to any platform that supports Node.js:

- **Vercel** (recommended — zero config)
- **Railway**, **Render**, **Fly.io**

Set all environment variables listed above in your deployment platform's dashboard. For production:
- Use a production Neon database branch
- Set `NEXT_PUBLIC_BASE_URL` and `BETTER_AUTH_URL` to your production domain
- Ensure `NODE_ENV=production` (platforms set this automatically)
- Run `pnpm db:migrate` on first deploy (or use `pnpm db:push` for a fresh database)
