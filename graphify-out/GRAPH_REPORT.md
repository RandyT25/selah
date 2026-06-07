# Graph Report - .  (2026-06-07)

## Corpus Check
- Corpus is ~38,693 words - fits in a single context window. You may not need a graph.

## Summary
- 581 nodes · 1251 edges · 31 communities (28 shown, 3 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.84)
- Token cost: 9,800 input · 2,100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community & Admin Pages|Community & Admin Pages]]
- [[_COMMUNITY_Cross-Cutting Concepts|Cross-Cutting Concepts]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Bible Reading & Audio|Bible Reading & Audio]]
- [[_COMMUNITY_UI Foundation & Settings|UI Foundation & Settings]]
- [[_COMMUNITY_Dev Tooling & Build Config|Dev Tooling & Build Config]]
- [[_COMMUNITY_AI Chat & Provider|AI Chat & Provider]]
- [[_COMMUNITY_Reading Plans & Brand|Reading Plans & Brand]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_PWA & Offline Support|PWA & Offline Support]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Marketing & Landing|Marketing & Landing]]
- [[_COMMUNITY_Database Type System|Database Type System]]
- [[_COMMUNITY_API Routes & Admin|API Routes & Admin]]
- [[_COMMUNITY_Root Layout & Theming|Root Layout & Theming]]
- [[_COMMUNITY_Devotionals & Journaling|Devotionals & Journaling]]
- [[_COMMUNITY_Role-Based Auth & Admin|Role-Based Auth & Admin]]
- [[_COMMUNITY_Auth Middleware & Types|Auth Middleware & Types]]
- [[_COMMUNITY_Route Guard Middleware|Route Guard Middleware]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Prayer Wall|Prayer Wall]]
- [[_COMMUNITY_Journal Entry Editing|Journal Entry Editing]]
- [[_COMMUNITY_Project Config Files|Project Config Files]]
- [[_COMMUNITY_Marketing Layout|Marketing Layout]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_README|README]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 34 edges
2. `cn()` - 33 edges
3. `createClient()` - 28 edges
4. `Badge()` - 27 edges
5. `Card` - 20 edges
6. `CardContent` - 20 edges
7. `scripts` - 17 edges
8. `Database` - 16 edges
9. `compilerOptions` - 15 edges
10. `createClient()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Offline Bible Caching Strategy` --semantically_similar_to--> `Bible API with Mock Verse Fallback`  [INFERRED] [semantically similar]
  public/sw.js → src/app/(app)/bible/[book]/[chapter]/page.tsx
- `Migration 003: Seed Bible Books Data` --shares_data_with--> `BIBLE_BOOKS`  [INFERRED]
  supabase/migrations/003_seed_bible_books.sql → src/lib/bible/books.ts
- `Next.js Middleware (Auth Guard)` --semantically_similar_to--> `createClient()`  [INFERRED] [semantically similar]
  src/middleware.ts → src/lib/supabase/server.ts
- `Database` --shares_data_with--> `Migration 001: Initial Database Schema`  [INFERRED]
  src/types/database.ts → supabase/migrations/001_initial_schema.sql
- `Separator` --semantically_similar_to--> `DropdownMenuSeparator`  [INFERRED] [semantically similar]
  src/components/ui/separator.tsx → src/components/ui/dropdown-menu.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **PWA Offline Stack: Manifest + Service Worker + Next Config** — public_manifest, public_sw, next_config [EXTRACTED 0.95]
