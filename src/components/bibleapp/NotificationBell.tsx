"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  initialCount: number;
  variant?: "header" | "sidebar";
}

export function NotificationBell({ userId, initialCount, variant = "header" }: Props) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelName = useRef(`notifications:${userId}:${Math.random().toString(36).slice(2)}`);

  // Reset count when user visits the notifications page
  useEffect(() => {
    if (pathname === "/bibleapp/notifications") {
      setCount(0);
    }
  }, [pathname]);

  // Realtime: listen for new notifications for this user
  useEffect(() => {
    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (variant === "sidebar") {
    const isActive = pathname === "/bibleapp/notifications";
    return (
      <Link
        href="/bibleapp/notifications"
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Link>
    );
  }

  return (
    <Button variant="ghost" size="icon-sm" className="relative" asChild>
      <Link href="/bibleapp/notifications">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Link>
    </Button>
  );
}
