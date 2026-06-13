# Selah — App Features

Selah is a Bible companion PWA for Indonesian and English-speaking believers. Below is a complete description of every feature available in the app.

---

## 1. Bible Reader

The core feature of the app. Users can read the Bible in two translations:

- **KJV** (King James Version) — English
- **AYT** (Alkitab Yang Terbuka) — Bahasa Indonesia

**Capabilities:**
- Browse by Old/New Testament → Book → Chapter → Verse
- **Highlight verses** in multiple colors (yellow, green, blue, pink, purple). Highlights persist across sessions.
- **Bookmark verses** into named collections (e.g., "Favorites", "Morning Reading")
- **Add verse notes** — private notes tied to specific verses
- **Verse sharing** — copy verse text to clipboard or share via native share sheet
- Reading history tracked automatically per chapter
- Adjustable font size and font family (via Settings)
- Light/dark theme support

---

## 2. Bible Search

Full-text search across all 31,102 Bible verses.

- Search in English (KJV) or Indonesian (AYT) based on user's language setting
- Results show verse reference + snippet with matched text highlighted
- Tap any result to jump directly to that verse in the reader
- Recent searches saved locally
- Route: `/bibleapp/search`

---

## 3. Verse of the Day

A curated daily verse delivered every morning at 08:00 WIB (01:00 UTC).

- **Dashboard card**: Shows today's verse reference, text, and a reflection/devotional note
- Available in both English and Bahasa Indonesia
- Stored in `verse_of_day` table — one row per date
- Also delivered as a **push notification** to all subscribed users

---

## 4. Reading Plans

Structured Bible reading plans to guide users through Scripture systematically.

- Browse available plans (e.g., "Through the Bible in a Year", topical plans)
- Each plan has: title, description, duration in days, daily reading assignments
- **Progress tracking**: Current day highlighted, completed days marked with checkmark
- Continue reading from the last completed day
- Plan completion recorded and celebrated

---

## 5. Devotionals

Short-form devotional content — one per day or per topic.

- Each devotional has: title, excerpt, full content (rich text), key verse
- Fully bilingual — Indonesian and English versions of every devotional
- Route: `/bibleapp/devotionals`

---

## 6. Prayer Journal (Prayer Wall)

Community-powered prayer sharing.

- **Submit prayer requests** — public or private, optionally anonymous
- Public prayer requests appear on the community Prayer Wall
- Other users can **pray for** a request (increments prayer count)
- Request author can **mark as answered** when God responds
- Comments supported on prayer requests
- Private requests visible only to the author
- Route: `/bibleapp/community/prayer`

---

## 7. Personal Journal

A private journaling space for spiritual reflection.

- **Rich text editor** powered by Tiptap (bold, italic, headings, lists, etc.)
- Entry types: General, Prayer, Gratitude, Reflection, Scripture Study
- Mood tracking per entry (emoji-based)
- Tags for organization
- Entries private by default (`is_private = true`)
- Route: `/bibleapp/journal`

---

## 8. Community

Central hub linking prayer, churches, and social features.

### Community Hub (`/bibleapp/community`)
Overview page linking to Prayer Wall, Churches, and friend activity.

### Prayer Wall
See public prayer requests from the community. Pray for others, leave comments, see answered prayers.

---

## 9. Churches

A directory of Christian churches — primarily Indonesian churches.

### Church Directory (`/bibleapp/community/churches`)
- List of all churches with logo, name, city, province, denomination, member count
- **Search/filter** by city, denomination
- **Nearby churches**: filter by distance (radius in km) using device GPS
- Each church card shows logo, name, location, distance, member count

### Create a Church
- Any user can register their church
- Fields: name, description, address (Google Maps autocomplete), city, province, denomination, pastor name, website, logo/photo upload
- After saving location (GPS or Google Maps), **nearby churches panel** appears to prevent duplicates
- Creator automatically becomes church admin

### Church Detail Page
- Header with logo, name, city/province, denomination, pastor
- Member count badge
- Verified badge (for verified churches)
- Church website link
- **Announcements feed** — admin-posted updates
- **Events list** — upcoming church events with date, time, location
- **Members list** — member avatars and roles
- **Join / Leave** button for members

### Church Admin Features (admin role only)
- **Edit church** details (all fields including logo, Google Maps re-geocoding)
- **Post announcements** — rich text posts to church members
- **Delete announcements**
- **Create events** — title, description, date/time, location (online or in-person), recurring option
- **Manage members** — change member roles (admin/member)

