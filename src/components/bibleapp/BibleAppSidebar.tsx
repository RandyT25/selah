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
  Sparkles,
  Settings,
} from "lucide-react";
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

const navItems = [
  { label: "Home", href: "/bibleapp/dashboard", icon: LayoutDashboard },
  { label: "Bible", href: "/bibleapp/bible", icon: BookOpen },
  { label: "Plans", href: "/bibleapp/plans", icon: Calendar },
  { label: "Journal", href: "/bibleapp/journal", icon: NotebookPen },
  { label: "Prayer", href: "/bibleapp/community/prayer", icon: HandHeart },
  { label: "Community", href: "/bibleapp/community", icon: Users },
  { label: "AI", href: "/bibleapp/ai", icon: Sparkles },
];

interface CompactSidebarProps {
  profile: Profile | null;
}

export function BibleAppSidebar({ profile }: CompactSidebarProps) {
  const pathname = usePathname();

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
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
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom: Settings + Avatar */}
        <div className="flex flex-col items-center gap-2">
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
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
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
