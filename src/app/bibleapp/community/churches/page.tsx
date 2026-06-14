import { createClient } from "@/lib/supabase/server";
import { Church, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChurchActions } from "@/components/churches/ChurchActions";
import { ChurchesListWithLocation } from "@/components/churches/ChurchesListWithLocation";
import type { Church as ChurchType } from "@/types/database";
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
  const churches = (data ?? []) as ChurchType[];

  const { data: myMemberships } = user
    ? await supabase.from("church_members").select("church_id").eq("user_id", user.id)
    : { data: [] };
  const joinedIds = new Set((myMemberships ?? []).map((m) => m.church_id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Church className="h-6 w-6 text-primary" />
          Church Directory
        </h1>
        <p className="text-muted-foreground text-sm mt-1 mb-3">
          Find and connect with churches in your community
        </p>
        <ChurchActions isLoggedIn={!!user} />
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
        <ChurchesListWithLocation churches={churches} joinedIds={joinedIds} />
      )}
    </div>
  );
}