- **Bible Chapter Reading Pipeline: Page -> Supabase -> API.Bible -> Mock Fallback** — chapter_page, concept_supabase_ssr, concept_bible_api_fallback [EXTRACTED 0.95]
- **Dashboard Hub: aggregates Bible, Journal, Prayer, Devotionals, AI quick-actions** — dashboard_page, bible_page, journal_new_page, prayer_page, ai_page, devotionals_page [EXTRACTED 0.90]
- **Auth Pages Flow (Login, Register, Forgot Password)** — login_page_loginpage, register_page_registerpage, forgot_password_page_forgotpasswordpage, concept_google_oauth_flow [EXTRACTED 0.95]
- **Admin Section (Overview, Plans, Devotionals, Moderation)** — admin_layout_adminlayout, admin_page_adminpage, plans_page_adminplanspage, devotionals_page_admindevotionalspage, moderation_page_adminmoderationpage, concept_role_based_admin_access [EXTRACTED 0.95]
- **Reading Plan User Journey (Browse, Enroll, Track Progress)** — plans_page_planspage, _id__page_plandetailpage, _id__page_enrollbutton, _id__page_markcompletebutton, concept_reading_plan_enrollment [INFERRED 0.90]
- **Bible Chapter Reading Experience (ChapterReader + BibleReader + verse actions + preferences)** — bible_chapterreader, bible_biblereader, concept_verse_actions, concept_reading_preferences [INFERRED 0.90]
- **App Navigation System (AppHeader + AppSidebar + MobileNav)** — layout_appheader, layout_appsidebar, layout_mobilenav [EXTRACTED 0.95]
- **Marketing Page Composition (LandingPage + MarketingNav + MarketingFooter)** — page_landingpage, marketing_marketingnav, marketing_marketingfooter [EXTRACTED 0.95]
- **Radix UI Primitive Wrapper Components (shadcn/ui pattern)** — ui_avatar_avatar, ui_dialog_dialog, ui_dropdown_menu_dropdownmenu, ui_select_select, ui_tabs_tabs, ui_progress_progress, ui_scroll_area_scrollarea, ui_separator_separator, ui_slider_slider, ui_switch_switch, ui_label_label [EXTRACTED 0.95]
- **CVA-based Variant-Driven Components** — ui_button_button, ui_button_buttonvariants, ui_badge_badge, ui_badge_badgevariants, ui_label_label, concept_cva_variant_system [EXTRACTED 1.00]
- **Selah Brand Gold Theme Across UI Components** — ui_button_button, ui_badge_badge, shared_pwainstallbanner_pwainstallbanner, concept_selah_gold_theme [EXTRACTED 0.95]
- **Supabase Auth + Data Layer (Client, Server, Middleware, Types)** — supabase_client_createclient, supabase_server_createclient, supabase_server_createadminclient, middleware_middleware, types_database_database [INFERRED 0.95]
- **Bible Canonical Data Pipeline (TS Books, SQL Schema, Seed Migration)** — bible_books_bible_books, migrations_001_initial_schema, migrations_003_seed_bible_books, types_database_database [INFERRED 0.90]
- **AI Chat System (Interface, Implementation, System Prompts)** — types_app_aiprovider, types_app_aimessage, types_app_aioptions, ai_provider, ai_provider_ai_system_prompts [INFERRED 0.95]

## Communities (31 total, 3 thin omitted)

### Community 0 - "Community & Admin Pages"
Cohesion: 0.06
Nodes (55): metadata, FriendWithProfile, metadata, PrayerWithAuthor, CATEGORIES, PrayerForm, prayerSchema, PrayerWallProps (+47 more)

### Community 1 - "Cross-Cutting Concepts"
Cohesion: 0.06
Nodes (42): metadata, Class Variance Authority (CVA) Variant System, Google OAuth Flow, PWA Install Flow, PWA Offline Support Pattern, Rich Text Journal Editing (Tiptap), Selah Gold/Gradient Brand Theme, ForgotForm (+34 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.04
Nodes (57): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+49 more)

### Community 3 - "Bible Reading & Audio"
Cohesion: 0.08
Nodes (38): metadata, BibleReader(), BibleReaderProps, PopupState, BIBLE_BOOKS, BOOK_GENRES, BookInfo, getBookByName() (+30 more)

### Community 4 - "UI Foundation & Settings"
Cohesion: 0.08
Nodes (32): metadata, cn() Utility (clsx + twMerge), shadcn/ui Radix Primitive Wrapper Pattern, ProgressWithPlan, ProfileForm, profileSchema, metadata, config (+24 more)

### Community 5 - "Dev Tooling & Build Config"
Cohesion: 0.05
Nodes (38): description, devDependencies, autoprefixer, eslint, eslint-config-next, jest, jest-environment-jsdom, postcss (+30 more)

### Community 6 - "AI Chat & Provider"
Cohesion: 0.07
Nodes (27): AIAssistant(), SUGGESTED_PROMPTS, metadata, AI_SYSTEM_PROMPTS, OpenAIProvider, POST(), AI System Prompt Design for Bible Context, Streaming AI Response Pattern (+19 more)

