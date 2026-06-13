# Selah — Project Brain

The authoritative reference for how this codebase is built, deployed, and maintained. Update this file whenever a major decision changes.

---

## What is Selah?

A Progressive Web App (PWA) Bible companion targeting Indonesian and English-speaking believers. Users read Scripture, journal, pray together, join churches, and receive daily verse notifications. Core is free forever; a Premium tier unlocks advanced features.

Live: **https://selah-umber.vercel.app**
Marketing site: **https://selah-umber.vercel.app/marketing-site/** (served from `/marketing-site/index.html`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth — email/password + Google OAuth |
| Storage | Supabase Storage — buckets: `avatars`, `churches` |
| Rich text | Tiptap |
| Charts | Recharts |
| AI | Gemini (via `/api/ai`) |
| Audio | Faithlife API |
| Email | Resend |
| Push notifications | Web Push (VAPID) via `/api/push` + service worker |
| Analytics | PostHog |
| Deployment | Vercel (CLI deploy — NOT GitHub integration) |
| Cron jobs | GitHub Actions (`.github/workflows/daily-content.yml`) |
| PWA | next-pwa + custom `public/sw.js` |
| i18n | Custom LanguageContext — English + Bahasa Indonesia |
| Animations | Framer Motion |

---

## Repository Layout

```
selah/
├── src/
│   ├── app/
│   │   ├── bibleapp/          # All authenticated app pages
│   │   │   ├── dashboard/
│   │   │   ├── bible/
│   │   │   ├── journal/
│   │   │   ├── plans/
│   │   │   ├── community/
│   │   │   │   ├── page.tsx          # Community hub
│   │   │   │   ├── prayer/           # Prayer wall
│   │   │   │   └── churches/         # Church directory + detail
│   │   │   ├── devotionals/
│   │   │   ├── audio/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── search/
│   │   │   └── ai/
│   │   ├── api/               # All API routes
│   │   │   ├── upload/        # Image upload → Supabase Storage
│   │   │   ├── profile/       # GET + PATCH user profile
│   │   │   ├── churches/      # GET (nearby) + POST create
│   │   │   │   └── [id]/      # PATCH + announcements + members
│   │   │   ├── notifications/ # GET + PATCH (mark read)
│   │   │   ├── push/          # Web Push subscription
│   │   │   ├── cron/daily-content/  # Verse of day + push blast
│   │   │   ├── prayers/
│   │   │   ├── journal/
│   │   │   ├── preferences/
│   │   │   ├── bible/search/
│   │   │   ├── verse/         # bookmark / highlight / note
│   │   │   ├── ai/
│   │   │   └── auth/callback/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── bibleapp/          # AppShell, BibleAppMobileNav, NotificationBell, BibleAppSidebar
│   │   ├── churches/          # CreateChurchModal, EditChurchModal, MembersPanel, AnnouncementFeed
│   │   ├── community/         # PrayerWall
│   │   ├── journal/           # JournalEditor (Tiptap)
│   │   ├── ai/                # AIAssistant
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/
│   │   └── LanguageContext.tsx  # language state + t() helper
│   ├── i18n/
│   │   └── translations.ts     # en + id strings
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # browser client
│   │   │   └── server.ts       # server client + createAdminClient()
│   │   └── utils/
│   └── types/
│       └── database.ts         # generated Supabase types
├── public/
│   ├── sw.js                   # Custom service worker (push + offline)
│   ├── icons/                  # PWA icons (72–512px) + notification-icon.png + badge-96x96.png
│   ├── logo-app-icon.png       # Gold rounded-rect app icon (used as large notification icon)
│   ├── logo-mark-transparent.png
│   ├── logo-wordmark-transparent.png
│   └── logo-wordmark-white.png
├── supabase/migrations/        # 13 migrations (001–013)
├── marketing-site/index.html   # Single-file marketing page
├── .github/workflows/
│   └── daily-content.yml       # Cron: 01:00 UTC = 08:00 WIB daily
└── .env.local                  # Never committed
```

---

## Database Schema

All tables are in the `public` schema with RLS enabled.

### Core user tables
| Table | Key columns |
|---|---|
| `profiles` | id, email, full_name, display_name, avatar_url, bio, location, website, role, is_premium, streak_count, longest_streak |
| `user_preferences` | user_id, font_size, font_family, theme, reading_reminder_enabled, prayer_reminder_enabled, push_notifications_enabled, email_notifications_enabled, language |

### Bible
| Table | Key columns |
|---|---|
| `bible_books` | id, name, name_id (Indonesian), testament, order_num |
| `bible_chapters` | id, book_id, chapter_num |
| `bible_verses` | id, chapter_id, verse_num, text (KJV), text_id (AYT Indonesian) |
| `verse_highlights` | user_id, verse_id, color |
| `verse_bookmarks` | user_id, verse_id, collection |
| `verse_notes` | user_id, verse_id, content |
| `reading_history` | user_id, book_id, chapter_id, read_at |
| `verse_of_day` | date, verse_reference, verse_text, reflection, verse_text_id (Indonesian), reflection_id |

