import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

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

  const notifs = (rawNotifs ?? []) as Notification[];
  const unread = notifs.filter((n) => !n.is_read);

  // Mark all as read
  if (unread.length > 0) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unread.length} unread</p>
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
          <h3 className="font-semibold mb-1">No notifications yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            When you get prayer responses, plan reminders, or community activity, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((notif) => (
            <Card key={notif.id} className={notif.is_read ? "opacity-70" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" style={{ opacity: notif.is_read ? 0 : 1 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{notif.type}</Badge>
                  </div>
                  {notif.body && (
                    <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notif.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
