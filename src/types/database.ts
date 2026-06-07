export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          role: "user" | "admin" | "moderator";
          is_premium: boolean;
          is_verified: boolean;
          is_active: boolean;
          onboarding_completed: boolean;
          streak_count: number;
          longest_streak: number;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          role?: "user" | "admin" | "moderator";
          is_premium?: boolean;
          is_verified?: boolean;
          is_active?: boolean;
          onboarding_completed?: boolean;
          streak_count?: number;
          longest_streak?: number;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          role?: "user" | "admin" | "moderator";
          is_premium?: boolean;
          is_verified?: boolean;
          is_active?: boolean;
          onboarding_completed?: boolean;
          streak_count?: number;
          longest_streak?: number;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          bible_translation: string;
          font_size: number;
          font_family: "serif" | "sans" | "mono";
          theme: "light" | "dark" | "system" | "sepia";
          line_spacing: "compact" | "normal" | "relaxed" | "loose";
          show_verse_numbers: boolean;
          show_chapter_numbers: boolean;
          reading_reminder_enabled: boolean;
          reading_reminder_time: string | null;
          prayer_reminder_enabled: boolean;
          prayer_reminder_time: string | null;
          push_notifications_enabled: boolean;
          email_notifications_enabled: boolean;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bible_translation?: string;
          font_size?: number;
          font_family?: "serif" | "sans" | "mono";
          theme?: "light" | "dark" | "system" | "sepia";
          line_spacing?: "compact" | "normal" | "relaxed" | "loose";
          show_verse_numbers?: boolean;
          show_chapter_numbers?: boolean;
          reading_reminder_enabled?: boolean;
          reading_reminder_time?: string | null;
          prayer_reminder_enabled?: boolean;
          prayer_reminder_time?: string | null;
          push_notifications_enabled?: boolean;
          email_notifications_enabled?: boolean;
          language?: string;
        };
        Update: {
          bible_translation?: string;
          font_size?: number;
          font_family?: "serif" | "sans" | "mono";
          theme?: "light" | "dark" | "system" | "sepia";
          line_spacing?: "compact" | "normal" | "relaxed" | "loose";
          show_verse_numbers?: boolean;
          show_chapter_numbers?: boolean;
          reading_reminder_enabled?: boolean;
          reading_reminder_time?: string | null;
          prayer_reminder_enabled?: boolean;
          prayer_reminder_time?: string | null;
          push_notifications_enabled?: boolean;
          email_notifications_enabled?: boolean;
          language?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bible_books: {
        Row: {
          id: string;
          book_number: number;
          name: string;
          abbreviation: string;
          testament: "OT" | "NT";
          genre: string;
          chapter_count: number;
          verse_count: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_number: number;
          name: string;
          abbreviation: string;
          testament: "OT" | "NT";
          genre: string;
          chapter_count: number;
          verse_count?: number;
          description?: string | null;
        };
        Update: {
          name?: string;
          abbreviation?: string;
          testament?: "OT" | "NT";
          genre?: string;
          chapter_count?: number;
          verse_count?: number;
          description?: string | null;
        };
        Relationships: [];
      };
      bible_chapters: {
        Row: {
          id: string;
          book_id: string;
          chapter_number: number;
          verse_count: number;
          cached_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          chapter_number: number;
          verse_count?: number;
          cached_at?: string | null;
        };
        Update: {
          verse_count?: number;
          cached_at?: string | null;
        };
        Relationships: [];
      };
      bible_verses: {
        Row: {
          id: string;
          book_id: string;
          chapter_id: string;
          translation: string;
          verse_number: number;
          text: string;
          reference: string;
          api_id: string | null;
          cached_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          chapter_id: string;
          translation?: string;
          verse_number: number;
          text: string;
          reference: string;
          api_id?: string | null;
          cached_at?: string;
        };
        Update: {
          text?: string;
          reference?: string;
          api_id?: string | null;
          cached_at?: string;
        };
        Relationships: [];
      };
      verse_highlights: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          color: "yellow" | "green" | "blue" | "pink" | "purple" | "orange";
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          color?: "yellow" | "green" | "blue" | "pink" | "purple" | "orange";
          note?: string | null;
        };
        Update: {
          color?: "yellow" | "green" | "blue" | "pink" | "purple" | "orange";
          note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      verse_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          collection_name: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          collection_name?: string;
          note?: string | null;
        };
        Update: {
          collection_name?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      verse_notes: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          content: string;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          content: string;
          is_private?: boolean;
        };
        Update: {
          content?: string;
          is_private?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      reading_plans: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          duration_days: number;
          category: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          is_featured: boolean;
          is_published: boolean;
          author_id: string | null;
          subscriber_count: number;
          content: Json;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          duration_days: number;
          category?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          author_id?: string | null;
          content?: Json;
          tags?: string[];
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          duration_days?: number;
          category?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          is_featured?: boolean;
          is_published?: boolean;
          content?: Json;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      plan_progress: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          current_day: number;
          completed_days: number[];
          started_at: string;
          completed_at: string | null;
          last_read_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          current_day?: number;
          completed_days?: number[];
          started_at?: string;
          completed_at?: string | null;
          last_read_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          current_day?: number;
          completed_days?: number[];
          completed_at?: string | null;
          last_read_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      devotionals: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image_url: string | null;
          key_verse: string | null;
          key_verse_reference: string | null;
          author_id: string | null;
          category: string;
          tags: string[];
          reading_time_minutes: number;
          is_published: boolean;
          is_featured: boolean;
          published_at: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          key_verse?: string | null;
          key_verse_reference?: string | null;
          author_id?: string | null;
          category?: string;
          tags?: string[];
          reading_time_minutes?: number;
          is_published?: boolean;
          is_featured?: boolean;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          key_verse?: string | null;
          key_verse_reference?: string | null;
          category?: string;
          tags?: string[];
          reading_time_minutes?: number;
          is_published?: boolean;
          is_featured?: boolean;
          published_at?: string | null;
          view_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          content_html: string | null;
          type: "reflection" | "prayer" | "gratitude" | "sermon_notes" | "study" | "general";
          mood: "joyful" | "peaceful" | "hopeful" | "grateful" | "struggling" | "confused" | "anxious" | "sad" | "neutral" | null;
          tags: string[];
          verse_references: string[];
          is_private: boolean;
          is_favorite: boolean;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          content_html?: string | null;
          type?: "reflection" | "prayer" | "gratitude" | "sermon_notes" | "study" | "general";
          mood?: "joyful" | "peaceful" | "hopeful" | "grateful" | "struggling" | "confused" | "anxious" | "sad" | "neutral" | null;
          tags?: string[];
          verse_references?: string[];
          is_private?: boolean;
          is_favorite?: boolean;
        };
        Update: {
          title?: string | null;
          content?: string;
          content_html?: string | null;
          type?: "reflection" | "prayer" | "gratitude" | "sermon_notes" | "study" | "general";
          mood?: "joyful" | "peaceful" | "hopeful" | "grateful" | "struggling" | "confused" | "anxious" | "sad" | "neutral" | null;
          tags?: string[];
          verse_references?: string[];
          is_private?: boolean;
          is_favorite?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      prayer_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          is_anonymous: boolean;
          is_answered: boolean;
          is_public: boolean;
          prayer_count: number;
          answer_note: string | null;
          answered_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category?: string;
          is_anonymous?: boolean;
          is_answered?: boolean;
          is_public?: boolean;
          prayer_count?: number;
          answer_note?: string | null;
          answered_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          is_anonymous?: boolean;
          is_answered?: boolean;
          is_public?: boolean;
          answer_note?: string | null;
          answered_at?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      prayer_interactions: {
        Row: {
          id: string;
          user_id: string;
          prayer_request_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prayer_request_id: string;
        };
        Update: {
          user_id?: string;
          prayer_request_id?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "declined" | "blocked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "declined" | "blocked";
        };
        Update: {
          status?: "pending" | "accepted" | "declined" | "blocked";
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          entity_type: "devotional" | "prayer_request" | "journal_entry" | "reading_plan" | "verse";
          entity_id: string;
          parent_id: string | null;
          is_edited: boolean;
          like_count: number;
          is_flagged: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          entity_type: "devotional" | "prayer_request" | "journal_entry" | "reading_plan" | "verse";
          entity_id: string;
          parent_id?: string | null;
        };
        Update: {
          content?: string;
          is_edited?: boolean;
          is_flagged?: boolean;
          is_deleted?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Json;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Json;
          is_read?: boolean;
          read_at?: string | null;
        };
        Update: {
          is_read?: boolean;
          read_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "premium" | "annual";
          status: "active" | "canceled" | "past_due" | "trialing";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_end: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "premium" | "annual";
          status?: "active" | "canceled" | "past_due" | "trialing";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_end?: string | null;
          canceled_at?: string | null;
        };
        Update: {
          plan?: "free" | "premium" | "annual";
          status?: "active" | "canceled" | "past_due" | "trialing";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_end?: string | null;
          canceled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          event_type: string;
          event_data: Json;
          page_url: string | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          event_type: string;
          event_data?: Json;
          page_url?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      reading_history: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          chapter_id: string;
          translation: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          chapter_id: string;
          translation?: string;
          read_at?: string;
        };
        Update: {
          read_at?: string;
        };
        Relationships: [];
      };
      verse_of_day: {
        Row: {
          id: string;
          verse_reference: string;
          verse_text: string;
          reflection: string | null;
          scheduled_date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          verse_reference: string;
          verse_text: string;
          reflection?: string | null;
          scheduled_date: string;
          created_by?: string | null;
        };
        Update: {
          verse_reference?: string;
          verse_text?: string;
          reflection?: string | null;
          scheduled_date?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          messages: Json;
          context_verse: string | null;
          total_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          messages?: Json;
          context_verse?: string | null;
          total_tokens?: number;
        };
        Update: {
          title?: string | null;
          messages?: Json;
          context_verse?: string | null;
          total_tokens?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type UserPreferences = Tables<"user_preferences">;
export type BibleBook = Tables<"bible_books">;
export type BibleChapter = Tables<"bible_chapters">;
export type BibleVerse = Tables<"bible_verses">;
export type VerseHighlight = Tables<"verse_highlights">;
export type VerseBookmark = Tables<"verse_bookmarks">;
export type VerseNote = Tables<"verse_notes">;
export type ReadingPlan = Tables<"reading_plans">;
export type PlanProgress = Tables<"plan_progress">;
export type Devotional = Tables<"devotionals">;
export type JournalEntry = Tables<"journal_entries">;
export type PrayerRequest = Tables<"prayer_requests">;
export type PrayerInteraction = Tables<"prayer_interactions">;
export type Friendship = Tables<"friendships">;
export type Comment = Tables<"comments">;
export type Notification = Tables<"notifications">;
export type Subscription = Tables<"subscriptions">;
export type AnalyticsEvent = Tables<"analytics_events">;
export type ReadingHistory = Tables<"reading_history">;
export type VerseOfDay = Tables<"verse_of_day">;
export type AiConversation = Tables<"ai_conversations">;
