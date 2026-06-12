import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Globe, Calendar, Clock, Repeat, Wifi, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChurchJoinButton } from "@/components/churches/ChurchJoinButton";
import { CreateEventModal } from "@/components/churches/CreateEventModal";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("churches").select("name").eq("id", id).single();
  return { title: data?.name ?? "Church" };
}

function formatRecurrence(type: string | null) {
  if (!type) return null;
  return { weekly: "Every week", biweekly: "Every 2 weeks", monthly: "Every month" }[type] ?? type;
}

function formatEventDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default async function ChurchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const [churchResult, eventsResult, membersResult, myMemberResult] = await Promise.all([
    supabase.from("churches").select("*").eq("id", id).single(),
    supabase.from("church_events").select("*").eq("church_id", id)
      .gte("event_date", today).order("event_date", { ascending: true }),
    supabase.from("church_members")
      .select("*, profiles(id, full_name, display_name, avatar_url)")
      .eq("church_id", id).limit(12),
    user
      ? supabase.from("church_members").select("role").eq("church_id", id).eq("user_id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const church = churchResult.data;
  if (!church) notFound();

  const events = eventsResult.data ?? [];
  const members = membersResult.data ?? [];
  const myRole = myMemberResult.data?.role ?? null;
  const isMember = !!myRole;
  const isAdmin = myRole === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/bibleapp/community/churches">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Churches
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Avatar className="h-16 w-16 rounded-xl shrink-0">
          <AvatarImage src={church.logo_url ?? undefined} />
          <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-2xl">
            {church.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{church.name}</h1>
            {church.is_verified && (
              <Badge variant="gold" className="text-xs">✓ Verified</Badge>
            )}
          </div>
          {church.denomination && (
            <Badge variant="outline" className="text-xs mt-1">{church.denomination}</Badge>
          )}
          {church.description && (
            <p className="text-muted-foreground text-sm mt-2">{church.description}</p>
          )}
        </div>
        {user && (
          <ChurchJoinButton
            churchId={church.id}
            userId={user.id}
            isMember={isMember}
            isAdmin={isAdmin}
          />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </h2>
            {isAdmin && <CreateEventModal churchId={church.id} userId={user!.id} />}
          </div>

          {events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No upcoming events</p>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first event to let members know what's happening
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          {event.is_online && (
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                              <Wifi className="h-2.5 w-2.5" />Online
                            </Badge>
                          )}
                          {event.is_recurring && (
                            <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                              <Repeat className="h-2.5 w-2.5" />
                              {formatRecurrence(event.recurrence_type)}
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatEventDate(event.event_date)}
                          </span>
                          {event.event_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {event.event_time}
                            </span>
                          )}
                          {(event.is_online ? event.online_url : event.location) && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {event.is_online ? (
                                <a href={event.online_url!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                  Join online
                                </a>
                              ) : event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Church info + Members */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">
              <Church className="h-4 w-4 text-primary" />Church Info
            </CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {church.pastor_name && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs w-16 shrink-0 pt-0.5">Pastor</span>
                  <span className="font-medium">{church.pastor_name}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-xs w-16 shrink-0 pt-0.5">Location</span>
                <span>{church.city}{church.province ? `, ${church.province}` : ""}</span>
              </div>
              {church.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs">{church.address}</span>
                </div>
              )}
              {church.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={church.website} target="_blank" rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline truncate"
                  >
                    {church.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{church.member_count} member{church.member_count !== 1 ? "s" : ""}</span>
              </div>
            </CardContent>
          </Card>

          {members.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Members</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => {
                    const profile = (m as unknown as { profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null }).profiles;
                    const name = profile?.display_name ?? profile?.full_name ?? "Member";
                    return (
                      <div key={m.id} className="relative">
                        <Avatar className="h-9 w-9" title={name}>
                          <AvatarImage src={profile?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {m.role === "admin" && (
                          <span className="absolute -top-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center">A</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
