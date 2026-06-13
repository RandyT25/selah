# Selah — Technical Implementation Plan
**Lead Architect Document · v1.0 · June 2026**

> "Generate a complete technical implementation plan before writing any code."
> 
> This document governs all five phases of the SELAH platform evolution. No code is written until the relevant phase plan section is reviewed and approved. Each phase is self-contained and can be paused without breaking the production app.

---

## Baseline Assessment

### What exists and is solid
- Next.js 16 App Router with Turbopack, TypeScript strict, Supabase backend
- 13 migrations, comprehensive triggers, RLS policies on all tables
- `subscriptions` table already provisioned (plan: free|premium|annual)
- `ai_conversations` table with token tracking scaffold
- Parallel data fetching on dashboard (6 concurrent queries)
- Full bilingual support (en/id) via LanguageContext
- Push notifications working (VAPID + service worker)
- Church CRUD with geolocation and Google Places autocomplete

### Critical gaps before monetizing
- No error boundaries anywhere — one uncaught error crashes the whole app
- No Suspense/streaming — all pages are full-page waterfalls
- No AI usage rate limiting — any user can make unlimited Gemini calls
- No Stripe webhook handler — `subscriptions` table exists but is never updated
- No feature gating — `is_premium` flag exists on profiles but is never checked
- No onboarding flow — new users land on a blank dashboard with no guidance
- `onboarding_completed` column exists but nothing sets it to `true`

---

## Phase 1 — Production Hardening

**Goal**: Make the existing feature set resilient, fast, and polished. No new features. This phase must be completed before any monetization phase starts — charging users for a brittle app is worse than not charging.

### 1. Architecture Decisions

- **Error boundaries**: One root boundary in `bibleapp/layout.tsx` + granular per-section boundaries (Dashboard widgets, Bible reader, AI chat). Use React's `error.tsx` convention (Next.js App Router built-in).
- **Loading states**: Add `loading.tsx` files for all route segments using React Suspense + Skeleton components. Skeleton must match actual layout to prevent CLS.
- **Streaming**: Convert Dashboard to streaming with `<Suspense>` per widget section. Verse of Day and streak can render in first flush; reading plans and prayer wall stream in.
- **Caching**: ISR for Bible books list (1 hour revalidation), static generation for individual Bible chapters (they never change), SWR-style client revalidation for mutable user data.
- **Query optimization**: Add composite indexes that the current schema is missing for join-heavy queries. Use `select()` column projection everywhere — we're currently doing `select("*")` on profiles.
- **Logging**: Structured server-side logging via a thin wrapper over `console.log` that includes `requestId`, `userId`, `route`, `duration`. Vercel captures this automatically.
- **Rate limiting**: IP-based rate limiting on all write API routes using Supabase's `auth.uid()` for auth-scoped limiting. No external Redis needed at current scale.

### 2. Database Migrations

**Migration 014 — performance indexes**
```sql
-- Notification bell query (most frequent read)
CREATE INDEX CONCURRENTLY notifications_unread 
  ON public.notifications(user_id, created_at DESC) 
  WHERE is_read = false;

-- Dashboard prayer wall query
CREATE INDEX CONCURRENTLY prayer_requests_public_recent
  ON public.prayer_requests(created_at DESC)
  WHERE is_public = true AND is_answered = false;

-- Church listing with location
CREATE INDEX CONCURRENTLY churches_verified
  ON public.churches(city, is_verified);

-- AI usage lookup (Phase 2 prereq)
-- (table created in Phase 2)
```

**Migration 015 — onboarding and error tracking columns**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signup_source TEXT; -- 'web'|'pwa'|'google'

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS denomination TEXT,
  ADD COLUMN IF NOT EXISTS reading_goal_chapters_per_week INTEGER DEFAULT 5;
