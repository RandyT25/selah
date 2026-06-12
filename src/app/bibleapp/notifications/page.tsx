import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, HandHeart, Users, Church, Star, UserPlus, BookOpen, CheckCheck, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

interface NotifRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_META: Record<string, { icon: React.ElementType; color: string; href?: (data: Record<string, string>) => string }> = {
  prayer_prayed:        { icon: HandHeart,  color: "text-rose-500",   href: (d) => d.prayer_id ? `/bibleapp/community/prayer` : "#" },
  prayer_reminder:      { icon: HandHeart,  color: "text-rose-500" },
  friend_request:       { icon: UserPlus,   color: "text-blue-500" },
  friend_accepted:      { icon: Users,      color: "text-blue-500" },
  church_joined:        { icon: Church,     color: "text-amber-500",  href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}?tab=members` : "#" },
  church_event:         { icon: Church,     color: "text-amber-500",  href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}?tab=events` : "#" },
  church_announcement:  { icon: Megaphone,  color: "text-amber-500",  href: (d) => d.church_id ? `/bibleapp/community/churches/${d.church_id}?tab=announcements` : "#" },
  streak_milestone:     { icon: Star,       color: "text-yellow-500" },
  plan_completed:       { icon: BookOpen,   color: "text-green-500" },
  reading_reminder:     { icon: BookOpen,   color: "text-green-500" },
  devotional_published: { icon: BookOpen,   color: "text-indigo-500" },
  verse_of_day:         { icon: BookOpen,   color: "text-indigo-500" },
  comment_reply:        { icon: Users,      color: "text-blue-500" },
  system:               { icon: Bell,       color: "text-muted-foreground" },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const { data: rawNotifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifs = (rawNotifs ?? []) as NotifRow[];
  const unread = notifs.filter((n) => !n.is_read);

  if (unread.length > 0) {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unread.length} new</p>
          )}
        </div>
        {unread.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCheck className="h-4 w-4" />
            <span>Marked all as read</span>
          </div>
        )}
      </div>

      {notifs.length === 0 ? (
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
            const href = meta.href ? meta.href(notif.data ?? {}) : undefined;

            const inner = (
              <Card className={notif.is_read ? "opacity-70" : "border-primary/20 bg-primary/5"}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notif.title}</p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                    {notif.body && (
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(notif.created_at)}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">{notif.type.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            return href ? (
              <Link key={notif.id} href={href}>{inner}</Link>
            ) : (
              <div key={notif.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
