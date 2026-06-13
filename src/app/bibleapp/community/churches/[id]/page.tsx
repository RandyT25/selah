import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Globe, Calendar, Clock, Repeat, Wifi, Church, Megaphone, ShieldCheck, BarChart3, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { ChurchJoinButton } from "@/components/churches/ChurchJoinButton";
import { CreateEventModal } from "@/components/churches/CreateEventModal";
import { EditChurchModal } from "@/components/churches/EditChurchModal";
import { AnnouncementFeed } from "@/components/churches/AnnouncementFeed";
import { MembersPanel } from "@/components/churches/MembersPanel";
import { MinistryTeamsList } from "@/components/churches/MinistryTeamsList";
import { ChurchPlusGate } from "@/components/churches/ChurchPlusGate";
import { createRawAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Church as ChurchType } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
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
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

export default async function ChurchDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab = "events" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const rawAdmin = createRawAdminClient();
  const [churchResult, myMemberResult, churchSubResult] = await Promise.all([
    supabase.from("churches").select("*").eq("id", id).single(),
    user
      ? supabase.from("church_members").select("role").eq("church_id", id).eq("user_id", user.id).single()
      : Promise.resolve({ data: null }),
    rawAdmin.from("church_subscriptions").select("plan, status").eq("church_id", id).maybeSingle(),
  ]);
  const isChurchPlus = churchSubResult.data?.plan === "plus" && churchSubResult.data?.status === "active";

  const church = churchResult.data as ChurchType | null;
  if (!church) notFound();

  const myRole = myMemberResult.data?.role ?? null;
  const isMember = !!myRole;
  const isAdmin = myRole === "admin";

  // Fetch tab-specific data
  const eventsData = tab === "events" || tab === undefined
    ? await supabase.from("church_events").select("*").eq("church_id", id)
        .gte("event_date", today).order("event_date", { ascending: true })
    : { data: [] };

  const announcementsData = tab === "announcements"
    ? await supabase.from("church_announcements")
        .select("*, profiles(id, full_name, display_name, avatar_url)")
        .eq("church_id", id)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const membersData = tab === "members" && isAdmin
    ? await supabase.from("church_members")
        .select("*, profiles(id, full_name, display_name, avatar_url, email)")
        .eq("church_id", id)
        .order("role", { ascending: false })
    : { data: [] };

  // Sidebar: member avatars preview (always shown)
  const { data: memberAvatars } = await supabase
    .from("church_members")
    .select("id, user_id, role, profiles(id, full_name, display_name, avatar_url)")
    .eq("church_id", id)
    .limit(12);

  const events = eventsData.data ?? [];
  const announcements = (announcementsData.data ?? []) as unknown as Array<{
    id: string; content: string; created_at: string;
    profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
  }>;
  const members = (membersData.data ?? []) as unknown as Array<{
    id: string; user_id: string; role: "admin" | "member"; joined_at: string;
    profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null; email: string } | null;
  }>;

  const TABS = [
    { key: "events",        label: "Events",        icon: Calendar    },
    { key: "announcements", label: "Announcements", icon: Megaphone   },
    ...(isMember ? [{ key: "teams", label: "Teams", icon: Users }] : []),
    ...(isAdmin  ? [
      { key: "members",  label: "Members",    icon: ShieldCheck },
      { key: "analytics",label: "Analytics",  icon: BarChart3   },
    ] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/bibleapp/community/churches">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Churches
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
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
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && <EditChurchModal church={church} />}
          {user && (
            <ChurchJoinButton
              churchId={church.id}
              userId={user.id}
              isMember={isMember}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b mb-5">
            {TABS.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                href={`/bibleapp/community/churches/${id}?tab=${key}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="ml-auto pb-2">
              {tab === "events" && isAdmin && (
                <CreateEventModal churchId={church.id} userId={user!.id} />
              )}
            </div>
          </div>

          {/* Events tab */}
          {tab === "events" && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">No upcoming events</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Add your first event to let members know what&apos;s happening
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
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
                            <Clock className="h-3.5 w-3.5" />{event.event_time}
                          </span>
                        )}
                        {(event.is_online ? event.online_url : event.location) && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {event.is_online ? (
                              <a href={event.online_url!} target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline truncate">
                                Join online
                              </a>
                            ) : event.location}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Announcements tab */}
          {tab === "announcements" && (
            <AnnouncementFeed
              churchId={church.id}
              isAdmin={isAdmin}
              announcements={announcements}
            />
          )}

          {/* Members tab (admin only) */}
          {tab === "members" && isAdmin && (
            <MembersPanel
              churchId={church.id}
              currentUserId={user!.id}
              members={members}
            />
          )}

          {/* Teams tab (all members) */}
          {tab === "teams" && isMember && (
            isChurchPlus ? (
              <MinistryTeamsList churchId={church.id} isAdmin={isAdmin} />
            ) : (
              <ChurchPlusGate churchId={church.id} featureName="Ministry Teams">
                <MinistryTeamsList churchId={church.id} isAdmin={isAdmin} />
              </ChurchPlusGate>
            )
          )}

          {/* Analytics tab (admin only) */}
          {tab === "analytics" && isAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Full analytics dashboard</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/bibleapp/community/churches/${church.id}/analytics`}>
                    <BarChart3 className="h-4 w-4 mr-1" /> Open Dashboard
                  </Link>
                </Button>
              </div>
              {!isChurchPlus && (
                <ChurchPlusGate churchId={church.id} featureName="Church Analytics">
                  <div className="h-24 bg-muted rounded-xl" />
                </ChurchPlusGate>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Church className="h-4 w-4 text-primary" />Church Info
              </CardTitle>
            </CardHeader>
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
                    className="text-primary text-xs hover:underline truncate">
                    {church.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {church.member_count} member{church.member_count !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          {(memberAvatars ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Members</span>
                  {isAdmin && (
                    <Link
                      href={`/bibleapp/community/churches/${id}?tab=members`}
                      className="text-xs font-normal text-primary hover:underline"
                    >
                      Manage
                    </Link>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(memberAvatars ?? []).map((m) => {
                    const profile = (m as unknown as { profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null }).profiles;
                    const name = profile?.display_name ?? profile?.full_name ?? "Member";
                    return (
                      <div key={m.id} className="relative" title={name}>
                        <Avatar className="h-9 w-9">
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
