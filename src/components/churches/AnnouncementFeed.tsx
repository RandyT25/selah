"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Trash2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/format";
import { getInitials } from "@/lib/utils/format";
import { toast } from "sonner";

interface Announcement {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Props {
  churchId: string;
  isAdmin: boolean;
  announcements: Announcement[];
}

export function AnnouncementFeed({ churchId, isAdmin, announcements: initial }: Props) {
  const [announcements, setAnnouncements] = useState(initial);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const post = async () => {
    if (!content.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/churches/${churchId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to post");
        return;
      }
      const { data } = await res.json();
      setAnnouncements([data, ...announcements]);
      setContent("");
      toast.success("Announcement posted!");
      router.refresh();
    });
  };

  const deleteAnnouncement = async (id: string) => {
    setDeletingId(id);
    const res = await fetch(`/api/churches/${churchId}/announcements`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: id }),
    });
    setDeletingId(null);
    if (!res.ok) { toast.error("Failed to delete"); return; }
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Post Announcement</p>
            <Textarea
              placeholder="Share an update with your church members..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={1000}
              className="resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{content.length}/1000</span>
              <Button
                size="sm"
                variant="gold"
                onClick={post}
                disabled={!content.trim() || isPending}
                className="gap-1.5"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No announcements yet</p>
            {isAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                Post an update to let your members know what&apos;s happening
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const name = a.profiles?.display_name ?? a.profiles?.full_name ?? "Admin";
            return (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={a.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium">{name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(a.created_at)}</span>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteAnnouncement(a.id)}
                              disabled={deletingId === a.id}
                            >
                              {deletingId === a.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{a.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
