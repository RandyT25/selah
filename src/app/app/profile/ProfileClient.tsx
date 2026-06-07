"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils/format";
import type { Profile } from "@/types/database";

interface ProfileClientProps {
  profile: Profile | null;
  stats: { streak: number; journalEntries: number; activePlans: number };
}

export function ProfileClient({ profile, stats }: ProfileClientProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-full bg-white dark:bg-black pb-28">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight">{t("profile", "title")}</h1>
      </div>

      {/* ── Avatar + Name ── */}
      <div className="flex flex-col items-center px-5 pt-5 pb-7">
        <Avatar className="h-[72px] w-[72px] mb-3">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-[#F0F0F0] dark:bg-[#222] text-[#333] dark:text-white text-2xl font-bold">
            {getInitials(profile?.full_name ?? profile?.email ?? "U")}
          </AvatarFallback>
        </Avatar>
        <p className="text-[20px] font-bold tracking-tight">
          {profile?.display_name ?? profile?.full_name ?? "Selah User"}
        </p>
        {profile?.email && (
          <p className="text-[13px] text-[#888] mt-0.5">{profile.email}</p>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center border-t border-b border-[#F0F0F0] dark:border-[#222] divide-x divide-[#F0F0F0] dark:divide-[#222]">
        {[
          { value: stats.streak,         label: "Day Streak" },
          { value: stats.journalEntries,  label: "Journal" },
          { value: stats.activePlans,     label: "Plans" },
        ].map(({ value, label }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-5">
            <span className="text-[26px] font-bold leading-none tracking-tight">{value}</span>
            <span className="text-[11px] text-[#888] mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Language ── */}
      <div className="border-b border-[#F0F0F0] dark:border-[#222]">
        <div className="flex items-center px-5 py-4 min-h-[52px]">
          <Globe className="h-4 w-4 text-[#888] mr-3 flex-shrink-0" />
          <span className="flex-1 text-[15px] font-medium">Language</span>
          <div className="flex rounded-lg overflow-hidden border border-[#E0E0E0] dark:border-[#333] text-[12px] font-bold">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
                language === "en"
                  ? "bg-[#111] dark:bg-white text-white dark:text-black"
                  : "text-[#888] bg-white dark:bg-black"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("id")}
              className={`px-3.5 py-1.5 transition-colors cursor-pointer border-l border-[#E0E0E0] dark:border-[#333] ${
                language === "id"
                  ? "bg-[#111] dark:bg-white text-white dark:text-black"
                  : "text-[#888] bg-white dark:bg-black"
              }`}
            >
              ID
            </button>
          </div>
        </div>
      </div>

      {/* ── Settings rows ── */}
      {[
        { label: "Reading Settings",   href: "/app/settings" },
        { label: "Notifications",      href: "/app/settings" },
        { label: "Theme & Appearance", href: "/app/settings" },
        { label: "Privacy & Security", href: "/app/settings" },
        { label: "Edit Profile",       href: "/app/settings" },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center px-5 py-4 min-h-[52px] border-b border-[#F0F0F0] dark:border-[#222] active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
        >
          <span className="flex-1 text-[15px]">{item.label}</span>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>
      ))}

      {/* ── Sign out ── */}
      <div className="px-5 mt-8">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 min-h-[52px] text-red-500 text-[15px] font-semibold active:opacity-60 transition-opacity cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

    </div>
  );
}
