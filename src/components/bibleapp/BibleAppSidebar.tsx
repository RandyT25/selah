"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  NotebookPen,
  HandHeart,
  Users,
  Settings,
} from "lucide-react";
import { NotificationBell } from "@/components/bibleapp/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils/format";
import { useLanguage } from "@/contexts/LanguageContext";

const NAV_KEYS = [
  { key: "home", href: "/bibleapp/dashboard", icon: LayoutDashboard },
  { key: "bible", href: "/bibleapp/bible", icon: BookOpen },
  { key: "plans", href: "/bibleapp/plans", icon: Calendar },
  { key: "journal", href: "/bibleapp/journal", icon: NotebookPen },
  { key: "prayer", href: "/bibleapp/community/prayer", icon: HandHeart },
  { key: "community", href: "/bibleapp/community", icon: Users },
] as const;

interface CompactSidebarProps {
  profile: Profile | null;
  userId: string;
  unreadNotifications?: number;
}

export function BibleAppSidebar({ profile, userId, unreadNotifications = 0 }: CompactSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => {
    if (href === "/bibleapp/dashboard") return pathname === "/bibleapp/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="hidden lg:flex flex-col w-[68px] border-r bg-background h-screen sticky top-0 items-center py-4">
        {/* Logo */}
        <Link href="/bibleapp/dashboard" className="mb-6 flex items-center justify-center">
          <Image
            src="/logo-mark.png"
            alt="Selah"
            width={32}
            height={32}
            className="rounded-sm"
          />
        </Link>

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const label = t("nav", item.key);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: Notifications + Settings + Avatar */}
        <div className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationBell userId={userId} initialCount={unreadNotifications} variant="sidebar" />
            </TooltipTrigger>
            <TooltipContent side="right">Notifications</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/bibleapp/settings"
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isActive("/settings")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t("nav", "settings")}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{t("nav", "settings")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/bibleapp/profile" className="flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(profile?.full_name ?? profile?.email ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
