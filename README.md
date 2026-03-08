# Mana AI — Retail Pitch Generator

An AI-powered SaaS tool for CPG (consumer packaged goods) brands to generate highly tailored retail pitches, simulate buyer reactions, and manage their product catalog — all in one place.

---

## What I Built

Mana AI solves a real problem for emerging food and beverage brands: walking into a buyer meeting at Whole Foods or Walmart without a prepared, retailer-specific pitch is a near-guaranteed miss. Most brands pitch the same way to every retailer.

The app lets a brand enter their product details once, pick a specific store location, choose their pitch angle (Organic, Sustainable, Value, etc.), and get a complete pitch package in seconds — tailored to that exact retailer's priorities, margin expectations, and known buyer objections.

**What the app produces in a single AI call:**

- **Positioning narrative** — 2–4 sentences tailored to the retailer's priorities
- **Talking points** — bullet-ready for the buyer meeting
- **Suggested pitch** — a ready-to-send opening paragraph
- **Readiness checklist** — 6 dimensions evaluated per retailer (certifications, price alignment, category fit, velocity proof, margin viability, packaging/format)
- **Issues & suggestions** — objections to anticipate and what to fix before the meeting
- **Buyer simulation** — questions, internal red flags, and what would tip a buyer toward yes

All output is saved to the database. Pitches can be regenerated at any time (e.g. after updating product details), and the full pitch history is browsable.

---

## Key Decisions

### Single AI call for everything
The first version made two separate API calls: one to generate the pitch, then a second to simulate the buyer after the pitch page loaded. This meant a second loading state on a page where the user was already waiting.

The better approach was to extend the JSON schema and instruct the model to generate both the pitch and the buyer simulation in a single response. The model already has all the context it needs (product, retailer DNA, pitch content) in the same context window, so the buyer simulation is more coherent — it directly reacts to the pitch it just wrote rather than simulating generically.

### Readiness checklist instead of a fit score
An early version showed a single 1–100 fit score. The problem: it was just a number the AI made up with no consistent rubric, so scores across different pitches weren't comparable and gave no actionable signal.

Replacing it with a structured checklist of 6 specific dimensions (certifications, price alignment, category fit, velocity proof, margin viability, packaging format) — each with a status and a one-sentence note — gives the brand something they can actually act on before the meeting.

### Retailer DNA in the prompt
Generic LLM prompts produce generic pitches. The `buildRetailerDNA()` function in `lib/pitch/generate.ts` injects structured strategic context per retailer: their typical margin requirements, what they value in a pitch, their known buyer objections, deal-breakers, and what makes a pitch stand out. This makes the AI output meaningfully different for a Whole Foods pitch vs a Costco pitch vs an HEB pitch, even for the same product.

### Local city autocomplete instead of an external API
Location autocomplete was initially wired to Foursquare's autocomplete endpoint. This introduced a second external dependency, an extra API key scope, and a loading state for a feature that doesn't need real-time data. Replacing it with a local static dataset of ~150+ US cities gives instant suggestions with zero network cost.

### In-place pitch regeneration
When adding regeneration, the choice was between creating a new pitch record each time vs overwriting the existing one. Creating a new record would flood the history with near-identical entries and break the concept of "this is the pitch for Product X at Store Y." Overwriting in-place keeps one clean record per pitch session and always reflects the most recent AI run against the latest product data.

### Product completeness indicator
The pitch quality is directly limited by how much product data is provided. Rather than letting users generate weak pitches and wonder why they're generic, each product card shows a segmented bar across the 5 AI-important optional fields. Missing fields are listed by name so the user knows exactly what to add before generating.

---

## How I Used AI

AI is central to the product, not just the tooling:

**Pitch generation (`lib/pitch/generate.ts`)**
The generation prompt combines three layers of context:
1. **Product context** — all structured product fields formatted into a briefing
2. **Retailer DNA** — per-chain strategic context built by `buildRetailerDNA()`, covering margin expectations, category priorities, known objections, and deal-breakers for 11+ retail chains
3. **Pitch focus** — the user-selected angles (Organic, Sustainable, Premium, etc.) as the directive

The response schema enforces a strict JSON structure covering all output fields including the 6-dimension readiness checklist and the buyer simulation object — all returned in one call. Both Gemini (default, using `responseMimeType: "application/json"` and `responseSchema` for structured output enforcement) and Claude (using prompt-based schema description) are supported and switchable via `PITCH_PROVIDER`.

**Buyer simulation**
The simulation is generated in the same call as the pitch. The prompt instructs the model to context-switch: after generating the pitch as a sales strategist, it evaluates the same pitch from the buyer's perspective — what questions it raises, what internal red flags it triggers, and what would make them more likely to say yes. Having both in the same call means the buyer reactions are specific to the generated pitch rather than a generic simulation.

**Prompt robustness**
JSON truncation was an early failure mode — Gemini's `maxOutputTokens` was too low and responses were cut mid-object, causing parse failures. This was fixed by increasing the token limit and adding explicit truncation detection in the error handling (checking for the absence of a closing `}` to surface a clear error rather than a cryptic JSON parse failure).

---

## What I'd Improve With More Time

**Pitch version history**
Currently regenerating overwrites the existing pitch. Storing each generated version (linked to the same pitch session) would let users compare runs, roll back to a previous version, and see how the pitch improved as they filled in more product data.

**Streaming generation**
The generate button currently blocks until the entire AI response is ready (~8–15s). Streaming the response and progressively revealing sections (positioning first, then talking points, then readiness checklist) would make the wait feel much shorter and give immediate value.

**Richer retailer database**
`buildRetailerDNA()` currently covers ~11 chains with hand-written profiles. This should be a database table, editable by admins, with a UI to add new retailers and keep profiles current as buyer priorities shift. Profiles could also be enriched with real data from public trade publications.

**Pitch export**
Users need to actually use these pitches. A one-click export to PDF or a formatted email draft (pre-addressed to the buyer, formatted as a proper sell sheet intro) would close the loop between generation and delivery.

**Team / brand accounts**
The current data model is strictly per-user. A multi-user brand account with role-based access (brand manager, sales rep, admin) would make this usable for companies with a team — shared product catalog, shared pitch history, per-rep activity.

**Feedback loop**
Adding a simple outcome field on pitches ("Meeting booked", "Sample requested", "No response", "Rejected") would create a training signal. Over time this data could be used to tune the readiness scoring — the checklist dimensions could be weighted based on which factors actually correlate with positive outcomes at each retailer.

**Foursquare search quality**
The current search sometimes returns semantically related but wrong results — a search for "HEB" in a city with no HEB stores returns whatever Foursquare decides is nearby. Adding a stricter "no results in this area" state and improving the brand name matching would prevent users from accidentally generating a pitch for the wrong store.

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
BETTER_AUTH_SECRET=                # Generate with: openssl rand -base64 32

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

