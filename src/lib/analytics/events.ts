export type SelahEvent =
  // Acquisition
  | "signup_completed"
  | "onboarding_started"
  | "onboarding_finished"
  | "onboarding_step_completed"
  // Activation
  | "first_bible_read"
  | "first_journal_entry"
  | "first_prayer_submitted"
  | "first_plan_started"
  | "church_joined"
  // Retention
  | "bible_chapter_read"
  | "streak_maintained"
  | "streak_broken"
  | "plan_completed"
  | "daily_return"
  // Feature usage
  | "ai_query_sent"
  | "ai_limit_reached"
  | "highlight_created"
  | "bookmark_saved"
  | "note_saved"
  | "journal_entry_created"
  | "prayer_submitted"
  | "prayer_prayed_for"
  | "devotional_read"
  // Premium funnel
  | "upgrade_page_viewed"
  | "upgrade_modal_opened"
  | "upgrade_cta_clicked"
  | "upgrade_banner_dismissed"
  | "waitlist_submitted"
  // PWA
  | "pwa_install_prompted"
  | "pwa_install_accepted"
  | "pwa_install_dismissed"
  // Push notifications
  | "push_permission_granted"
  | "push_permission_denied"
  | "push_notification_clicked"
  // Church
  | "church_created"
  | "event_viewed"
  | "announcement_read";

export type SelahEventProperties = {
  signup_completed: { method: "email" | "google" };
  onboarding_step_completed: { step: number; step_name: string };
  onboarding_finished: { denomination: string; language: string; reading_goal: number; found_church: boolean };
  bible_chapter_read: { book: string; chapter: number; duration_seconds?: number };
  ai_query_sent: { is_premium: boolean; query_count_today: number };
  ai_limit_reached: { limit: number };
  highlight_created: { color: string; book: string };
  journal_entry_created: { type: string; has_verse_reference: boolean };
  prayer_submitted: { is_public: boolean; is_anonymous: boolean };
  upgrade_page_viewed: { source: string };
  upgrade_modal_opened: { feature: string; source: string };
  upgrade_cta_clicked: { plan: "monthly" | "annual"; provider: "stripe" | "xendit" };
  upgrade_banner_dismissed: Record<string, never>;
  waitlist_submitted: Record<string, never>;
  pwa_install_prompted: Record<string, never>;
  pwa_install_accepted: Record<string, never>;
  pwa_install_dismissed: Record<string, never>;
  push_permission_granted: Record<string, never>;
  push_permission_denied: Record<string, never>;
  first_plan_started: { plan_id: string; plan_title: string };
  plan_completed: { plan_id: string; plan_title: string; days_taken: number };
  church_joined: { church_id: string };
  church_created: Record<string, never>;
  devotional_read: { slug: string };
} & {
  // Default: all other events accept any properties or none
  [K in Exclude<SelahEvent, keyof {
    signup_completed: unknown; onboarding_step_completed: unknown; onboarding_finished: unknown;
    bible_chapter_read: unknown; ai_query_sent: unknown; ai_limit_reached: unknown;
    highlight_created: unknown; journal_entry_created: unknown; prayer_submitted: unknown;
    upgrade_page_viewed: unknown; upgrade_modal_opened: unknown; upgrade_cta_clicked: unknown;
    upgrade_banner_dismissed: unknown; waitlist_submitted: unknown;
    pwa_install_prompted: unknown; pwa_install_accepted: unknown; pwa_install_dismissed: unknown;
    push_permission_granted: unknown; push_permission_denied: unknown;
    first_plan_started: unknown; plan_completed: unknown; church_joined: unknown;
    church_created: unknown; devotional_read: unknown;
  }>]: Record<string, unknown>;
};
