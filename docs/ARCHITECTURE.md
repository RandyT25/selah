# SELAH — Platform Architecture & 24-Month Roadmap

> Lead Software Architect · Product Strategist · Senior Staff Engineer
> Last updated: June 2026

---

## Table of Contents

1. [Complete Long-Term Architecture](#1-complete-long-term-architecture)
2. [Recommended Database Schema](#2-recommended-database-schema)
3. [Service Boundaries](#3-service-boundaries)
4. [Feature Flag Architecture](#4-feature-flag-architecture)
5. [Subscription Architecture](#5-subscription-architecture)
6. [AI Provider Abstraction Architecture](#6-ai-provider-abstraction-architecture)
7. [Analytics Architecture](#7-analytics-architecture)
8. [Church SaaS Architecture](#8-church-saas-architecture)
9. [Scalability Considerations](#9-scalability-considerations)
10. [Security Architecture](#10-security-architecture)
11. [File Tree Recommendations](#11-file-tree-recommendations)
12. [API Architecture](#12-api-architecture)
13. [Growth and Monetization Architecture](#13-growth-and-monetization-architecture)
14. [24-Month Product Roadmap](#14-24-month-product-roadmap)

---

## Project Overview

**SELAH — Pause. Reflect. Grow.**

**Mission:** Build a world-class Christian growth platform that keeps Bible reading free forever while creating sustainable monetization through premium services and church products.

**Core Positioning:** SELAH is not merely a Bible app. SELAH is a companion for Scripture, Prayer, Reflection, Journaling, Christian Living, Stewardship, and Church Community.

**Target Audience:** Indonesian Christians · English-speaking Christians worldwide · Individuals · Families · Churches

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · shadcn/ui · Supabase · PWA · PostHog · Gemini/OpenRouter · Push Notifications · Bilingual (EN/ID)

**Constraints:**
- Do not rewrite the application — extend architecture incrementally
- Preserve all current functionality
- Maintain strict TypeScript
- Preserve PWA compatibility
- Keep Bible reading permanently free
- Design for scale to hundreds of thousands of users

---

## 1. Complete Long-Term Architecture

### Architectural Philosophy

SELAH follows a **layered service architecture** built on Next.js App Router, where the boundary between server and client is a first-class design constraint — not an afterthought. Every architectural decision is evaluated against three axes: **developer velocity**, **user experience quality**, and **operational cost at scale**.

### Tier Model

```
┌─────────────────────────────────────────────────────────┐
│                    DELIVERY LAYER                       │
│  Next.js App Router · Vercel Edge CDN · PWA Shell       │
├─────────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                      │
│  Server Components · API Routes · Server Actions        │
├─────────────────────────────────────────────────────────┤
│                   DOMAIN LAYER                          │
│  Auth · Bible · Growth · Church · AI · Billing          │
├─────────────────────────────────────────────────────────┤
│                 INTEGRATION LAYER                       │
│  Supabase · Stripe · Xendit · Gemini · PostHog          │
├─────────────────────────────────────────────────────────┤
│                 PERSISTENCE LAYER                       │
│  Postgres (Supabase) · Supabase Storage · CDN Cache     │
└─────────────────────────────────────────────────────────┘
```

### Rendering Strategy by Surface

| Surface | Strategy | Rationale |
|---|---|---|
| Bible reader | SSG + client hydration | Chapter content never changes; cache at edge |
| Dashboard | SSR with streaming | Personalized, must be fresh |
| Church pages | ISR (5 min TTL) | Semi-dynamic, high traffic |
| AI assistant | Client + streaming API | Real-time, user-specific |
| Marketing pages | SSG | Maximum Lighthouse score |
| Journal/Prayer | CSR after SSR shell | Highly personal, low SEO value |
| Admin/Analytics | CSR | No SEO needed, complex interactivity |

### Key Architectural Invariants

- **Bible content is immutable.** Pre-render all ~31,000 verses at build time or seed once into Postgres. Never re-fetch from third-party on every request.
- **Auth is always server-side first.** Layout files fetch the session; components receive it as props. No client-side auth flash.
- **Premium state never flickers.** Subscription is resolved in `layout.tsx` and passed down via context with an `initial*` prop pattern.
- **AI is always abstracted.** No component or route ever imports a provider SDK directly — always through `src/lib/ai/`.
- **Payments are always abstracted.** `usePaymentProvider()` is the single interface; components never know which processor they're using.

---

## 2. Recommended Database Schema

### Schema Philosophy

- All tables live in the `public` schema with explicit RLS policies.
- Every user-owned table has `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE`.
- Every table has `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.
- Mutable tables add `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` plus a trigger.
- UUIDs everywhere. No integer primary keys (sharding-safe, no enumeration risk).

### Schema Map by Domain

```
IDENTITY
├── auth.users              (Supabase-managed)
├── profiles                (1:1 with auth.users)
└── user_preferences        (locale, theme, notification settings)

BIBLE
├── bible_books             (66 books, static)
├── bible_chapters          (1,189 chapters, static)
├── bible_verses            (31,102 verses, static)
├── highlights              (user_id, verse_id, color)
├── bookmarks               (user_id, verse_id)
└── verse_notes             (user_id, verse_id, content)

READING PLANS
├── reading_plans           (title, description, is_premium, is_featured)
├── reading_plan_days       (plan_id, day_number, references[])
├── plan_progress           (user_id, plan_id, current_day, is_active)
└── plan_completions        (user_id, plan_id, completed_at)

DEVOTIONALS
├── devotionals             (title, content, scripture_ref, author, published_at)
├── devotional_series       (name, description, cover_image)
└── devotional_reactions    (user_id, devotional_id, type)

JOURNAL
├── journal_entries         (user_id, type, title, content, verse_references[], is_private)
└── journal_tags            (user_id, entry_id, tag)

PRAYER
├── prayer_requests         (user_id, content, is_public, is_answered, church_id?)
└── prayer_engagements      (user_id, request_id, type: 'praying'|'amen')

COMMUNITY / CHURCH
├── churches                (name, city, denomination, is_verified, location)
├── church_members          (church_id, user_id, role: 'admin'|'member'|'leader')
├── church_announcements    (church_id, title, content, published_at)
├── church_events           (church_id, title, start_at, end_at, location, capacity)
├── church_event_registrations (event_id, user_id, status)
├── church_attendance       (event_id, user_id, check_in_method)
├── church_teams            (church_id, name, leader_id)
├── church_team_members     (team_id, user_id)
└── church_subscriptions    (church_id, plan, status, period_end)

GROWTH / ANALYTICS
├── reading_sessions        (user_id, book_id, chapter, duration_seconds, date)
├── ai_usage                (user_id, date, query_count, token_count)
├── user_stats_weekly       (user_id, week_start, chapters_read, prayers, journal_entries)
└── streaks                 (user_id, current_streak, longest_streak, last_read_date)

MONETIZATION
├── subscriptions           (user_id, plan, status, period_start, period_end)
├── donations               (user_id, amount_cents, currency, status, provider)
├── church_subscriptions    (church_id, plan, status, period_end)
└── feature_flags           (key, is_enabled, rollout_pct, allowed_plans[])

NOTIFICATIONS
├── notifications           (user_id, type, title, body, data, is_read)
└── push_subscriptions      (user_id, endpoint, auth, p256dh, device_type)

CONTENT (future)
├── sermon_notes            (church_id, title, scripture_refs[], content, audio_url)
├── resource_links          (church_id, category, title, url, description)
└── family_plans            (owner_id, name, member_limit, subscription_id)
```

### Critical Indexes (beyond PKs)

- `bible_verses(book_id, chapter_number, verse_number)` — unique, primary lookup
- `reading_sessions(user_id, date DESC)` — growth stats aggregation
- `notifications(user_id, is_read, created_at DESC)` — bell badge query
- `church_members(church_id, user_id)` — unique, most-joined table
- `plan_progress(user_id, is_active)` partial — dashboard active plan card
- `prayer_requests(is_public, is_answered, created_at DESC)` partial — community wall

---

## 3. Service Boundaries

Each service boundary represents a domain with its own directory, data ownership, and clearly defined public interface.

```
src/
├── lib/
│   ├── ai/              AI Service
│   ├── bible/           Bible Service
│   ├── billing/         Billing Service
│   ├── church/          Church Service
│   ├── growth/          Growth Service
│   ├── notifications/   Notification Service
│   └── auth/            Auth Service
```

### Service Contracts

**Bible Service** (`lib/bible/`)
- Owns: `bible_books`, `bible_chapters`, `bible_verses`, `highlights`, `bookmarks`, `verse_notes`
- Public API: `getChapter()`, `searchVerses()`, `getUserHighlights()`, `upsertHighlight()`
- Consumers: Bible reader, AI (for context injection), Growth (for session tracking)
- External dependencies: None (all data in Postgres)

**AI Service** (`lib/ai/`)
- Owns: `ai_usage`
- Public API: `streamCompletion()`, `checkRateLimit()`, `incrementUsage()`
- Consumers: AI assistant page, future sermon assistant
- External dependencies: Gemini, OpenRouter (abstracted behind a single `AIProvider` interface)
- Key constraint: Provider is swappable at runtime via env var `AI_PROVIDER`

**Billing Service** (`lib/billing/`)
- Owns: `subscriptions`, `donations`, `church_subscriptions`
- Public API: `getUserPlan()`, `isChurchPlus()`, `canAccess(feature)`
- Consumers: Every gated feature surface
- External dependencies: Stripe, Xendit (both behind `PaymentProvider` interface)

**Growth Service** (`lib/growth/`)
- Owns: `reading_sessions`, `user_stats_weekly`, `streaks`, `ai_usage` (read-only)
- Public API: `getWeeklyStats()`, `getStreak()`, `recordSession()`
- Consumers: Growth dashboard, AI (for personalized context)

**Church Service** (`lib/church/`)
- Owns: all `church_*` tables
- Public API: `getChurch()`, `getMembership()`, `isAdmin()`, `getAttendanceStats()`
- Consumers: Church pages, QR check-in, Church Plus gates

**Notification Service** (`lib/notifications/`)
- Owns: `notifications`, `push_subscriptions`
- Public API: `send()`, `sendToChurch()`, `markRead()`, `getUnreadCount()`
- External dependencies: Web Push (VAPID)

### Cross-Service Rules

1. Services never import from each other's `lib/` directories directly — they call each other's public API functions only.
2. Database access within a service always uses typed helpers (`createClient`, `createAdminClient`); never raw fetch.
3. Services never embed UI logic. They return plain data objects.

---

## 4. Feature Flag Architecture

### Architecture

Feature flags are stored in the `feature_flags` table and evaluated server-side in middleware or layout. No flag evaluation ever happens on the client (prevents flickering and bypassing).

```
feature_flags
├── key                 string  (e.g. 'ai_unlimited')
├── is_enabled          boolean  (master kill switch)
├── rollout_percentage  0–100    (gradual rollout)
├── allowed_plans       text[]   (['premium', 'annual', 'church_plus'])
└── allowed_user_ids    uuid[]   (staff/beta list)
```

### Evaluation Order

```
1. is_enabled = false           → BLOCKED (regardless of user)
2. user_id IN allowed_user_ids  → GRANTED (staff override)
3. user.plan IN allowed_plans   → GRANTED
4. hash(user_id) % 100 < rollout_percentage → GRANTED
5.                              → BLOCKED
```

### `canAccess(feature, user)` — Single Evaluation Function

Lives in `lib/billing/features.ts`. Called in:
- Server layouts (for page-level gating)
- Server components (for section-level gating)
- API routes (for resource-level gating)
- Never called client-side — result passed as prop

### Feature Flag Categories

| Category | Examples | Gating |
|---|---|---|
| Plan features | `ai_unlimited`, `growth_dashboard` | Plan-based |
| Beta features | `family_plans`, `sermon_notes` | User-ID list |
| Rollout features | `new_bible_reader` | Percentage |
| Church Plus | `church_attendance`, `church_teams` | Church plan |
| Kill switches | `ai_assistant` | Boolean |

---

## 5. Subscription Architecture

### Plan Hierarchy

```
FREE (default, permanent)
│
├── PREMIUM (individual)
│   ├── monthly
│   └── annual
│
├── FAMILY (future)
│   ├── up to 6 members under one billing account
│   └── annual only
│
└── CHURCH PLUS (per-church)
    ├── monthly
    └── annual
```

### Subscription State Machine

```
             ┌──────────┐
   signup ──►│  free    │◄─── cancellation
             └────┬─────┘
                  │ checkout
             ┌────▼─────┐
    payment ►│ trialing │ (optional grace period)
             └────┬─────┘
                  │ payment_succeeded
             ┌────▼─────┐
             │  active  │◄─── payment_succeeded (renewal)
             └────┬─────┘
                  │ payment_failed
             ┌────▼──────┐
             │ past_due  │ 7-day grace → canceled
             └────┬──────┘
                  │ grace expired
             ┌────▼──────┐
             │ canceled  │ → features revoked
             └───────────┘
```

### Dual-Processor Design

```
usePaymentProvider()
       │
  language === "id"?
       │
   YES ├──► Xendit (IDR)
       │    └── Invoices → GoPay, OVO, DANA, QRIS, bank transfer
       │
   NO  └──► Stripe (USD/multi-currency)
            └── Checkout Sessions, Subscriptions, Customer Portal
```

Both processors write to the same `subscriptions` table. `plan` and `status` are the source of truth — processor is never queried at feature check time.

### Pricing

| Plan | USD | IDR |
|---|---|---|
| Premium Monthly | $3.99/mo | Rp 59.000/bln |
| Premium Annual | $29.99/yr | Rp 449.000/thn |
| Church Plus Monthly | $9.99/mo | Rp 149.000/bln |

### Webhook Processing Rules

- All webhooks are idempotent. Re-delivery of any event must produce the same database state.
- Webhooks use `ON CONFLICT ... DO UPDATE` (upsert), never bare `INSERT`.
- Stripe: verify `stripe-signature` header. Xendit: verify `x-callback-token` header.
- Webhook handlers never call external APIs (no Stripe/Xendit API calls inside a webhook).
- Failed webhook handler errors are logged but always return `200` to prevent retry loops.

---

## 6. AI Provider Abstraction Architecture

### Provider Interface

```
AIProvider
├── streamCompletion(messages, options) → AsyncIterable<string>
├── complete(messages, options)         → Promise<string>
├── countTokens(messages)               → Promise<number>
└── modelId: string
```

### Provider Registry

```
src/lib/ai/
├── index.ts            (exports getAIProvider())
├── types.ts            (AIProvider interface, AIMessage, AIOptions)
├── providers/
│   ├── gemini.ts       (implements AIProvider via Gemini API)
│   ├── openrouter.ts   (implements AIProvider via OpenRouter)
│   └── anthropic.ts    (future — Claude for premium tier)
├── context/
│   ├── bible.ts        (injects verse context into system prompt)
│   └── user.ts         (injects user's reading history, highlights)
├── rate-limit.ts       (checks/increments ai_usage)
└── prompts/
    ├── bible-study.ts
    ├── devotional.ts
    └── sermon-assist.ts   (future church feature)
```

### Runtime Selection

```
AI_PROVIDER=gemini         → use gemini.ts
AI_PROVIDER=openrouter     → use openrouter.ts
AI_PREMIUM_PROVIDER=anthropic → upgrade premium users to Claude
```

### Cost Control Architecture

| Tier | Model | Token Budget/Day |
|---|---|---|
| Free | Gemini Flash | 10 queries × 2k tokens |
| Premium | Gemini Pro / GPT-4o-mini | Unlimited queries, 8k context |
| Church Sermon | Claude Sonnet | Per-request pricing, no daily limit |

Rate limiting is enforced in the API route, not in the AI provider — keeping providers stateless.

---

## 7. Analytics Architecture

### Three-Layer Analytics Strategy

**Layer 1 — Product Analytics (PostHog)**
- User behavior: page views, feature usage, conversion funnels
- Event taxonomy: `bible_chapter_read`, `prayer_submitted`, `upgrade_clicked`, `ai_query_sent`
- Funnels: onboarding → first read → streak → upgrade
- No PII in event properties (use `user_id` not email)

**Layer 2 — Business Analytics (Supabase/Postgres)**
- Aggregated stats for internal dashboards and church admins
- `user_stats_weekly` table computed by daily cron
- Church attendance reports, team sizes, event fill rates
- Growth metrics: DAU, WAU, MAU, retention cohorts via SQL

**Layer 3 — User-Facing Analytics (Growth Dashboard)**
- Individual spiritual growth metrics shown to the user
- Reading streaks, chapters read, journal frequency, prayer engagement
- Church member engagement for admins
- Recharts visualizations, no external BI tool needed at this scale

### Event Taxonomy (PostHog)

```
Acquisition
  app_installed, signup_completed, onboarding_finished

Activation
  first_bible_read, first_journal_entry, first_prayer, church_joined

Retention
  streak_maintained, streak_broken, plan_completed, daily_return

Revenue
  upgrade_page_viewed, checkout_started, subscription_activated,
  subscription_canceled, donation_made

Church
  church_created, event_rsvp, qr_checkin, team_joined

Feature Usage
  ai_query_sent, highlight_created, bookmark_saved, pdf_exported
```

### Privacy Rules

- All analytics are opt-out via user preferences
- No analytics for under-13 users (future family plan consideration)
- Indonesian users: comply with UU PDP (Personal Data Protection Law)
- EU users: GDPR-compliant via PostHog self-hosted option if needed at scale

---

## 8. Church SaaS Architecture

### Church Tier Model

```
FREE CHURCH
├── Profile page with location
├── Announcements (unlimited)
├── Events (unlimited)
├── Community prayer wall
├── Member directory (opt-in)
└── Basic attendance (manual only)

CHURCH PLUS (Rp 149.000/mo or ~$9.99/mo USD)
├── Everything in Free, plus:
├── QR code check-in
├── Attendance reports and trends
├── Ministry team management
├── Event RSVP with capacity + waitlist
├── Church analytics dashboard
├── Priority support
└── (Future) Sermon notes, resource library, family directory
```

### Church Data Isolation

Each church's data is isolated at the RLS policy level:
- `church_members` table governs access — admin vs. member roles
- Members can only read their own church's private data
- Admins can read and write all their church's data
- No cross-church data access at any layer

### Church Admin Interface

Church admins get a dedicated `/bibleapp/community/churches/[id]/admin` area with:
- Member management (invite, remove, change roles)
- Event management (create, edit, RSVP management)
- Attendance dashboard (weekly/monthly charts)
- Team management (create teams, assign leaders, add members)
- QR code generator for events
- Export: attendance CSV, member list

### Multi-Church Users

A user can belong to multiple churches. The app supports this by:
- `church_members` is a many-to-many join table
- User's "primary church" is stored in `profiles.primary_church_id`
- Notifications and announcements are aggregated across all church memberships

### Church Verification

Verified churches (`is_verified = true`) receive:
- A verification badge on their profile
- Priority in city-based search results
- Access to featured placement (future monetization)

---

## 9. Scalability Considerations

### Database Scalability

| Concern | Strategy |
|---|---|
| Bible content (31k verses) | Read replicas + aggressive caching; content never changes |
| User growth to 100k+ | Supabase scales horizontally; connection pooling via PgBouncer (built-in) |
| `reading_sessions` table growth | Partition by month after 10M rows |
| `notifications` table growth | Archive/delete read notifications older than 90 days via cron |
| `ai_usage` table growth | Partition by month; only query current month for rate limiting |
| `church_attendance` growth | Partition by `church_id` range once >50 large churches |

### API Scalability

- All API routes are stateless and horizontally scalable on Vercel Functions
- Long-running operations (PDF export, stats aggregation) use background jobs, not synchronous API routes
- AI streaming uses Server-Sent Events — Vercel supports up to 30s duration by default
- Cron jobs (daily push notifications, weekly stats aggregation) run on GitHub Actions, not Vercel crons, to avoid cold-start latency

### Caching Strategy

```
Bible chapter content        → Vercel Edge Cache, 1 year TTL (immutable)
Church profiles              → ISR, 5 min TTL
Reading plan listings        → ISR, 1 hour TTL
Verse of the Day             → ISR, 24 hour TTL
User dashboard               → SSR, no cache (personalized)
API routes (church listing)  → Response cache headers, 60s CDN
```

### CDN & Asset Strategy

- Bible audio: Supabase Storage with CDN, pre-signed URLs for premium content
- Church cover images: Supabase Storage, public bucket, Vercel Image Optimization
- User avatars: Supabase Storage, 128x128 WebP via `next/image`
- Static assets (fonts, icons): Vercel CDN, immutable cache headers

### Cost Efficiency at Scale

- Supabase free tier handles ~50k MAU comfortably; pro tier scales to 500k+
- Vercel serverless functions bill per invocation — no idle cost
- AI costs are the highest variable cost; rate limiting is the primary control lever
- Church Plus subscriptions are designed to cover hosting costs for church features

---

## 10. Security Architecture

### Authentication

- Supabase Auth with email/password + Google OAuth (planned)
- Session tokens are HTTP-only cookies (Supabase SSR client handles this)
- All server components call `supabase.auth.getUser()` — never decode JWT manually
- `getSession()` is never trusted server-side (it reads from the cookie, not server-verified)

### Authorization Layers

```
Layer 1 — Middleware
  Redirect unauthenticated users from /bibleapp/* to /login

Layer 2 — Layout Server Components
  Verify session, fetch user profile, pass to context

Layer 3 — API Routes
  Every route calls createClient().auth.getUser() first
  Service role key (createAdminClient) only used for admin operations

Layer 4 — Row Level Security (Supabase/Postgres)
  Final enforcement layer — cannot be bypassed by application bugs
  All tables have RLS enabled
  Admin client used only in webhook handlers and cron jobs
```

### Row Level Security Principles

- `USING (user_id = auth.uid())` for all personal data (journals, highlights, etc.)
- `WITH CHECK (user_id = auth.uid())` on all INSERT/UPDATE
- Church data uses subqueries against `church_members` for role checks
- `SELECT USING (true)` only for genuinely public data (church listings, devotionals)
- Service role bypasses RLS — used only in server-side trusted contexts

### API Security

- All API routes validate input with Zod before any database query
- No SQL constructed from user input — always parameterized via Supabase client
- File uploads: validated type + size limits before Supabase Storage upload
- Webhook signatures always verified before processing
- Rate limiting on AI and auth endpoints via `ai_usage` table + middleware

### Secrets Management

```
NEXT_PUBLIC_*     → Client-safe, non-secret config only
SUPABASE_*        → Server-only, never exposed to client
STRIPE_*          → Server-only
XENDIT_*          → Server-only
AI_*              → Server-only
VAPID_*           → VAPID_PUBLIC_KEY is client-safe; VAPID_PRIVATE_KEY is server-only
```

No secrets ever land in client bundles. Audited with `grep -r "process.env" src/components` at each major release.

### Data Privacy

- Users can export all their data (future: GDPR-compliant export endpoint)
- Users can delete their account and all associated data (cascade deletes via FK)
- Anonymous prayer requests are stored without user_id
- AI queries are rate-limited by user ID but conversation history is not stored server-side

---

## 11. File Tree Recommendations

```
selah/
├── src/
│   ├── app/
│   │   ├── (marketing)/          Public-facing pages (SSG)
│   │   │   ├── page.tsx          Landing
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   └── about/
│   │   ├── (auth)/               Auth flows
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── bibleapp/             Authenticated app shell
│   │   │   ├── layout.tsx        Auth guard + subscription fetch
│   │   │   ├── dashboard/
│   │   │   ├── bible/
│   │   │   │   └── [book]/[chapter]/
│   │   │   ├── plans/
│   │   │   ├── journal/
│   │   │   │   └── export/       Print-to-PDF page
│   │   │   ├── prayer/
│   │   │   ├── ai/
│   │   │   ├── growth/
│   │   │   ├── community/
│   │   │   │   └── churches/
│   │   │   │       └── [id]/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── upgrade/
│   │   │   │   └── success/
│   │   │   ├── donate/
│   │   │   └── checkin/
│   │   ├── api/
│   │   │   ├── ai/               AI completion endpoint
│   │   │   ├── bible/            Bible search/lookup
│   │   │   ├── billing/
│   │   │   │   ├── checkout/     Stripe
│   │   │   │   ├── portal/       Stripe customer portal
│   │   │   │   ├── webhook/      Stripe webhook
│   │   │   │   ├── donate/       Stripe donation
│   │   │   │   └── xendit/       Xendit routes
│   │   │   ├── church/           Church management
│   │   │   ├── growth/           Stats aggregation
│   │   │   ├── checkin/          QR check-in validation
│   │   │   ├── notifications/    Push send + subscription
│   │   │   └── cron/             Background jobs
│   │   └── checkin/              Public QR landing page (no auth required for guests)
│   │
│   ├── components/
│   │   ├── ui/                   shadcn base components (never edited)
│   │   ├── bibleapp/             App shell, nav, modals
│   │   ├── bible/                Reader, highlights, search
│   │   ├── billing/              PricingCard, UpgradeModal, PremiumGate
│   │   ├── churches/             Church cards, gates, QR display
│   │   ├── growth/               Charts, usage meter
│   │   ├── journal/              Entry editor, list
│   │   ├── notifications/        Bell, toast
│   │   └── shared/               Avatars, empty states, loaders
│   │
│   ├── contexts/
│   │   ├── PremiumContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── (future) FamilyContext.tsx
│   │
│   ├── hooks/
│   │   ├── usePremium.ts
│   │   ├── usePaymentProvider.ts
│   │   ├── useLanguage.ts
│   │   └── useChurch.ts
│   │
│   ├── lib/
│   │   ├── ai/                   Provider abstraction
│   │   ├── bible/                Chapter fetch, search utils
│   │   ├── billing/
│   │   │   ├── plans.ts          Plan definitions, feature lists
│   │   │   ├── features.ts       canAccess() evaluation
│   │   │   ├── stripe.ts         Stripe singleton
│   │   │   └── xendit.ts         Xendit singleton
│   │   ├── church/               Church helpers
│   │   ├── growth/               Stats computation
│   │   ├── notifications/        Push helpers, VAPID
│   │   ├── supabase/
│   │   │   ├── client.ts         Browser client
│   │   │   ├── server.ts         Server client, admin client
│   │   │   └── types.ts          Generated + extended types
│   │   └── utils/                cn(), formatDate(), etc.
│   │
│   ├── types/                    Global TypeScript types
│   │   ├── database.ts           Supabase generated types
│   │   ├── billing.ts            Plan, Status, Provider types
│   │   └── api.ts                API request/response types
│   │
│   └── i18n/
│       ├── useTranslation.ts
│       ├── en.ts
│       └── id.ts
│
├── supabase/
│   ├── migrations/               Ordered SQL migrations
│   └── functions/                Supabase Edge Functions (if needed)
│
├── public/
│   ├── icons/                    PWA icons
│   ├── sw.js                     Service worker
│   └── manifest.json
│
└── scripts/
    ├── seed-bible.ts             One-time Bible content seeder
    └── generate-types.sh         Supabase type generation
```

---

## 12. API Architecture

### API Design Principles

- All routes follow REST conventions — no ad-hoc naming
- Every route is a single-responsibility handler
- Input validation via Zod at the top of every handler
- Auth check is always the first operation after validation
- All responses are `{ data }` on success, `{ error }` on failure
- HTTP status codes are always semantically correct

### API Route Map

```
/api/ai
  POST /api/ai                  Stream AI completion

/api/bible
  GET  /api/bible/search        Full-text verse search
  GET  /api/bible/[book]/[ch]   Get chapter content (rarely needed; usually SSR)

/api/billing
  POST /api/billing/checkout    Create Stripe Checkout Session
  POST /api/billing/portal      Create Stripe Customer Portal Session
  POST /api/billing/donate      Create Stripe donation
  POST /api/billing/webhook     Stripe webhook handler
  POST /api/billing/xendit/*    Xendit equivalents

/api/church
  GET  /api/church/[id]                 Church detail
  POST /api/church                      Create church
  PUT  /api/church/[id]                 Update church (admin only)
  POST /api/church/[id]/join            Join church
  POST /api/church/[id]/events          Create event
  POST /api/church/[id]/teams           Create team
  GET  /api/church/[id]/attendance      Attendance stats (admin)
  GET  /api/church/[id]/analytics       Analytics data (Church Plus)

/api/growth
  GET  /api/growth/stats         Weekly stats for current user
  POST /api/growth/session       Record a reading session

/api/checkin
  POST /api/checkin              Validate QR token, record attendance
  POST /api/checkin/token        Generate QR token (admin only)

/api/notifications
  POST   /api/notifications/subscribe    Register push subscription
  DELETE /api/notifications/subscribe    Unsubscribe
  POST   /api/notifications/send         Send to user (admin)

/api/cron
  POST /api/cron/daily-push       Daily devotional push (GitHub Actions)
  POST /api/cron/stats-aggregate  Weekly stats rollup (GitHub Actions)
  POST /api/cron/streak-check     Daily streak validation
```

### Versioning Strategy

No versioning initially — internal API only. When third-party API surface is needed (future: church management integrations), introduce `/api/v1/` prefix at that point with explicit stability guarantees.

---

## 13. Growth and Monetization Architecture

### Revenue Streams

```
ACTIVE
├── Premium subscriptions (B2C)
│   ├── Monthly: $3.99 USD / Rp 59.000 IDR
│   └── Annual:  $29.99 USD / Rp 449.000 IDR
│
├── Church Plus subscriptions (B2B)
│   ├── Monthly: $9.99 USD / Rp 149.000 IDR
│   └── Annual:  (planned)
│
└── One-time donations
    ├── Individual users
    └── Anonymous donations

PLANNED
├── Family plans ($7.99/mo, up to 6 members)
├── Affiliate links (Christian book recommendations)
├── Sponsored devotionals (publishers, ministries)
└── Church directory featured listings
```

### Conversion Funnel Architecture

```
DISCOVERY → ACTIVATION → RETENTION → REVENUE

Discovery
  SEO-optimized marketing pages
  App store presence (Capacitor/TWA future)
  Church referrals (viral loop)

Activation (Day 0–7)
  Onboarding: denomination, language, reading goal
  First Bible chapter read
  First reading plan started
  First journal entry
  Church discovery (if churchgoer)

Retention (Day 8–30)
  Streak tracking with visual reinforcement
  Daily push notification (Verse of the Day)
  Weekly growth report
  AI limits create natural "taste" of premium

Revenue (Day 30+)
  UpgradeBanner shown to free users who hit AI limit
  Upgrade modal shown on premium feature tap
  Annual plan anchoring (shown first, saves 37%)
  Church admin natural upgrade path via ChurchPlusGate
```

### Key Monetization Touchpoints

| Trigger | Surface | CTA |
|---|---|---|
| AI query #10 hit | AI page inline | Upgrade for unlimited |
| Open Growth dashboard | Growth page gate | Upgrade to see your stats |
| Export journal | Export button | Upgrade to export |
| Church admin adds team | Teams tab blur | Upgrade church to Church Plus |
| Dashboard banner | Free user dashboard | 7-day free trial (future) |

### LTV Optimization

- Annual plan default selection (higher LTV, lower churn)
- Subscription management via Stripe Customer Portal (self-serve cancellation reduces support burden)
- Failed payment recovery: 3 retry emails via Stripe dunning before cancellation
- Win-back: email at 30/60/90 days post-cancellation with discount offer (future)

### Viral Growth Mechanisms

- Church join flow: member opens link → lands on church page → signs up to join
- Prayer wall: public requests visible without login → sign up to pray
- Verse sharing: verse image with SELAH watermark (future)
- Reading plan invites: invite friends to read together (future)
- QR check-in: every attendee who checks in sees the SELAH brand

---

## 14. 24-Month Product Roadmap

### Guiding Principles

- Ship working software every two weeks
- Free features build the user base; premium features build revenue
- Church features build community and reduce churn
- Every quarter must deliver at least one visible improvement to each major vertical

---

### Q1 2026 — Foundation & Monetization Live

**Goal: First paying users. Core experience polished.**

- [x] Premium subscriptions (Stripe + Xendit)
- [x] AI rate limiting (10/day free, unlimited premium)
- [x] Growth dashboard (Recharts, weekly stats)
- [x] Journal PDF export (print-optimized page)
- [x] Church Plus (QR attendance, teams, analytics)
- [ ] Run migrations 016–018 in production
- [ ] Stripe + Xendit env vars in Vercel
- [ ] PostHog funnel analysis: onboarding → upgrade
- [ ] App crash monitoring (Sentry integration)
- [ ] Fix all outstanding TypeScript strict-mode warnings

---

### Q2 2026 — Retention & Church Growth

**Goal: 30-day retention above 40%. First 10 Church Plus subscribers.**

**Bible & Reading**
- Audio Bible player (book-level streaming, Supabase Storage)
- Verse sharing (copy as image, share as text)
- Reading plan social feature: invite a friend to read together
- Streak recovery grace period (miss 1 day, get a free restore)

**Church**
- Church discovery page with city/denomination filters and map view
- Church admin announcement scheduling (publish at a future time)
- Event check-in summary email to admin after event ends
- Church member directory (opt-in, visible to members only)
- Church Plus annual pricing

**Premium**
- Downloadable offline audio (service worker caching for premium)
- Premium curated reading plans (Advent, Lent, Topical series)
- Growth dashboard: year-in-review annual summary

**Technical**
- Supabase type regeneration after all migrations applied
- Database read replica for analytics queries
- PostHog cohort analysis: free vs. premium retention curves

---

### Q3 2026 — Community Depth & Indonesia Market

**Goal: SELAH is the go-to app for Indonesian Christian communities.**

**Localization**
- Full Indonesian devotional content library (partner with Indonesian publishers)
- Indonesian church denomination data seeded (GKI, GKII, GPIB, Pentecostal networks)
- Indonesian public holiday Bible reading prompts (Christmas, Easter, national days)
- Bahasa Indonesia AI responses (detect user language, respond accordingly)

**Community**
- Prayer wall improvements: categories, chain prayers, answered prayer testimonies
- Devotional reactions and comments
- Community reading challenges (church-wide "read the Gospels in 30 days")
- Mention/tag system in prayer requests: `@church` notifies all church members

**AI**
- AI Bible study: multi-turn conversation with full Bible context
- AI devotional generator: generate a personal devotional from a chosen verse
- Church sermon assistant (Church Plus): bullet-point sermon outline from scripture + topic

**Growth & Monetization**
- Family plan launch ($7.99/mo, 6 members)
- Affiliate book recommendation links (YouVersion, Logos, Christian books)
- 7-day free premium trial for new signups

---

### Q4 2026 — Platform Maturity & Scale

**Goal: 50,000 MAU. Sustainable unit economics.**

**Bible**
- Bible in a Year tracker with daily notifications
- Cross-reference viewer (tap a verse, see related verses)
- Parallel Bible reader (compare two translations side-by-side)
- Verse memorization module (flashcard-style review)

**Church SaaS Expansion**
- Tithe and offering tracking (Church Plus — integrates with Xendit for Indonesian giving)
- Small group / cell group management within church
- Church resource library (upload PDFs, sermon notes, study guides)
- Multi-campus church support (one organization, multiple locations)

**Platform**
- Native app (Capacitor wrapper for iOS/Android distribution)
- App Store + Google Play listing
- Offline-first architecture: Bible chapters cached on first read, plans cached on enroll
- Background sync for journal entries written offline

**Business**
- Sponsored devotionals marketplace (publishers pay for featured placement)
- Church directory premium listing ($X/mo for featured + verified badge)
- SELAH Partners program for Indonesian ministries

---

### Q1 2027 — Southeast Asia Expansion

**Goal: Launch in Philippines, Malaysia. Church SaaS market fit.**

**Localization**
- Filipino language support (Tagalog/Filipino)
- Malaysian English + Bahasa Malaysia
- Philippines GCash payment integration
- Malaysia FPX bank transfer integration

**Church Enterprise**
- Multi-admin roles (senior pastor, associate, deacon, secretary)
- Church financial reporting (income, expenses, budgets — premium tier)
- Inter-church network (denomination-level view for network admins)

**AI Second Generation**
- Personal AI spiritual director: knows your reading history, journal entries, prayer patterns
- Contextual verse recommendations: "Based on what you wrote today..."
- AI-powered sermon search: find past sermons by topic across church library

---

### Q2 2027 — Depth Features & Platform Lock-in

**Goal: SELAH becomes a life-stage companion, not just a reading app.**

- Life events integration: marriage, baptism, funeral passages
- Bible reading milestones: completion certificates, shareable achievements
- Church legacy content: archive of 10+ years of sermon notes
- Family Bible together: family shared plan with individual tracking
- Mentorship feature: pair new Christians with mature believers in-app
- Seminary/Bible school study mode (deeper commentary integration)

---

### Architecture Evolution Timeline

| Phase | Architecture Change |
|---|---|
| Now–Q2 2026 | Current stack scales; focus on feature completeness |
| Q3 2026 | Add read replica; partition high-volume tables |
| Q4 2026 | Native app via Capacitor; offline-first service worker upgrade |
| Q1 2027 | Multi-region Supabase (Singapore primary for SEA latency) |
| Q2 2027 | Consider dedicated church SaaS subdomain if B2B motion accelerates |

---

## Summary

SELAH's architecture is designed to grow from a Bible reading PWA into a full Christian living platform. The key structural decisions that enable this:

1. **Service boundaries** keep domains decoupled so the church SaaS product can evolve independently of the consumer product.
2. **Payment abstraction** means adding a third processor (GCash, FPX) requires adding one file and one env var — not touching UI code.
3. **AI abstraction** means switching models or providers costs zero UI work.
4. **Feature flags** mean any feature can be A/B tested, gradually rolled out, or instantly killed without a deploy.
5. **RLS as the final authorization layer** means even a complete application bug cannot leak one user's data to another.
6. **Free forever Bible reading** is not a marketing promise — it's enforced architecturally. Premium gates wrap features, never the Bible reader itself.

The 24-month roadmap prioritizes **depth over breadth in Indonesia** before expanding regionally — the right strategy for a bilingual app with Indonesian payment infrastructure already built.
