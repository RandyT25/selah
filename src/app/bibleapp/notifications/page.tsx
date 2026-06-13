"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, HandHeart, Users, Church, Star, UserPlus,
  BookOpen, CheckCheck, Megaphone, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_META: Record<string, {
  icon: React.ElementType;
  color: string;
  href?: (data: Record<string, string>) => string;
}> = {
  prayer_prayed:        { icon: HandHeart,  color: "text-rose-500",    href: () => "/bibleapp/community/prayer" },
  prayer_reminder:      { icon: HandHeart,  color: "text-rose-500",    href: () => "/bibleapp/community/prayer" },
  friend_request:       { icon: UserPlus,   color: "text-blue-500",    href: () => "/bibleapp/profile" },
  friend_accepted:      { icon: Users,      color: "text-blue-500",    href: () => "/bibleapp/profile" },
  church_joined:        { icon: Church,     color: "text-amber-500",   href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}` : "/bibleapp/community/churches" },
  church_event:         { icon: Church,     color: "text-amber-500",   href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}` : "/bibleapp/community/churches" },
  church_announcement:  { icon: Megaphone,  color: "text-amber-500",   href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}` : "/bibleapp/community/churches" },
  streak_milestone:     { icon: Star,       color: "text-yellow-500",  href: () => "/bibleapp/dashboard" },
  plan_completed:       { icon: BookOpen,   color: "text-green-500",   href: (d) => d.plan_id ? `/bibleapp/plans/${d.plan_id}` : "/bibleapp/plans" },
  reading_reminder:     { icon: BookOpen,   color: "text-green-500",   href: () => "/bibleapp/bible" },
  devotional_published: { icon: BookOpen,   color: "text-indigo-500",  href: (d) => d.slug ? `/bibleapp/devotionals/${d.slug}` : "/bibleapp/devotionals" },
  verse_of_day:         { icon: BookOpen,   color: "text-indigo-500",  href: () => "/bibleapp/dashboard" },
  comment_reply:        { icon: Users,      color: "text-blue-500",    href: () => "/bibleapp/community" },
  system:               { icon: Bell,       color: "text-muted-foreground", href: () => "/bibleapp/dashboard" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const { data } = await res.json();
      setNotifs(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setMarkingAll(false);
  };

  const handleNotifClick = async (notif: NotifRow) => {
    if (!notif.is_read) await markRead(notif.id);
    const meta = TYPE_META[notif.type] ?? TYPE_META.system;
    const href = meta.href ? meta.href(notif.data ?? {}) : "/bibleapp/dashboard";
    router.push(href);
  };

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={markingAll}
            className="gap-1.5 text-xs"
          >
            {markingAll
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCheck className="h-3.5 w-3.5" />
            }
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">All caught up</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            When someone prays for you, joins your church, or you hit a streak milestone — it shows up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((notif) => {
            const meta = TYPE_META[notif.type] ?? TYPE_META.system;
            const Icon = meta.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className="cursor-pointer"
              >
                <Card className={cn(
                  "transition-all hover:shadow-md active:scale-[0.99]",
                  notif.is_read
                    ? "opacity-60 hover:opacity-80"
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                )}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={cn("mt-0.5 shrink-0", meta.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm leading-snug">{notif.title}</p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notif.body && (
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{notif.body}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(notif.created_at)}</p>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">
                          {notif.type.replace(/_/g, " ")}
                        </Badge>
                        {!notif.is_read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                            className="text-[10px] text-primary hover:underline ml-auto"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