```

### 3. API Routes

New and modified routes for Phase 1:

| Route | Change | Reason |
|---|---|---|
| `GET /api/profile` | Add column projection, cache 60s | Currently SELECT * |
| `GET /api/notifications` | Already good — add index | — |
| `POST /api/ai` | Add usage check (prep for Phase 2) | — |
| `POST /api/onboarding` | NEW — mark step complete | Set `onboarding_step`, `onboarding_completed` |
| `GET /api/health` | NEW — returns 200 + db ping | Vercel uptime monitoring |

API hardening patterns to apply to **every** route:
```typescript
// Standard pattern — apply to all routes
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // ... handler logic ...
    
  } catch (error) {
    console.error("[route-name]", { error, url: request.url });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 4. Component Structure

New components to create:

```
src/components/
├── error/
│   ├── ErrorBoundary.tsx          # Generic React error boundary class component
│   ├── ErrorCard.tsx              # Rendered error UI with retry button
│   └── SectionErrorBoundary.tsx   # Wrapper for dashboard sections
├── loading/
│   ├── DashboardSkeleton.tsx
│   ├── BibleReaderSkeleton.tsx
│   ├── ChurchCardSkeleton.tsx
│   └── NotificationSkeleton.tsx
├── empty/
│   ├── EmptyState.tsx             # Generic: icon + title + description + CTA
│   ├── EmptyJournal.tsx
│   ├── EmptyPrayers.tsx
│   └── EmptyChurches.tsx
└── shared/
    └── RetryButton.tsx            # "Try again" pattern
```

New route-level files:
```
src/app/bibleapp/
├── error.tsx                      # Root app error boundary
├── loading.tsx                    # Root app loading state
├── dashboard/
│   ├── loading.tsx                # Dashboard skeleton
│   └── error.tsx
├── bible/loading.tsx
├── journal/loading.tsx
├── community/loading.tsx
└── notifications/loading.tsx
```

### 5. Hooks

```
src/hooks/
├── useUser.ts           # Cached current user + profile (client-side SWR pattern)
├── useProfile.ts        # Profile with optimistic updates
├── useNotifications.ts  # Notification count polling (existing NotificationBell logic extracted)
└── useMediaQuery.ts     # Responsive breakpoints for mobile-specific behavior
```

### 6. Security Considerations

- **CSRF**: Next.js App Router handles this via cookie-based sessions. No extra action needed.
- **Input sanitization**: Add Zod validation to ALL API routes that accept user input (currently missing on some routes).
- **SQL injection**: Supabase SDK handles parameterized queries. Do not interpolate user input into raw SQL.
- **Rate limiting** (auth routes): `POST /api/ai` and `POST /api/prayers` are the highest-risk write endpoints. Apply per-user request counting in Supabase.
- **Supabase RLS audit**: `bible_verses` has no RLS — confirm it should be public-read only (it should; Bible text is not user data).
- **File uploads**: `POST /api/upload` should validate MIME type server-side (not just trust `accept="image/*"`). Max 5MB enforced at the Supabase Storage level but should also be checked in the route.
- **Service role key exposure**: `SUPABASE_SERVICE_ROLE_KEY` must never appear in client bundles. Audit with `grep -r "SERVICE_ROLE" src/` — it should only appear in `lib/supabase/server.ts`.

### 7. RLS Policies

Gaps to fill:

```sql
-- bible_verses: explicitly allow public read (currently inherits; make explicit)
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bible_verses_public_read" ON public.bible_verses FOR SELECT USING (true);

-- reading_plans: public plans visible to all, draft plans to author only
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_published_read" ON public.reading_plans FOR SELECT
  USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "plans_author_write" ON public.reading_plans FOR ALL
  USING (author_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- devotionals: same pattern
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devotionals_published_read" ON public.devotionals FOR SELECT
  USING (is_published = true OR author_id = auth.uid());
```

### 8. File Tree Changes

```
src/app/bibleapp/
+ error.tsx
+ loading.tsx
+ dashboard/loading.tsx
+ bible/loading.tsx  
+ journal/loading.tsx
+ community/loading.tsx
+ notifications/loading.tsx
+ onboarding/
+   page.tsx                     # Multi-step onboarding wizard
+   layout.tsx                   # No sidebar/nav (full-screen wizard)

src/components/
+ error/ErrorBoundary.tsx
+ error/ErrorCard.tsx
+ loading/DashboardSkeleton.tsx
+ loading/BibleReaderSkeleton.tsx
+ empty/EmptyState.tsx
+ shared/RetryButton.tsx

src/hooks/
+ useUser.ts
+ useProfile.ts
+ useNotifications.ts
```

### 9. Step-by-Step Implementation Tasks

1. **Add `error.tsx` and `loading.tsx` to all route segments** — highest impact, 2 hours.
2. **Create `EmptyState` component** and replace all ad-hoc empty states throughout the app.
3. **Add `ErrorBoundary` wrapper** to Dashboard widgets and AI chat.
4. **Apply Zod validation** to all API routes missing it (`/api/prayers`, `/api/journal`, `/api/churches`).
5. **Column projection audit** — replace `select("*")` with explicit column lists on high-traffic queries.
6. **Run Migration 014** (performance indexes) on production.
7. **Add `DashboardSkeleton`** — convert Dashboard to Suspense streaming with `<Suspense fallback={<DashboardSkeleton />}>`.
8. **Build onboarding wizard** — 4 steps: language choice → denomination → reading goal → enable notifications. Sets `onboarding_completed = true` on finish.
9. **Check `onboarding_completed` in `bibleapp/layout.tsx`** — redirect new users to `/bibleapp/onboarding` if not completed.
10. **Run Migration 015** (onboarding columns).
11. **Add `GET /api/health`** route.
12. **Upload validation hardening** in `/api/upload` — check MIME type server-side.

### 10. Production Deployment Checklist

- [ ] All `error.tsx` and `loading.tsx` files added and tested
- [ ] Migration 014 applied to production (`vercel --prod` after `supabase db push`)
- [ ] Migration 015 applied to production
- [ ] Onboarding wizard tested end-to-end (new user flow)
- [ ] All API routes have try/catch + structured logging
- [ ] Service role key audit passes (`grep -r "SERVICE_ROLE" src/` returns only server.ts)
- [ ] RLS policies applied for `bible_verses`, `reading_plans`, `devotionals`
- [ ] File upload MIME validation active
- [ ] Lighthouse PWA score ≥ 90 after changes
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Deploy: `vercel --prod`

---

## Phase 2 — Monetization Infrastructure

**Goal**: Build the complete billing plumbing without gating any features yet. By the end of this phase, Stripe is wired up, subscription status flows through the app, feature flags work, and the upgrade page exists — but nothing is locked behind a paywall. This separation is intentional: it lets you QA the billing flow without breaking any active user experience.

**Pricing model decision**:
- **Free**: Bible reading, journal (unlimited), prayer wall, churches, basic AI (10/day), reading plans (free plans only)
- **Premium** ($3.99/month or $29.99/year): Unlimited AI, premium reading plans, journal PDF export, offline audio, growth dashboard
- **Church Plus** ($9.99/month per church): Attendance tracking, ministry teams, event registration, church analytics
- **Donations**: One-time, user-defined amount (zakat/persembahan framing for Indonesian users)

### 1. Architecture Decisions

- **Payment processor**: Stripe. Already scaffolded in `subscriptions` table with `stripe_customer_id` and `stripe_subscription_id`. Do not add PayPal; Stripe supports Indonesian Rupiah (IDR) and local payment methods (GoPay, OVO, bank transfer) via Stripe Payment Links.
- **Webhook security**: Stripe webhooks verified via `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`. This is the only way to trust subscription state changes.
- **Feature flags**: DB-backed flags in `feature_flags` table. Server-evaluated only — never expose the flag state to the client bundle before gating. Evaluated via a `useFeatureFlag(key)` hook that reads from a server-fetched context.
- **Premium context**: `PremiumContext` wraps the entire app shell. It holds `{ isPremium, plan, trialEnd }` fetched once on auth, passed down via context. Components read from context — no per-component DB queries.
- **Billing abstraction**: All Stripe calls go through `src/lib/billing/stripe.ts`. No other file imports `stripe` directly. This makes it trivial to swap payment processors later.
- **Church subscriptions**: Separate from user subscriptions. A church admin pays for Church Plus. The `church_subscriptions` table links `church_id` to a Stripe subscription.

### 2. Database Migrations

**Migration 016 — monetization tables**
```sql
-- AI usage tracking (rate limiting)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  query_count INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX ai_usage_user_date ON public.ai_usage(user_id, date);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_own" ON public.ai_usage FOR ALL USING (user_id = auth.uid());

-- Donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX donations_user_id ON public.donations(user_id);
CREATE INDEX donations_status ON public.donations(status);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_own" ON public.donations FOR SELECT USING (user_id = auth.uid() OR is_anonymous = false);
CREATE POLICY "donations_insert" ON public.donations FOR INSERT WITH CHECK (true);

-- Church subscriptions (Church Plus)
CREATE TABLE IF NOT EXISTS public.church_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.church_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "church_sub_admin_read" ON public.church_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.church_members 
    WHERE church_id = church_subscriptions.church_id 
      AND user_id = auth.uid() AND role = 'admin'
  ));

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  allowed_plans TEXT[] DEFAULT '{}',  -- e.g. ['premium','annual']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seed initial flags
INSERT INTO public.feature_flags (key, name, allowed_plans) VALUES
  ('ai_unlimited',        'Unlimited AI Queries',       ARRAY['premium','annual']),
  ('premium_plans',       'Premium Reading Plans',       ARRAY['premium','annual']),
  ('journal_pdf_export',  'Journal PDF Export',          ARRAY['premium','annual']),
  ('offline_audio',       'Offline Audio Downloads',     ARRAY['premium','annual']),
  ('growth_dashboard',    'Spiritual Growth Dashboard',  ARRAY['premium','annual']),
  ('church_attendance',   'Church Attendance Tracking',  ARRAY['church_plus']),
  ('church_teams',        'Ministry Teams',              ARRAY['church_plus']),
  ('church_analytics',    'Church Analytics Dashboard',  ARRAY['church_plus']);

-- Add premium flag to reading_plans
ALTER TABLE public.reading_plans ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
```

### 3. API Routes

```
POST  /api/billing/checkout          Create Stripe Checkout Session (subscription)
POST  /api/billing/portal            Create Stripe Customer Portal session
POST  /api/billing/donate            Create Stripe Payment Intent for donation
POST  /api/billing/webhook           Stripe webhook handler (MUST be POST, raw body)
GET   /api/billing/status            Current subscription status for the authed user
POST  /api/billing/church/checkout   Church Plus checkout
GET   /api/feature-flags             Returns flags applicable to current user's plan
```

**Webhook handler handles**:
- `customer.subscription.created` → set plan + status on subscriptions table
- `customer.subscription.updated` → update plan, status, period dates
- `customer.subscription.deleted` → set status=canceled, plan=free after grace period
- `invoice.payment_succeeded` → extend `current_period_end`
- `invoice.payment_failed` → set status=past_due, send notification
- `payment_intent.succeeded` → mark donation succeeded
- `checkout.session.completed` → link Stripe customer to Supabase user

### 4. Component Structure

```
src/components/billing/
├── UpgradeModal.tsx              # Triggered from any premium-locked feature
├── UpgradeBanner.tsx             # Dismissible banner on free plan
├── PremiumBadge.tsx              # "Premium" badge pill
├── PricingCard.tsx               # Individual plan card (used on /upgrade page)
├── PremiumFeatureGate.tsx        # Wrapper: shows children if premium, else upgrade CTA
└── DonateButton.tsx              # "Support Selah" button with modal

src/contexts/
├── PremiumContext.tsx            # { isPremium, plan, churchPlan, isTrialing, trialEnd }

src/app/bibleapp/
├── upgrade/
│   ├── page.tsx                  # Full pricing/upgrade page
│   └── success/page.tsx          # Post-checkout success page
├── donate/
│   └── page.tsx                  # Donation page
```

### 5. Hooks

```typescript
// src/hooks/usePremium.ts
export function usePremium() {
  const ctx = useContext(PremiumContext);
  return {
    isPremium: ctx.isPremium,
    plan: ctx.plan,
    isTrialing: ctx.isTrialing,
    canAccess: (flag: string) => ctx.flags.includes(flag),
    upgrade: () => router.push("/bibleapp/upgrade"),
  };
}

// src/hooks/useFeatureFlag.ts
export function useFeatureFlag(key: string): boolean {
  const { canAccess } = usePremium();
  return canAccess(key);
}

// src/hooks/useAiUsage.ts
export function useAiUsage() {
  // Returns { count, limit, remaining, isLimited }
  // Fetched from /api/ai/usage
}
```

### 6. Security Considerations

- **Stripe webhook signature**: Use `stripe.webhooks.constructEvent(rawBody, sig, secret)`. The route must receive the RAW request body — do NOT parse it with `request.json()` before passing to Stripe. Use `request.text()` or a buffer reader.
- **Checkout session tampering**: Never pass `price_id` from the client. Map plan names → Stripe Price IDs server-side in `lib/billing/stripe.ts`.
- **Subscription status**: Always read subscription status from the DB (Stripe → webhook → DB), never from client-sent claims.
- **Church Plus authorization**: When checking church plan features, verify BOTH that the church has `church_subscriptions.plan = 'plus'` AND that the requesting user is an admin of that church.
- **Idempotency**: Stripe webhook events can fire multiple times. Make all handlers idempotent (upsert patterns, check if already processed via `stripe_subscription_id` uniqueness).

### 7. RLS Policies

```sql
-- subscriptions: user can only read own subscription
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
-- Only service_role can write (webhook handler uses admin client)

-- feature_flags: publicly readable (values depend on user's plan, evaluated server-side)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_flags_public_read" ON public.feature_flags FOR SELECT USING (true);
-- Only service_role can write
```

### 8. File Tree Changes

```
src/
├── lib/
│   └── billing/
│       ├── stripe.ts             # Stripe client + helpers (createCheckoutSession, etc.)
│       ├── plans.ts              # Plan definitions, Price ID mappings
│       └── webhooks.ts           # Event handler functions (pure functions, easy to test)
├── contexts/
│   └── PremiumContext.tsx
├── hooks/
│   └── usePremium.ts
│   └── useFeatureFlag.ts
│   └── useAiUsage.ts
├── components/billing/           # (listed above)
├── app/
│   ├── api/billing/
│   │   ├── checkout/route.ts
│   │   ├── portal/route.ts
│   │   ├── donate/route.ts
│   │   ├── webhook/route.ts      # IMPORTANT: disable Next.js body parsing
│   │   ├── status/route.ts
│   │   └── church/checkout/route.ts
│   └── bibleapp/
│       ├── upgrade/page.tsx
│       ├── upgrade/success/page.tsx
│       └── donate/page.tsx

New env vars:
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  STRIPE_PREMIUM_MONTHLY_PRICE_ID
  STRIPE_PREMIUM_ANNUAL_PRICE_ID
  STRIPE_CHURCH_PLUS_PRICE_ID
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### 9. Step-by-Step Implementation Tasks

1. Install `stripe` package.
2. Create `src/lib/billing/stripe.ts` — Stripe client singleton.
3. Create `src/lib/billing/plans.ts` — map plan names to Stripe Price IDs.
4. Run Migration 016 on production.
5. Build `POST /api/billing/webhook` — handle all 5 event types. Test with Stripe CLI locally (`stripe listen --forward-to localhost:3000/api/billing/webhook`).
6. Build `POST /api/billing/checkout` — creates Stripe Checkout Session, returns URL.
7. Build `POST /api/billing/portal` — Stripe Customer Portal session.
8. Build `PremiumContext.tsx` — fetches `/api/billing/status`, provides `isPremium`, `plan`, `flags`.
9. Wrap `AppShell` with `PremiumContext`.
10. Build `UpgradeModal.tsx` and `PremiumFeatureGate.tsx`.
11. Build `/bibleapp/upgrade` page with pricing cards.
12. Build `/bibleapp/upgrade/success` — confirm subscription and update UI.
13. Build `POST /api/billing/donate` + `/bibleapp/donate` page.
14. Add `UpgradeBanner` to Dashboard for free-plan users (dismissible via localStorage).
15. Add Stripe Price IDs to Vercel environment.

### 10. Production Deployment Checklist

- [ ] Stripe account in live mode with Indonesian payment methods enabled
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Price IDs added to Vercel env
- [ ] Webhook endpoint registered in Stripe dashboard pointing to `https://selah-umber.vercel.app/api/billing/webhook`
- [ ] Migration 016 applied to production
- [ ] Webhook handler tested with all 5 event types via Stripe CLI
- [ ] Idempotency verified: fire same webhook twice → no duplicate DB rows
- [ ] Checkout flow end-to-end: free → checkout → success → DB updated to premium
- [ ] Portal flow: premium user → Stripe portal → cancel → webhook → DB reverts to free
- [ ] `PremiumContext` loads correctly for free AND premium users
- [ ] Upgrade page renders correctly in both en and id
- [ ] Deploy: `vercel --prod`

---

## Phase 3 — Premium Features

**Goal**: Deliver the features users will pay for. Gate them behind the feature flag system built in Phase 2. Each feature is independently deployable — they don't depend on each other.

### 1. Architecture Decisions

- **AI rate limiting**: Per-user daily counter in `ai_usage` table. Free tier: 10 queries/day. Check at the start of `POST /api/ai` before calling Gemini. Reset at midnight UTC (no cron needed — check `date = CURRENT_DATE`). Upsert pattern: `INSERT ... ON CONFLICT (user_id, date) DO UPDATE SET query_count = query_count + 1`.
- **Premium reading plans**: Add `is_premium` column (already in Migration 016). Plans list page shows premium plans with a lock icon for free users, clicking opens `UpgradeModal`.
- **Journal PDF export**: Use `@react-pdf/renderer` (runs in the browser, no server needed for PDF generation). Complex server-side PDFs would require Puppeteer or a Lambda — avoid that complexity. PDF renders Tiptap HTML content, user's name, date range.
- **Offline audio**: Service worker cache strategy using the Workbox CacheFirst strategy. User explicitly "downloads" an episode → it's cached to Cache API. Download status tracked in IndexedDB (not Supabase — this is device-local). A `OfflineAudioManager` context tracks what's available offline.
- **Spiritual growth dashboard**: Pure data aggregation. Server-side page that queries: chapters read per week (last 12 weeks), journal entries per month, prayer interactions, streak history. Displayed with Recharts (already installed).
- **Advanced analytics**: PostHog Insights dashboards (no code changes needed — PostHog already installed). Phase 3 adds intentional tracking events for premium feature usage.

### 2. Database Migrations

**Migration 017 — premium reading plans flag already in 016**
```sql
-- Tag existing plans as premium (run after creating premium content)
-- UPDATE public.reading_plans SET is_premium = true WHERE title = '...';

-- Growth dashboard: persist weekly stats for fast loading
CREATE TABLE IF NOT EXISTS public.user_stats_weekly (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  chapters_read INTEGER NOT NULL DEFAULT 0,
  journal_entries INTEGER NOT NULL DEFAULT 0,
  prayers_offered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);
CREATE INDEX user_stats_weekly_user ON public.user_stats_weekly(user_id, week_start DESC);
ALTER TABLE public.user_stats_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_own" ON public.user_stats_weekly FOR ALL USING (user_id = auth.uid());

-- Offline audio downloads registry (which episodes the user has requested download)
CREATE TABLE IF NOT EXISTS public.audio_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.bible_books(id) NOT NULL,
  chapter_id UUID REFERENCES public.bible_chapters(id),
  audio_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','downloading','cached','error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);
ALTER TABLE public.audio_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audio_downloads_own" ON public.audio_downloads FOR ALL USING (user_id = auth.uid());
```

### 3. API Routes

```
GET  /api/ai/usage                   Return today's AI usage count + limit for current user
POST /api/ai                         Modified: check ai_usage before calling Gemini
GET  /api/growth/stats               Aggregate weekly reading/journaling/prayer stats
POST /api/growth/stats/sync          Trigger stats recalculation (called daily via cron)
GET  /api/journal/export             Returns journal entries as structured data for PDF
POST /api/audio/download             Register audio chapter download intent
GET  /api/audio/downloads            List user's downloaded chapters
```

### 4. Component Structure

```
src/components/premium/
├── AIUsageMeter.tsx               # Shows "7/10 daily queries used" progress bar
├── PremiumPlanBadge.tsx           # Lock icon on premium reading plan cards
├── GrowthChart.tsx                # Recharts weekly reading chart
├── GrowthStatsCard.tsx            # Single stat card (chapters, streak, prayers)
└── JournalExportButton.tsx        # Triggers PDF generation + download

src/app/bibleapp/
├── growth/
│   └── page.tsx                   # Spiritual growth dashboard (premium-gated)
├── plans/
│   └── page.tsx                   # Modified: show premium badge on locked plans
└── ai/
    └── page.tsx                   # Modified: show AIUsageMeter for free users
```

### 5. Hooks

```typescript
// src/hooks/useAiLimit.ts
// Returns { queryCount, limit, remaining, isAtLimit, isUnlimited }
// isUnlimited = true for premium users (no DB check needed, uses PremiumContext)

// src/hooks/useGrowthStats.ts  
// Fetches /api/growth/stats, returns 12-week chart data

// src/hooks/useAudioDownloads.ts
// Manages offline audio download queue + status
```

### 6. Security Considerations

- **AI rate limiting bypass**: Client could try to send requests directly to Gemini using the key from env. This is not possible — `GEMINI_API_KEY` is a server-only env var (no `NEXT_PUBLIC_` prefix). The rate limit enforcement happens server-side in the API route.
- **PDF export**: Journal entries may contain sensitive personal content. The PDF generation happens entirely client-side in the browser (no server sees the content). This is a privacy advantage.
- **Offline audio**: Audio URLs from Faithlife may have time-limited tokens. Check Faithlife API docs for URL expiration. If URLs expire, the service worker cache will serve stale URLs. Solution: store the book/chapter reference, not the URL, and re-request when opening.
- **Stats endpoint**: `GET /api/growth/stats` is expensive — aggregate queries across multiple tables. Add 60-second cache header + Supabase-level query optimization. Free users should not be able to call this endpoint.

### 7. RLS Policies

```sql
-- AI usage: users see only their own rows (already in Migration 016)
-- Growth stats: users see only their own rows (already in Migration 017)
-- Audio downloads: users see only their own rows (already in Migration 017)

-- Reading plans: users can see free plans; premium plans require premium subscription
-- RLS cannot check subscriptions table efficiently for this, so evaluate server-side
-- in the API route, not in RLS. RLS stays as is (published = true).
```

### 8. File Tree Changes

```
src/
├── components/premium/            # New directory
├── app/bibleapp/growth/page.tsx   # New page
├── hooks/
│   ├── useAiLimit.ts
│   ├── useGrowthStats.ts
│   └── useAudioDownloads.ts
├── lib/
│   └── pdf/
│       └── journalExport.ts       # @react-pdf/renderer template
├── app/api/
│   ├── ai/usage/route.ts          # New
│   ├── growth/stats/route.ts      # New
│   ├── growth/stats/sync/route.ts # New
│   ├── journal/export/route.ts    # New
│   ├── audio/download/route.ts    # New
│   └── audio/downloads/route.ts   # New

New dependencies:
  @react-pdf/renderer      # Journal PDF export
```

### 9. Step-by-Step Implementation Tasks

**AI Rate Limiting (2 days)**
1. Run Migration 017 (user_stats_weekly, audio_downloads tables).
2. Modify `POST /api/ai` — upsert into `ai_usage` on every request; return 429 if `query_count >= limit` (limit = 10 for free, 999 for premium).
3. Build `GET /api/ai/usage` endpoint.
4. Add `AIUsageMeter` to AI chat page for free users.
5. Add upgrade CTA when limit reached.

**Premium Reading Plans (1 day)**
6. Add `is_premium` column to existing plans via SQL.
7. Modify reading plans list page — show `PremiumPlanBadge` on locked plans.
8. Add premium gate to plan enrollment endpoint.

**Journal PDF Export (2 days)**
9. Install `@react-pdf/renderer`.
10. Build PDF template in `lib/pdf/journalExport.ts`.
11. Build `JournalExportButton` — client-side generation, no API call needed.
12. Add button to journal list page, gated behind `<PremiumFeatureGate>`.

**Spiritual Growth Dashboard (3 days)**
13. Build `GET /api/growth/stats` — aggregate queries with Supabase.
14. Add stats sync to the daily GitHub Actions cron.
15. Build growth dashboard page with Recharts charts.
16. Gate page behind premium check in layout.

**Offline Audio (3 days)**
17. Build `POST /api/audio/download` — saves to `audio_downloads` table.
18. Modify service worker to handle offline audio cache strategy.
19. Build `useAudioDownloads` hook.
20. Add download button to audio Bible player (premium-gated).

### 10. Production Deployment Checklist

- [ ] Migration 017 applied to production
- [ ] AI rate limiting tested: 10-query limit enforced, premium users not limited
- [ ] AI usage counter resets at midnight UTC (verified by checking date = CURRENT_DATE)
- [ ] Premium reading plans visible but gated for free users
- [ ] Journal PDF generation tested with various entry types and bilingual content
- [ ] Growth dashboard loads correctly and shows meaningful data
- [ ] Offline audio download + playback tested on Android PWA
- [ ] Growth stats cron added to GitHub Actions daily workflow
- [ ] All new pages/features tested in Bahasa Indonesia
- [ ] Deploy: `vercel --prod`

---

## Phase 4 — Church Plus

**Goal**: Give church admins tools to run their congregation digitally through Selah. All Church Plus features require `church_subscriptions.plan = 'plus'`. Free churches keep all existing features (directory, announcements, events, members).

### 1. Architecture Decisions

- **Attendance tracking**: QR code check-in is the primary mechanism. Each church event gets a unique QR code (encoded as `selahapp://checkin/{eventId}/{token}`). On PWA, scanning the QR opens the app and records attendance. Fallback: manual admin check-in list.
- **Ministry teams**: Lightweight — `church_teams` + `church_team_members`. Teams have a name, description, and leader. Members can belong to multiple teams. No separate permission system — church admin manages all teams.
- **Event registration**: Opt-in RSVP system. Events have `max_capacity` and `registration_required` flags. Registered attendees appear in admin view. Registration sends a notification.
- **Church analytics**: Server-side aggregate queries — attendance rate over time, member growth, active vs. inactive members (defined as: has interacted with any church content in the last 30 days). Rendered with Recharts.
- **Church subscription management**: Church admins see a "Church Plus" upgrade page within the church detail. Uses the same Stripe billing infrastructure from Phase 2.

### 2. Database Migrations

**Migration 018 — Church Plus tables**
```sql
-- Attendance
CREATE TABLE IF NOT EXISTS public.church_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT NOT NULL DEFAULT 'qr' CHECK (check_in_method IN ('qr','manual','self')),
  checked_in_by UUID REFERENCES public.profiles(id),
  guest_name TEXT,          -- For guests who aren't app users
  UNIQUE(event_id, user_id)
);
CREATE INDEX attendance_event ON public.church_attendance(event_id);
CREATE INDEX attendance_church ON public.church_attendance(church_id, checked_in_at DESC);
ALTER TABLE public.church_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_admin_all" ON public.church_attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_attendance.church_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "attendance_member_read_own" ON public.church_attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "attendance_self_checkin" ON public.church_attendance FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ministry teams
CREATE TABLE IF NOT EXISTS public.church_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX teams_church ON public.church_teams(church_id);
ALTER TABLE public.church_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_member_read" ON public.church_teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_teams.church_id AND user_id = auth.uid())
);
CREATE POLICY "teams_admin_write" ON public.church_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_teams.church_id AND user_id = auth.uid() AND role = 'admin')
);

CREATE TABLE IF NOT EXISTS public.church_team_members (
  team_id UUID REFERENCES public.church_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
ALTER TABLE public.church_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_read" ON public.church_team_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.church_teams ct
    JOIN public.church_members cm ON cm.church_id = ct.church_id AND cm.user_id = auth.uid()
    WHERE ct.id = church_team_members.team_id
  )
);

-- Event registration
ALTER TABLE public.church_events
  ADD COLUMN IF NOT EXISTS registration_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.church_event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlisted','canceled')),
  UNIQUE(event_id, user_id)
);
CREATE INDEX registrations_event ON public.church_event_registrations(event_id);
ALTER TABLE public.church_event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_own" ON public.church_event_registrations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "registrations_admin_read" ON public.church_event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM church_events ce JOIN church_members cm ON cm.church_id = ce.church_id AND cm.user_id = auth.uid() AND cm.role = 'admin' WHERE ce.id = church_event_registrations.event_id)
);

-- QR check-in tokens (short-lived, server-verified)
CREATE TABLE IF NOT EXISTS public.checkin_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX checkin_tokens_event ON public.checkin_tokens(event_id);
CREATE INDEX checkin_tokens_token ON public.checkin_tokens(token) WHERE expires_at > NOW();
```

### 3. API Routes

```
GET   /api/churches/[id]/analytics          Church-scoped analytics (admin only)
POST  /api/churches/[id]/attendance         Record attendance for an event
GET   /api/churches/[id]/attendance         List attendance for an event
POST  /api/churches/[id]/checkin-token      Generate QR code token for event
POST  /api/checkin                          Process QR scan: validate token + record attendance
GET   /api/churches/[id]/teams              List ministry teams
POST  /api/churches/[id]/teams              Create ministry team
PATCH /api/churches/[id]/teams/[teamId]     Update team
POST  /api/churches/[id]/events/[eventId]/register    RSVP for event
DELETE /api/churches/[id]/events/[eventId]/register   Cancel RSVP
GET   /api/churches/[id]/events/[eventId]/registrations  Admin: list registrants
```

All Church Plus routes check `church_subscriptions.plan = 'plus'` as first step.

### 4. Component Structure

```
src/components/churches/
├── AttendancePanel.tsx            # Event attendance list + manual check-in
├── QRCheckInDisplay.tsx           # Shows QR code for admin to display
├── QRCheckInScanner.tsx           # Camera QR scanner for self-check-in
├── MinistryTeamsList.tsx          # Teams list + member management
├── CreateTeamModal.tsx
├── EventRegistrationButton.tsx    # RSVP button with capacity display
├── RegistrationsList.tsx          # Admin: who has RSVPd
├── ChurchAnalyticsDashboard.tsx   # Recharts: attendance, growth, engagement
└── ChurchPlusGate.tsx             # Same pattern as PremiumFeatureGate but for church plan

src/app/bibleapp/community/churches/[id]/
├── page.tsx                       # Modified: add attendance, teams, analytics tabs
├── analytics/page.tsx             # Church analytics dashboard (admin-only)
└── checkin/page.tsx               # QR check-in landing page (deep link target)
```

### 5. Hooks

```typescript
// src/hooks/useChurchPlan.ts
// Returns { isPlus, plan } for a given churchId

// src/hooks/useAttendance.ts
// Manages attendance state for an event

// src/hooks/useEventRegistration.ts
// RSVP state, capacity remaining, waitlist position
```

### 6. Security Considerations

- **QR token security**: Tokens expire after 2 hours. Generated server-side with `crypto.randomUUID()`. Valid only for the specific event. Never reusable (DELETE after use or track `used_at`).
- **Check-in endpoint**: `POST /api/checkin` accepts the token + (optionally) user's auth cookie. For unauthenticated users, allow guest check-in with a name. Do not allow the same user to check in twice.
- **Church Plus feature gate**: Always check both `church_subscriptions.plan = 'plus'` AND `church_members.role = 'admin'` for admin-only Church Plus features. Do not gate on role alone (church might have downgraded).
- **Analytics data isolation**: Church analytics only expose aggregate counts, never individual user data to admins. The admin cannot see what individual members are doing outside the church context.

### 7. RLS Policies

All new policies listed inline in Migration 018 above. Key principles:
- Attendance: admins can do everything; members can only see and create their own check-in.
- Teams: members can read, admins can write.
- Registrations: users own their registrations; admins of the church can read all.

### 8. File Tree Changes

```
src/
├── components/churches/           # New components listed above
├── hooks/
│   ├── useChurchPlan.ts
│   ├── useAttendance.ts
│   └── useEventRegistration.ts
├── app/
│   ├── bibleapp/community/churches/[id]/analytics/page.tsx
│   ├── bibleapp/community/churches/[id]/checkin/page.tsx
│   └── api/churches/[id]/
│       ├── analytics/route.ts
│       ├── attendance/route.ts
│       ├── checkin-token/route.ts
│       ├── teams/route.ts
│       ├── teams/[teamId]/route.ts
│       └── events/[eventId]/
│           ├── register/route.ts
│           └── registrations/route.ts
│   └── api/checkin/route.ts
```

### 9. Step-by-Step Implementation Tasks

1. Run Migration 018 on production.
2. Build `ChurchPlusGate` component (same pattern as `PremiumFeatureGate`).
3. Build Church Plus upgrade CTA within the church admin panel.
4. Wire up `POST /api/billing/church/checkout` (built in Phase 2) to Church Plus pricing.
5. **Attendance tracking**: Build `POST /api/churches/[id]/attendance`, `AttendancePanel`, `QRCheckInDisplay`.
6. **QR check-in flow**: Build `POST /api/churches/[id]/checkin-token`, `POST /api/checkin`, deep link handler at `/bibleapp/community/churches/[id]/checkin`.
7. **Ministry teams**: Build teams API routes, `MinistryTeamsList`, `CreateTeamModal`.
8. **Event registration**: Modify `CreateEventModal` to add `registration_required` and `max_capacity` fields. Build `EventRegistrationButton` and `RegistrationsList`.
9. **Church analytics**: Build `GET /api/churches/[id]/analytics` (aggregate queries). Build `ChurchAnalyticsDashboard` page.
10. Add Church Plus tab to church admin section in the church detail page.

### 10. Production Deployment Checklist

- [ ] Migration 018 applied to production
- [ ] Church Plus Stripe product and price created in Stripe dashboard
- [ ] `STRIPE_CHURCH_PLUS_PRICE_ID` added to Vercel env
- [ ] Church Plus feature gate tested: free church sees upgrade CTA, plus church sees features
- [ ] QR check-in end-to-end tested: generate token → scan QR on Android → attendance recorded
- [ ] Token expiry tested: 2-hour-old token is rejected
- [ ] Event registration: capacity limit enforced (waitlist at max capacity)
- [ ] Church analytics: no PII exposed in aggregate queries
- [ ] Ministry teams CRUD tested
- [ ] All features tested in Bahasa Indonesia
- [ ] Deploy: `vercel --prod`

---

## Phase 5 — Growth

**Goal**: Build the viral loops and activation flows that turn installs into engaged users and engaged users into referrers. These features have no paywalls — they benefit from network effects and serve the mission.

### 1. Architecture Decisions

- **Referral system**: Each user gets a unique referral code stored on their profile. When a new user signs up with `?ref=CODE`, the referral is recorded. Referral rewards (e.g., 7-day premium trial) are applied server-side by the webhook from Stripe.
- **Shareable verse cards**: Canvas-based image generation using the browser's Canvas API. No server-side rendering needed — cards are generated client-side, downloaded as PNG, or shared via the Web Share API. Bilingual: generates card in user's selected language.
- **Onboarding flow**: Already scaffolded in Phase 1 (`/bibleapp/onboarding`). Phase 5 enhances it with a recommendation engine — suggest reading plans and churches based on denomination + city from sign-up.
- **Invite friends**: Share a link with `?ref={code}`. The invite page (`/invite/[code]`) shows a personalized message and CTA to install the PWA. This doubles as a PWA install funnel.
- **Lifecycle notifications**: Sent from the daily cron job. Rules engine: `if streak == 0 AND last_active > 3 days ago → send re-engagement notification`. Rules are stored in DB and evaluated server-side. No third-party email/push service needed — reuse existing Web Push infrastructure.
- **Growth analytics**: PostHog already installed. Add intentional tracking for referral conversions, onboarding completion rate, and D1/D7/D30 retention cohorts.

### 2. Database Migrations

**Migration 019 — growth tables**
```sql
-- Referral system
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN NOT NULL DEFAULT false;

-- Auto-generate referral code on new profiles
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code = upper(substring(replace(NEW.id::text, '-', ''), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Referrals tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  reward_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referred_id)  -- one referral per new user
);
CREATE INDEX referrals_referrer ON public.referrals(referrer_id);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own" ON public.referrals FOR SELECT USING (referrer_id = auth.uid());

-- Lifecycle notification rules
CREATE TABLE IF NOT EXISTS public.lifecycle_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  condition_sql TEXT NOT NULL,  -- Parameterized SQL returning user_ids
  notification_type TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_id TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_id TEXT NOT NULL,
  cooldown_days INTEGER NOT NULL DEFAULT 7,  -- Don't send same rule more than once per cooldown
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which users received which lifecycle notifications (enforce cooldown)
CREATE TABLE IF NOT EXISTS public.lifecycle_notification_log (
  rule_id UUID REFERENCES public.lifecycle_rules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rule_id, user_id)
);
CREATE INDEX lifecycle_log_user ON public.lifecycle_notification_log(user_id, sent_at DESC);

-- Shareable verse cards (track what was shared — for analytics)
CREATE TABLE IF NOT EXISTS public.verse_card_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  verse_reference TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  share_method TEXT NOT NULL DEFAULT 'download' CHECK (share_method IN ('download','native_share','copy_link')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX verse_shares_user ON public.verse_card_shares(user_id, created_at DESC);
```

### 3. API Routes

```
GET   /api/referral/code              Return current user's referral code + stats
POST  /api/referral/apply             Apply referral code during signup (called from auth callback)
GET   /api/referral/stats             Referrer dashboard: how many referred, rewards earned
GET   /api/invite/[code]              Public: resolve referral code to referrer name (for invite page)
POST  /api/verse/share                Log a verse card share event
GET   /api/onboarding/suggestions     Return suggested plans + churches based on profile
POST  /api/cron/lifecycle             Process lifecycle notification rules (called from GitHub Actions)
```

**Modified routes**:
- `GET /api/auth/callback` — check for `ref` query param in URL, call `POST /api/referral/apply`
- `POST /api/cron/daily-content` — add lifecycle rule processing

### 4. Component Structure

```
src/components/growth/
├── VerseCardGenerator.tsx         # Canvas-based verse card creator
├── VerseCardPreview.tsx           # Live preview of generated card
├── ShareButton.tsx                # Web Share API with fallback to download
├── ReferralCard.tsx               # Shows user's referral code + share link
├── ReferralStats.tsx              # "You've invited X friends"
├── InviteFriendBanner.tsx         # Dismissible banner on dashboard
└── OnboardingRecommendations.tsx  # Suggested plans + nearby churches

src/app/
├── invite/[code]/page.tsx         # Public invite landing page (no auth required)
│                                  # Shows: "Join [Name] on Selah" + install PWA button
├── bibleapp/
│   ├── referral/page.tsx          # User's referral dashboard
│   └── onboarding/page.tsx        # Enhanced with recommendations (Phase 1 scaffold)
```

### 5. Hooks

```typescript
// src/hooks/useReferral.ts
// Returns { code, shareUrl, stats: { referredCount, rewardsClaimed } }

// src/hooks/useVerseCard.ts
// Returns { generateCard, canvasRef, downloadCard, shareCard }
// Manages canvas rendering and share sheet

// src/hooks/useOnboardingRecommendations.ts
// Fetches /api/onboarding/suggestions after onboarding step 3 (location/denomination)
```

### 6. Security Considerations

- **Referral fraud**: A user creating fake accounts to earn referral rewards. Mitigate: rewards only granted after the referred user completes 7 days of active use (streak_count >= 7). Server-side check in the daily cron.
- **Invite landing page**: `/invite/[code]` is public — it shows the referrer's display_name but not their email, full name, or avatar. No sensitive data on this public page.
- **Lifecycle notifications**: The `condition_sql` column in `lifecycle_rules` is a potential SQL injection vector if ever made user-editable. It must only be writable by service_role (admin panel, never user-facing). Use parameterized queries only.
- **Canvas verse cards**: Generated entirely client-side, so no PII hits the server. The share log (`verse_card_shares`) records only verse reference + method, no card image.
- **Web Share API**: Not available in all browsers. Always provide a download fallback.

### 7. RLS Policies

```sql
-- referrals: referrer can see their own referrals (already in Migration 019)
-- lifecycle tables: service_role only for writes (security definer functions)
ALTER TABLE public.lifecycle_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lifecycle_rules_public_read" ON public.lifecycle_rules FOR SELECT USING (is_active = true);
-- No user writes allowed; managed via admin panel / migration only

ALTER TABLE public.lifecycle_notification_log ENABLE ROW LEVEL SECURITY;
-- No user-accessible policies; service_role only

-- verse_card_shares: users can insert their own, read their own
ALTER TABLE public.verse_card_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verse_shares_own" ON public.verse_card_shares FOR ALL USING (user_id = auth.uid());
CREATE POLICY "verse_shares_insert_anon" ON public.verse_card_shares FOR INSERT WITH CHECK (true);
```

### 8. File Tree Changes

```
src/
├── components/growth/             # New directory
├── hooks/
│   ├── useReferral.ts
│   ├── useVerseCard.ts
│   └── useOnboardingRecommendations.ts
├── app/
│   ├── invite/[code]/
│   │   └── page.tsx               # Public invite page
│   └── bibleapp/
│       ├── referral/page.tsx
│       └── onboarding/page.tsx    # Enhanced
│   └── api/
│       ├── referral/code/route.ts
│       ├── referral/apply/route.ts
│       ├── referral/stats/route.ts
│       ├── invite/[code]/route.ts
│       ├── verse/share/route.ts
│       ├── onboarding/suggestions/route.ts
│       └── cron/lifecycle/route.ts
```

**Modified files**:
- `.github/workflows/daily-content.yml` — add `lifecycle` cron job call
- `src/app/api/auth/callback/route.ts` — handle `?ref=CODE` param
- `src/app/bibleapp/dashboard/page.tsx` — add `InviteFriendBanner`

### 9. Step-by-Step Implementation Tasks

**Referral system (2 days)**
1. Run Migration 019.
2. Backfill existing users with referral codes (`UPDATE profiles SET referral_code = upper(substring(replace(id::text,'-',''),1,8)) WHERE referral_code IS NULL`).
3. Build `GET /api/referral/code` and `POST /api/referral/apply`.
4. Modify auth callback to apply referral code from URL param.
5. Build `ReferralCard` + `ReferralStats` + `/bibleapp/referral` page.

**Invite landing page (1 day)**
6. Build public `/invite/[code]` page — resolves code to user, shows install banner.
7. Add PWA install button (reuse/extend `PWAInstallBanner`).

**Verse card generator (2 days)**
8. Build `VerseCardGenerator` using Canvas API — supports both en and id text.
9. Design 3 card templates (minimal, gold, scripture).
10. Implement Web Share API with PNG download fallback.
11. Add "Share" button to Bible reader verse actions.

**Enhanced onboarding (2 days)**
12. Build `GET /api/onboarding/suggestions` — query nearby churches + plans matching denomination.
13. Enhance onboarding wizard with suggestions step (after location/denomination step).
14. Build `OnboardingRecommendations` component.

**Lifecycle notifications (2 days)**
15. Seed `lifecycle_rules` table with initial rules:
    - `inactive_3_days`: last_active > 3 days ago, streak = 0 → "Come back to Selah"
    - `streak_at_risk`: read yesterday but not today and it's past 8pm → "Keep your streak alive"
    - `prayer_unanswered_30_days`: prayer >30 days old, unanswered → "How is this prayer going?"
    - `plan_stalled`: plan_progress not updated in 5 days → "Continue your reading plan"
16. Build `POST /api/cron/lifecycle` — execute each active rule, apply cooldown, send push notifications.
17. Add lifecycle cron to GitHub Actions.

**Growth analytics instrumentation (1 day)**
18. Add PostHog tracking events: `referral_share`, `verse_card_share`, `onboarding_completed`, `onboarding_step_n`.

### 10. Production Deployment Checklist

- [ ] Migration 019 applied to production
- [ ] Existing user referral code backfill SQL run on production
- [ ] Referral code generation trigger working for new signups
- [ ] Auth callback correctly applies `?ref=CODE` param
- [ ] Invite page (`/invite/[code]`) works without authentication
- [ ] Verse card generator works on iOS Safari and Android Chrome (Canvas API)
- [ ] Web Share API tested on Android (native share sheet opens)
- [ ] Download fallback tested on desktop
- [ ] Lifecycle cron added to GitHub Actions and tested via manual trigger
- [ ] Lifecycle cooldown verified: same user doesn't get same notification within 7 days
- [ ] Referral reward gating: reward only granted at streak >= 7
- [ ] Onboarding suggestions show relevant churches for users in Indonesian cities
- [ ] All growth pages and components tested in Bahasa Indonesia
- [ ] PostHog events verified in PostHog dashboard
- [ ] Deploy: `vercel --prod`

---

## Cross-Phase Decisions

### Bilingual rule (applies to all phases)
Every user-visible string must go through `t()`. This includes error messages from API routes that appear in toasts. API error responses should return a `messageKey` alongside `error` so the client can translate it.

Pattern:
```typescript
// API route
return NextResponse.json({ error: "PLAN_LIMIT_REACHED", message: "You have reached your reading plan limit" }, { status: 403 });

// Client
const { error: errorKey } = await res.json();
toast.error(t("errors", errorKey) ?? errorKey); // Falls back to the key if not translated yet
```

### TypeScript strictness rule
- No `any` types — use `unknown` and narrow with Zod.
- All new API routes must define explicit Zod schemas for request bodies.
- All new DB queries must use column projection (not `select("*")`) and type assertions against `Database` types.

### Migration numbering
Current: 013. Next migration: 014. Each phase adds its own migration(s) in sequence. Never modify an existing migration that has been applied to production.

### Testing strategy
- Unit tests for: billing webhook handlers, referral code generation, AI rate limit logic.
- Integration tests (Playwright) for: checkout flow, onboarding wizard, QR check-in.
- No test mocking of Supabase — use Supabase local for tests (`supabase start`).

### Performance budget
- Dashboard FCP: < 1.5s (currently ~2.1s due to no Suspense streaming)
- Bible chapter load: < 800ms (static generation will achieve this)
- AI response first token: < 2s (Gemini streaming already working)

---

## Dependency Additions by Phase

| Phase | Package | Size | Purpose |
|---|---|---|---|
| 2 | `stripe` | ~120kB | Stripe billing SDK |
| 3 | `@react-pdf/renderer` | ~280kB | Journal PDF export |
| 5 | none (Canvas API is native) | — | Verse card generator |

Packages explicitly NOT added:
- No `redis` / `ioredis` — Supabase handles rate limiting at this scale
- No `puppeteer` — too heavy for PDF; use `@react-pdf/renderer` client-side
- No `react-qr-code` — native Canvas can render QR codes; or use a tiny zero-dep library
- No additional state management (Zustand/Redux) — React Context is sufficient for `PremiumContext`

---

*This document is the source of truth. Update it when decisions change. Do not implement a phase without reading its full section.*
