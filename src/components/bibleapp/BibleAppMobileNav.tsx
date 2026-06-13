"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/contexts/LanguageContext";

const MOBILE_NAV = [
  { key: "home",      href: "/bibleapp/dashboard",  icon: LayoutDashboard },
  { key: "bible",     href: "/bibleapp/bible",       icon: BookOpen },
  { key: "journal",   href: "/bibleapp/journal",     icon: NotebookPen },
  { key: "community", href: "/bibleapp/community",   icon: Users },
  { key: "growth",    href: "/bibleapp/growth",      icon: TrendingUp },
] as const;

export function BibleAppMobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (href: string) => {
    if (href === "/bibleapp/dashboard") return pathname === "/bibleapp/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
              <span className="text-[10px] font-medium">{t("nav", item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
