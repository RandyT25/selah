"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookMarked,
  Headphones,
  LayoutDashboard,
  NotebookPen,
  Users,
  Settings,
  User,
  HandHeart,
  Calendar,
  Sparkles,
  Search,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils/format";

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Bible", href: "/bible", icon: BookOpen },
      { label: "Search", href: "/search", icon: Search },
      { label: "Audio Bible", href: "/audio", icon: Headphones },
    ],
  },
  {
    group: "Grow",
    items: [
      { label: "Reading Plans", href: "/plans", icon: Calendar },
      { label: "Devotionals", href: "/devotionals", icon: Sun },
      { label: "Journal", href: "/journal", icon: NotebookPen },
    ],
  },
  {
    group: "Community",
    items: [
      { label: "Community", href: "/community", icon: Users },
      { label: "Prayer Wall", href: "/community/prayer", icon: HandHeart },
      { label: "Saved Verses", href: "/bible?tab=bookmarks", icon: BookMarked },
    ],
  },
  {
    group: "AI",
    items: [
      {
        label: "AI Assistant",
        href: "/ai",
        icon: Sparkles,
        badge: "Beta",
      },
    ],
  },
];

interface AppSidebarProps {
  profile: Profile | null;
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="w-8 h-8 selah-gradient rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Selah</h1>
          <p className="text-xs text-muted-foreground">Pause. Reflect. Grow.</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((group) => (
            <div key={group.group}>
              <p className="px-3 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "nav-item",
                          active ? "nav-item-active" : "nav-item-inactive"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {"badge" in item && item.badge && (
                          <Badge variant="gold" className="text-[10px] py-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-3">
        <div className="space-y-0.5">
          <Link
            href="/settings"
            className={cn(
              "nav-item",
              pathname === "/settings" ? "nav-item-active" : "nav-item-inactive"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            href="/profile"
            className={cn(
              "nav-item",
              pathname === "/profile" ? "nav-item-active" : "nav-item-inactive"
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>

        <Separator className="my-3" />

        {profile && (
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(profile.full_name ?? profile.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile.display_name ?? profile.full_name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