---

## 10. Push Notifications

Native web push notifications delivered to all subscribed devices.

### Types of notifications:
| Type | Trigger |
|---|---|
| `verse_of_day` | Daily at 08:00 WIB — daily verse + reflection |
| `prayer_prayed` | Someone prayed for your prayer request |
| `church_announcement` | Admin posted an announcement in your church |
| `church_event` | New event added to your church |
| `church_joined` | Someone joined your church |
| `friend_request` | Someone sent you a friend request |
| `friend_accepted` | Your friend request was accepted |
| `streak_milestone` | You hit a reading streak milestone |
| `plan_completed` | You completed a reading plan |
| `reading_reminder` | Daily reading reminder |
| `devotional_published` | New devotional published |

### Notifications Page (`/bibleapp/notifications`)
- All notifications listed newest-first
- Unread notifications: gold border + dot indicator
- Click any notification → marks as read + navigates to relevant content
- "Mark read" button per notification
- "Mark all read" button
- Empty state: "All caught up" message

### Permission Request
- `PushPermission` component shown on first login and in Settings
- Requests browser push permission
- Stores VAPID subscription endpoint to `push_subscriptions` table

---

## 11. AI Bible Study

Conversational AI to help users study, understand, and apply Scripture.

- Powered by **Google Gemini**
- Ask questions about any Bible passage, doctrine, or Christian living
- AI has full Bible context and can cite verses
- Conversation history saved per user
- Route: `/bibleapp/ai`

---

## 12. Audio Bible

Listen to Bible chapters read aloud.

- Powered by **Faithlife API**
- Play/pause/seek controls
- Follows the current chapter open in the Bible reader
- Route: `/bibleapp/audio`

---

## 13. Streak & Gamification

Encourages daily engagement.

- **Daily streak counter**: incremented each day the user opens the app or checks in
- **Longest streak** recorded
- Streak milestones trigger push notifications
- Streak count displayed on the Dashboard and Profile

---

## 14. Profile

Public profile page for each user.

- Display name, full name, avatar photo
- Bio, location, website
- Reading streak count
- Prayer count
- Reading plan progress summary
- Route: `/bibleapp/profile`

---

## 15. Settings

User preferences and account management.

- **Profile tab**: edit display name, bio, location, website; upload/change profile photo (camera button overlay on avatar)
- **Reading tab**: font size (Small/Medium/Large/XL), font family (Default/Serif/Mono), theme (Light/Dark/System)
- **Notifications tab**: toggle reading reminders, prayer reminders, push notifications, email notifications
- **Language tab**: switch between English and Bahasa Indonesia
- **Account tab**: sign out, delete account
- Route: `/bibleapp/settings`

---

## 16. Authentication

- **Email + password** registration and login
- **Google OAuth** — one-tap "Continue with Google" on login and register pages
- Forgot password flow (email reset link via Resend)
- Session persisted via Supabase Auth cookie

---

## 17. Bahasa Indonesia Support

Full bilingual support — every visible string in the app is translated.

- Switch language in Settings → Language tab
- Language preference persisted to database and remembered across devices
- **AYT Bible** (Indonesian translation) shown when Indonesian is selected
- All devotionals, plans, and content available in both languages
- "Verse of the Day" reflection shown in the user's selected language

---

## 18. Progressive Web App (PWA)

Selah is a full PWA — installable on iOS, Android, and desktop.

- **Add to Home Screen** on iOS Safari and Android Chrome
- Offline caching via service worker (`/public/sw.js`)
- App icon: gold rounded square with Selah wordmark
- Splash screen on launch
- Push notifications work on Android (iOS has limited support)
- App behaves like a native app once installed — no browser chrome visible

---

## 19. Admin Panel

Internal admin tools for content management.

- Access via `/admin` (requires `ADMIN_SECRET`)
- Manage `verse_of_day` entries
- Manage devotionals
- Manage reading plans
- View push notification statistics

---

## Premium Tier

A `is_premium` flag on the `profiles` table gates premium features. The premium tier is planned but not fully launched. Stripe integration is scaffolded in `subscriptions` table.

---

## Analytics

User behavior tracked via **PostHog** for product improvement. Events tracked include: page views, feature usage, plan enrollments, prayer submissions, and more. All analytics are anonymous-friendly — users can opt out via preferences.
