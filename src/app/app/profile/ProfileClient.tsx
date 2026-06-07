"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Flame, BookOpen, NotebookPen,
  Globe, Palette, Bell, Shield, LogOut, Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils/format";
import type { Profile, UserPreferences } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type SettingsItem =
  | { icon: LucideIcon; label: string; detail: string | null; action: "language" }
  | { icon: LucideIcon; label: string; detail: string | null; href: string };

interface ProfileClientProps {
  profile: Profile | null;
  prefs: UserPreferences | null;
  stats: { streak: number; journalEntries: number; activePlans: number };
}

export function ProfileClient({ profile, prefs, stats }: ProfileClientProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const sections: Array<{ title: string; items: SettingsItem[] }> = [
    {
      title: "Preferences",
      items: [
        {
          icon: Globe,
          label: "Language",
          detail: language === "en" ? "English" : "Bahasa Indonesia",
          action: "language" as const,
        },
        {
          icon: Palette,
          label: "Theme & Appearance",
          detail: null,
          href: "/app/settings",
        },
        {
          icon: BookOpen,
          label: "Reading Settings",
          detail: null,
          href: "/app/settings",
        },
        {
          icon: Bell,
          label: "Notifications",
          detail: null,
          href: "/app/settings",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: Settings,
          label: "Edit Profile",
          detail: null,
          href: "/app/settings",
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          detail: null,
          href: "/app/settings",
        },
      ],
    },
  ];

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-2xl border-b border-border/30 px-4 pt-4 pb-3">
        <h1 className="text-[22px] font-bold">{t("profile", "title")}</h1>
      </div>

      {/* ── User card ── */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-4 bg-card border border-border rounded-3xl p-5 shadow-sm">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(profile?.full_name ?? profile?.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[17px] truncate">
              {profile?.display_name ?? profile?.full_name ?? "Selah User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Link
            href="/app/settings"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-muted text-muted-foreground active:scale-95 transition-transform"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { icon: Flame, label: t("profile", "streak"), value: stats.streak, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
            { icon: NotebookPen, label: t("profile", "journal_entries"), value: stats.journalEntries, color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
            { icon: BookOpen, label: t("profile", "active_plans"), value: stats.activePlans, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`flex flex-col items-center rounded-2xl py-3 px-2 ${color}`}>
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xl font-bold leading-none">{value}</span>
              <span className="text-[10px] font-medium mt-1 text-center leading-tight opacity-80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settings sections ── */}
      {sections.map((section) => (
        <div key={section.title} className="px-4 mt-6">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.title}
          </p>
          <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border/60">
            {section.items.map((item) => {
              const Icon = item.icon;

              if ("action" in item && item.action === "language") {
                return (
                  <div key={item.label} className="px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-[15px]">{item.label}</span>
                      </div>
                      {/* Language toggle */}
                      <div className="flex rounded-xl overflow-hidden border border-border">
                        <button
                          onClick={() => setLanguage("en")}
                          className={cn(
                            "px-3 py-1.5 text-sm font-semibold transition-colors",
                            language === "en"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-muted-foreground hover:bg-muted"
                          )}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setLanguage("id")}
                          className={cn(
                            "px-3 py-1.5 text-sm font-semibold transition-colors border-l border-border",
                            language === "id"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-muted-foreground hover:bg-muted"
                          )}
                        >
                          ID
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={"href" in item ? item.href : "/app/settings"}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium text-[15px]">{item.label}</span>
                  {item.detail && (
                    <span className="text-sm text-muted-foreground mr-1">{item.detail}</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Sign out ── */}
      <div className="px-4 mt-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-3xl py-4 font-semibold active:opacity-70 transition-opacity"
        >
          <LogOut className="h-4 w-4" />
          {t("profile", "sign_out")}
        </button>
      </div>
    </div>
  );
}