### Content
| Table | Key columns |
|---|---|
| `reading_plans` | id, title, description, duration_days, tags, content (JSONB) |
| `plan_progress` | user_id, plan_id, current_day, completed_days[], started_at, completed_at |
| `devotionals` | id, slug, title, excerpt, content, key_verse, title_id, excerpt_id, content_id, key_verse_id (all Indonesian variants) |

### Journal & Prayer
| Table | Key columns |
|---|---|
| `journal_entries` | id, user_id, title, content, type, mood, tags[], is_private |
| `prayer_requests` | id, user_id, content, is_public, is_anonymous, is_answered, prayer_count |
| `prayer_interactions` | prayer_id, user_id, type |

### Community
| Table | Key columns |
|---|---|
| `comments` | id, user_id, target_type, target_id, content, parent_id |
| `comment_likes` | comment_id, user_id |
| `friendships` | requester_id, addressee_id, status |
| `notifications` | id, user_id, type, title, body, data (JSONB), is_read, read_at |

### Churches
| Table | Key columns |
|---|---|
| `churches` | id, name, description, address, city, province, denomination, pastor_name, website, logo_url, latitude, longitude, member_count, is_verified, created_by |
| `church_members` | church_id, user_id, role (admin/member) |
| `church_events` | church_id, title, description, event_date, event_time, location, is_online, is_recurring, recurrence_type |
| `church_announcements` | church_id, author_id, content |

### System
| Table | Key columns |
|---|---|
| `push_subscriptions` | user_id, endpoint, p256dh, auth, is_active |
| `ai_conversations` | user_id, messages (JSONB), created_at |
| `subscriptions` | user_id, plan, status, stripe_subscription_id |
| `analytics_events` | user_id, event, properties (JSONB) |

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/profile` | Fetch profile + preferences |
| PATCH | `/api/profile` | Update profile (incl. avatar_url) |
| GET | `/api/preferences` | Fetch user prefs |
| PATCH | `/api/preferences` | Update a preference key |
| POST | `/api/upload` | Upload image → Supabase Storage, returns `{ url }` |
| GET | `/api/churches?lat=&lng=&radius=` | List churches, sorted by distance if coords given |
| POST | `/api/churches` | Create church (creator auto-becomes admin) |
| PATCH | `/api/churches/[id]` | Update church (admin only) |
| POST | `/api/churches/[id]/announcements` | Post announcement (admin only) |
| DELETE | `/api/churches/[id]/announcements` | Delete announcement (admin only) |
| PATCH | `/api/churches/[id]/members/[userId]` | Change member role |
| GET | `/api/notifications` | Fetch user notifications (latest 50) |
| PATCH | `/api/notifications` | Mark read — `{ ids: [...] }` or `{}` for all |
| POST | `/api/push/subscribe` | Save push subscription endpoint |
| POST | `/api/cron/daily-content` | Send daily verse push to all subscribers |
| GET | `/api/bible/search` | Search Bible verses |
| POST | `/api/verse/highlight` | Add/update highlight |
| POST | `/api/verse/bookmark` | Toggle bookmark |
| POST | `/api/verse/note` | Add/update verse note |
| GET/POST | `/api/journal` | List / create journal entries |
| GET/POST | `/api/prayers` | List / create prayer requests |
| GET/POST | `/api/plans` | List / enroll in reading plans |
| PATCH | `/api/plan/progress` | Update reading plan progress |
| POST | `/api/ai` | AI Bible study query (Gemini) |
| POST | `/api/daily-checkin` | Record daily streak |
| GET/POST | `/api/auth/callback` | Supabase OAuth callback |

---

## Authentication

- **Provider**: Supabase Auth
- **Methods**: Email/password, Google OAuth
- **Google OAuth**: Configured in Supabase dashboard → Authentication → Providers → Google
  - Client ID: `990824182674-j8c2ol4d8b5s98qpnf521j2bjvehf6k4.apps.googleusercontent.com`
  - Callback URL for Google Cloud Console: `https://rgajuwpufqeuzlrtclwl.supabase.co/auth/v1/callback`
- **Redirect after OAuth**: `/bibleapp/api/auth/callback` or `/api/auth/callback`
- Both login and register pages have "Continue with Google" button

---

## File Uploads

Route: `POST /api/upload`

```
FormData fields:
  file   — image file (image/* only, max 5 MB)
  bucket — "avatars" | "churches"
  path   — storage path, e.g. "{userId}/avatar.jpg" or "{churchId}/logo.jpg"

Response: { url: string }  — public Supabase Storage URL
```

Buckets are auto-created on first upload via service role. Both buckets are public (URLs work without auth).

**Usage:**
- Profile avatar: Settings → Profile tab → camera button on avatar
- Church logo: Create/Edit Church modal → logo picker

---

## Push Notifications

