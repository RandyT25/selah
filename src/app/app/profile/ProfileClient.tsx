"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame, BookOpen, NotebookPen, Globe, Palette,
  Bell, Shield, LogOut, Settings, ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils/format";
import type { Profile, UserPreferences } from "@/types/database";
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
        { icon: Globe,   label: "Language",          detail: language === "en" ? "English" : "Bahasa Indonesia", action: "language" as const },
        { icon: Palette, label: "Theme & Appearance", detail: null,    href: "/app/settings" },
        { icon: BookOpen, label: "Reading Settings",  detail: null,    href: "/app/settings" },
        { icon: Bell,    label: "Notifications",      detail: null,    href: "/app/settings" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: Settings, label: "Edit Profile",       detail: null, href: "/app/settings" },
        { icon: Shield,   label: "Privacy & Security", detail: null, href: "/app/settings" },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-background pb-10">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight">{t("profile", "title")}</h1>
      </div>

      {/* ── Avatar + Name ── */}
      <div className="flex flex-col items-center px-5 py-6">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-muted text-foreground text-2xl font-bold">
            {getInitials(profile?.full_name ?? profile?.email ?? "U")}
          </AvatarFallback>
        </Avatar>
        <p className="text-[20px] font-bold tracking-tight">
          {profile?.display_name ?? profile?.full_name ?? "Selah User"}
        </p>
        <p className="text-[14px] text-muted-foreground mt-0.5">{profile?.email}</p>
        <Link
          href="/app/settings"
          className="mt-3 rounded-full border border-border px-5 py-1.5 text-[13px] font-semibold bg-card active:bg-muted transition-colors cursor-pointer"
        >
          Edit Profile
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center border-t border-b border-border/60 divide-x divide-border/60 mx-5 rounded-2xl bg-card overflow-hidden mb-6">
        {[
          { icon: Flame,      value: stats.streak,         label: "Day Streak",    color: "text-amber-500" },
          { icon: NotebookPen, value: stats.journalEntries, label: "Journal",       color: "text-green-600" },
          { icon: BookOpen,   value: stats.activePlans,    label: "Active Plans",  color: "text-blue-600" },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-4">
            <Icon className={`h-4 w-4 ${color} mb-1`} />
            <span className="text-[20px] font-bold leading-none">{value}</span>
            <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Settings sections ── */}
      <div className="px-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
              {section.items.map((item) => {
                const Icon = item.icon;

                if ("action" in item && item.action === "language") {
                  return (
                    <div key={item.label} className="flex items-center px-4 py-3.5 min-h-[52px]">
                      <Icon className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
                      <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                      <div className="flex rounded-xl overflow-hidden border border-border bg-muted text-[12px] font-bold">
                        <button
                          onClick={() => setLanguage("en")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${language === "en" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setLanguage("id")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer border-l border-border ${language === "id" ? "bg-foreground text-background" : "text-muted-foreground"}`}
                        >
                          ID
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={"href" in item ? item.href : "/app/settings"}
                    className="flex items-center px-4 py-3.5 min-h-[52px] active:bg-muted transition-colors cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
                    <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                    {item.detail && (
                      <span className="text-[13px] text-muted-foreground mr-2">{item.detail}</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sign out ── */}
      <div className="px-5 mt-8">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[15px] font-semibold active:bg-red-50 dark:active:bg-red-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

    </div>
  );
}
