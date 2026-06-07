"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, BookOpen, LayoutList, HandHeart, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { label: "Home",    href: "/app/home",    icon: House       },
  { label: "Bible",   href: "/app/bible",   icon: BookOpen    },
  { label: "Plans",   href: "/app/plans",   icon: LayoutList  },
  { label: "Prayer",  href: "/app/prayer",  icon: HandHeart   },
  { label: "Profile", href: "/app/profile", icon: CircleUser  },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app/home") return pathname === "/app/home" || pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border/40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-[3px] flex-1 py-1"
            >
              {/* Icon container with active pill */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-200",
                  active ? "bg-primary/12" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-200",
                    active
                      ? "text-primary stroke-[2.25]"
                      : "text-muted-foreground stroke-[1.75]"
                  )}
                />
              </div>
              {/* Label */}
              <span
                className={cn(
                  "text-[10px] transition-all duration-200 leading-none",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground font-medium"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
