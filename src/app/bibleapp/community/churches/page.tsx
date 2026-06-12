import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Users, Church, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateChurchModal } from "@/components/churches/CreateChurchModal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Churches" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ChurchesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("churches")
    .select("*")
    .order("member_count", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,denomination.ilike.%${q}%`);
  }

  const { data } = await query;
  const churches = data ?? [];

  // Which ones the current user has joined
  const { data: myMemberships } = user
    ? await supabase.from("church_members").select("church_id").eq("user_id", user.id)
    : { data: [] };
  const joinedIds = new Set((myMemberships ?? []).map((m) => m.church_id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            Church Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find and connect with churches in your community
          </p>
        </div>
        {user && <CreateChurchModal />}
      </div>

      {/* Search */}
      <form className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name, city, or denomination..."
          className="pl-9"
        />
      </form>

      {/* Results */}
      {churches.length === 0 ? (
        <div className="text-center py-16">
          <Church className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">
            {q ? `No churches found for "${q}"` : "No churches yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {q ? "Try a different search term" : "Be the first to add your church!"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {churches.map((church) => (
            <Link key={church.id} href={`/bibleapp/community/churches/${church.id}`}>
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12 rounded-lg shrink-0">
                      <AvatarImage src={church.logo_url ?? undefined} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {church.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm leading-tight">{church.name}</h3>
                        {church.is_verified && (
                          <span className="text-primary text-xs">✓</span>
                        )}
                      </div>
                      {church.denomination && (
                        <Badge variant="outline" className="text-[10px] mt-1">{church.denomination}</Badge>
                      )}
                    </div>
                  </div>

                  {church.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {church.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{church.city}{church.province ? `, ${church.province}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{church.member_count} member{church.member_count !== 1 ? "s" : ""}</span>
                      {joinedIds.has(church.id) && (
                        <Badge variant="gold" className="text-[9px] px-1.5 py-0 ml-1">Joined</Badge>
                      )}
                    </div>
                    {church.pastor_name && (
                      <p className="truncate">Ps. {church.pastor_name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