### Community 7 - "Reading Plans & Brand"
Cohesion: 0.10
Nodes (23): EnrollButton, MarkCompleteButton, PlanDetailPage, AboutPage(), Bible Full-Text Search, Journal Mood Tracking, Reading Plan Enrollment and Progress Tracking, Selah Brand Mission — Pause and Reflect (+15 more)

### Community 8 - "App Shell & Navigation"
Cohesion: 0.11
Nodes (20): Role-Based Navigation (admin panel link), Unread Notification Count, AppHeader(), AppHeaderProps, AppLayout, AppSidebarProps, MobileNav(), mobileNavItems (+12 more)

### Community 9 - "PWA & Offline Support"
Cohesion: 0.09
Nodes (21): Bible API with Mock Verse Fallback, Offline Bible Caching Strategy, Progressive Web App (PWA) Architecture, nextConfig, background_color, categories, description, dir (+13 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Marketing & Landing"
Cohesion: 0.22
Nodes (8): features, metadata, testimonials, Marketing Layout (Nav + Footer wrapper), MarketingFooter(), MarketingNav(), navLinks, LandingPage

### Community 12 - "Database Type System"
Cohesion: 0.14
Nodes (13): AnalyticsEvent, BibleBook, BibleChapter, Comment, Friendship, InsertDto, Json, Notification (+5 more)

### Community 13 - "API Routes & Admin"
Cohesion: 0.22
Nodes (7): adminNav, GET(), GET(), metadata, CookieItem, createClient(), ServerClient

### Community 14 - "Root Layout & Theming"
Cohesion: 0.24
Nodes (7): inter, lora, metadata, viewport, ThemeProvider(), Toaster(), ToasterProps

### Community 15 - "Devotionals & Journaling"
Cohesion: 0.24
Nodes (10): Supabase SSR Server Client Pattern, Devotional Detail Page, Devotionals List Page, Journal Entry Edit Page, Journal Entry View Page, New Journal Entry Page, SchemaResult, SchemaType (+2 more)

### Community 16 - "Role-Based Auth & Admin"
Cohesion: 0.29
Nodes (7): AdminLayout(), AdminPage(), Role-Based Admin Access, Supabase Auth Guard Pattern, AdminDevotionalsPage(), AdminModerationPage(), AdminPlansPage()

### Community 17 - "Auth Middleware & Types"
Cohesion: 0.29
Nodes (7): Next.js Middleware (Auth Guard), createAdminClient(), BibleReaderSettings Interface, HIGHLIGHT_COLORS Constant, AiConversation, Database, Subscription

### Community 18 - "Route Guard Middleware"
Cohesion: 0.29
Nodes (5): ADMIN_ROUTES, AUTH_ROUTES, config, CookieItem, PROTECTED_ROUTES

### Community 19 - "ESLint Configuration"
Cohesion: 0.33
Nodes (5): extends, rules, react/no-unescaped-entities, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars

### Community 20 - "Prayer Wall"
Cohesion: 0.40
Nodes (3): PrayerWall(), metadata, PrayerWithAuthor

### Community 21 - "Journal Entry Editing"
Cohesion: 0.40
Nodes (3): metadata, PageProps, JournalEntry

### Community 23 - "Marketing Layout"
Cohesion: 0.67
Nodes (3): MarketingFooter, MarketingLayout, MarketingNav

## Knowledge Gaps
- **275 isolated node(s):** `extends`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, `react/no-unescaped-entities`, `nextConfig` (+270 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Bible API with Mock Verse Fallback` connect `PWA & Offline Support` to `Bible Reading & Audio`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Button` connect `Cross-Cutting Concepts` to `Community & Admin Pages`, `Bible Reading & Audio`, `UI Foundation & Settings`, `AI Chat & Provider`, `Reading Plans & Brand`, `App Shell & Navigation`, `Marketing & Landing`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createClient()` (e.g. with `Next.js Middleware (Auth Guard)` and `createClient()`) actually correct?**
  _`createClient()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `extends`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community & Admin Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05651176133103844 - nodes in this community are weakly interconnected._
- **Should `Cross-Cutting Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._