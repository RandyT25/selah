"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, BookOpen, LayoutList, Compass, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { label: "Home",     href: "/app/home",     icon: House      },
  { label: "Bible",    href: "/app/bible",    icon: BookOpen   },
  { label: "Plans",    href: "/app/plans",    icon: LayoutList },
  { label: "Discover", href: "/app/discover", icon: Compass    },
  { label: "You",      href: "/app/profile",  icon: CircleUser },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app/home") return pathname === "/app/home" || pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-[#F0F0F0] dark:border-[#222]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-[3px] flex-1 py-1 cursor-pointer"
            >
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-all duration-150",
                  active
                    ? "text-[#111] dark:text-white stroke-[2.25]"
                    : "text-[#AAA] stroke-[1.5]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] transition-all duration-150 leading-none",
                  active
                    ? "text-[#111] dark:text-white font-semibold"
                    : "text-[#AAA] font-normal"
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
