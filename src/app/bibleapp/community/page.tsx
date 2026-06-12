import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HandHeart, Users, Plus, UserPlus, Church, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatRelativeTime } from "@/lib/utils/format";
import type { Metadata } from "next";
import type { PrayerRequest } from "@/types/database";

export const metadata: Metadata = { title: "Community" };

type PrayerWithAuthor = PrayerRequest & {
  profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
};
type FriendWithProfile = {
  id: string;
  profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [prayersResult, friendsResult, churchesResult] = await Promise.all([
    supabase.from("prayer_requests").select("*, profiles(id, full_name, display_name, avatar_url)").eq("is_public", true).order("created_at", { ascending: false }).limit(10),
    supabase.from("friendships").select("*, profiles!friendships_addressee_id_fkey(id, full_name, display_name, avatar_url)").eq("requester_id", user.id).eq("status", "accepted").limit(10),
    supabase.from("churches").select("id, name, city, denomination, member_count, logo_url, is_verified").order("member_count", { ascending: false }).limit(4),
  ]);

  const publicPrayers = (prayersResult.data ?? []) as unknown as PrayerWithAuthor[];
  const friends = (friendsResult.data ?? []) as unknown as FriendWithProfile[];
  const featuredChurches = churchesResult.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground text-sm mt-1">Grow together in faith</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prayer Wall Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Prayer Wall
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="gold" asChild>
                <Link href="/bibleapp/community/prayer?action=new">
                  <Plus className="h-4 w-4 mr-1" />Add Request
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/bibleapp/community/prayer">View All</Link>
              </Button>
            </div>
          </div>

          {publicPrayers.length > 0 ? (
            <div className="space-y-3">
              {publicPrayers.slice(0, 5).map((prayer) => {
                const author = prayer.profiles;
                return (
                  <Card key={prayer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 mt-0.5">
                          <AvatarFallback className="text-xs">
                            {prayer.is_anonymous ? "🙏" : getInitials(author?.full_name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {prayer.is_anonymous ? "Anonymous" : (author?.display_name ?? author?.full_name ?? "Someone")}
                            </span>
                            <Badge variant="outline" className="text-[10px]">{prayer.category}</Badge>
                          </div>
                          <p className="font-medium text-sm">{prayer.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prayer.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">🙏 {prayer.prayer_count} praying</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(prayer.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <HandHeart className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No public prayers yet</p>
                <Button size="sm" variant="gold" className="mt-3" asChild>
                  <Link href="/bibleapp/community/prayer?action=new">Be the first to pray</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Churches + Friends sidebar */}
        <div className="space-y-6">

        {/* Churches preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />Churches
            </h2>
            <Button size="sm" variant="outline" asChild>
              <Link href="/bibleapp/community/churches">View All</Link>
            </Button>
          </div>
          {featuredChurches.length > 0 ? (
            <div className="space-y-2">
              {featuredChurches.map((church) => (
                <Link key={church.id} href={`/bibleapp/community/churches/${church.id}`}>
                  <Card className="card-hover">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg shrink-0">
                        <AvatarImage src={church.logo_url ?? undefined} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-sm">
                          {church.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{church.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{church.city}</span>
                          {church.denomination && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 ml-0.5">{church.denomination}</Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{church.member_count} m</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <Church className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No churches yet</p>
                <Button size="sm" variant="gold" className="mt-2" asChild>
                  <Link href="/bibleapp/community/churches">Add Church</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Friends */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />My Friends
            </h2>
            <Button size="sm" variant="ghost" className="text-primary">
              <UserPlus className="h-4 w-4 mr-1" />Add
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friendship) => {
                    const friend = friendship.profiles;
                    if (!friend) return null;
                    return (
                      <div key={friendship.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(friend.full_name ?? "U")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{friend.display_name ?? friend.full_name}</p>
                        </div>
                        <Separator />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No friends yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect with others in your faith community</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        </div>{/* end sidebar */}
      </div>
    </div>
  );
}