- **Protocol**: Web Push (VAPID)
- **Service worker**: `public/sw.js` — handles `push` event, shows notification with `logo-app-icon.png` as icon
- **Subscription**: `PushPermission` component calls `POST /api/push/subscribe`
- **Daily send**: GitHub Actions runs at 01:00 UTC (08:00 WIB) → `GET /api/cron/daily-content?force=1`
  - Requires `Authorization: Bearer $CRON_SECRET` header
  - Requires `x-vercel-protection-bypass` header (Deployment Protection is enabled)
- **Notification icon**: `public/icons/notification-icon.png` — gold rounded square with white logo (matches app icon)
- **Badge icon**: `public/icons/badge-96x96.png` — white silhouette on transparent

---

## Internationalization

- **Languages**: English (`en`), Bahasa Indonesia (`id`)
- **Translations file**: `src/i18n/translations.ts` — nested object `{ en: { nav: {}, home: {}, ... }, id: { ... } }`
- **Context**: `src/contexts/LanguageContext.tsx` — `useLanguage()` hook returns `{ language, setLanguage, t }`
- **Usage**: `t("section", "key")` everywhere — never hardcode strings
- **Indonesian Bible**: AYT (Alkitab Yang Terbuka) — stored in `bible_verses.text_id`
- **Server-side i18n**: `src/lib/utils/server-i18n.ts` for server components
- Language preference saved to `user_preferences.language`

---

## Google Maps Integration

- **API key env var**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Used in**: `CreateChurchModal`, `EditChurchModal`
- **Features**: Places Autocomplete on address field → auto-fills city, province, lat/lng
- **Nearby churches**: After location set (GPS or Places), `GET /api/churches?lat=&lng=&radius=25` returns nearby churches sorted by distance
- **Restrict key**: Add `selah-umber.vercel.app` as allowed HTTP referrer in Google Cloud Console

---

## Deployment

```bash
# Deploy to production
vercel --prod

# Keep GitHub in sync
git push origin main
```

- **Vercel project**: `randy-t-s-projects/selah`
- **Production URL**: `https://selah-umber.vercel.app`
- **Deployment method**: Vercel CLI only — NOT connected to GitHub auto-deploy
- **Cron jobs**: GitHub Actions, not Vercel Crons (Vercel Crons requires Git integration)
- **Deployment Protection**: Enabled — external cron calls need `x-vercel-protection-bypass` header

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin DB + storage access |
| `NEXT_PUBLIC_APP_URL` | All | `http://localhost:3000` in dev |
| `NEXT_PUBLIC_APP_URL_PRODUCTION` | All | `https://selah-umber.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | All | `Selah` |
| `GEMINI_API_KEY` | Server | AI Bible study (Gemini) |
| `FAITHLIFE_API_KEY` | Server | Audio Bible |
| `NEXT_PUBLIC_POSTHOG_KEY` | All | PostHog analytics |
| `RESEND_API_KEY` | Server | Transactional email |
| `EMAIL_FROM` | Server | `noreply@selahapp.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | All | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Server | Web Push VAPID private key |
| `CRON_SECRET` | Server (Production only) | Authorize cron endpoint calls |
| `ADMIN_SECRET` | Server | Admin panel access |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | All | Google Places autocomplete |

---

## Mobile Nav (PWA Bottom Bar)

Five tabs — `src/components/bibleapp/BibleAppMobileNav.tsx`:

| Tab | Route | Icon |
|---|---|---|
| Home | `/bibleapp/dashboard` | LayoutDashboard |
| Bible | `/bibleapp/bible` | BookOpen |
| Journal | `/bibleapp/journal` | NotebookPen |
| Community | `/bibleapp/community` | Users |
| Settings | `/bibleapp/settings` | Settings |

---

## Key Patterns

**Supabase clients**
- Browser: `createClient()` from `@/lib/supabase/client`
- Server (user-scoped): `await createClient()` from `@/lib/supabase/server`
- Server (admin/service role): `createAdminClient()` from `@/lib/supabase/server`

**API routes always use admin client for writes** (bypasses RLS) and user client for auth checks.

**File upload pattern**
```ts
const form = new FormData();
form.append("file", file);
form.append("bucket", "avatars");       // or "churches"
form.append("path", `${userId}/avatar.jpg`);
const { url } = await fetch("/api/upload", { method: "POST", body: form }).then(r => r.json());
await fetch("/api/profile", { method: "PATCH", body: JSON.stringify({ avatar_url: url }) });
```

**Translation pattern**
```ts
const { t } = useLanguage();
t("nav", "community")   // → "Community" or "Komunitas"
```

**Church distance calculation**: Haversine formula in `GET /api/churches`, done in JS after fetching all records (no PostGIS needed at current scale).

---

## Known Constraints

- No Vercel Crons tab in dashboard (requires Git integration — we use CLI)
- `CRON_SECRET` is production-only encrypted — cannot be pulled via `vercel env pull`
- To manually trigger a notification blast: use `vercel env run` or GitHub Actions manual dispatch
- Google OAuth requires both Client ID and Client Secret configured in Supabase dashboard
- Supabase Storage buckets (`avatars`, `churches`) are auto-created on first upload
