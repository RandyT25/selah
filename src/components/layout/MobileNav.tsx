"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  NotebookPen,
  HandHeart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bible", href: "/bible", icon: BookOpen },
  { label: "Journal", href: "/journal", icon: NotebookPen },
  { label: "Prayer", href: "/community/prayer", icon: HandHeart },
  { label: "More", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active pill indicator */}
              {active && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-[3px] h-5 rounded-full bg-primary" />
              )}
              <Icon
                className={cn("h-5 w-5", active && "fill-primary/10")}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
