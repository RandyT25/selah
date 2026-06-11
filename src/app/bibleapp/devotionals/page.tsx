import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Devotional } from "@/types/database";
import { Clock, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Devotionals" };

export default async function DevotionalsPage() {
  const supabase = await createClient();

  const [featuredResult, recentResult] = await Promise.all([
    supabase.from("devotionals").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }).limit(3),
    supabase.from("devotionals").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(12),
  ]);
  const featured = (featuredResult.data ?? []) as Devotional[];
  const recent = (recentResult.data ?? []) as Devotional[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Devotionals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Short, meaningful reflections for your daily walk with God
        </p>
      </div>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Featured
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((devo) => (
              <Link key={devo.id} href={`/bibleapp/devotionals/${devo.slug}`}>
                <Card className="card-hover h-full">
                  <CardContent className="p-5 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                      <Badge variant="gold" className="text-[10px]">{devo.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 flex-1">
                      {devo.title}
                    </h3>
                    {devo.key_verse && (
                      <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
                        "{devo.key_verse}" — {devo.key_verse_reference}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {devo.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{devo.reading_time_minutes} min</span>
                      <span>·</span>
                      <span>{formatDate(devo.published_at ?? devo.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Recent */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Recent Devotionals
        </h2>
        <div className="space-y-3">
          {recent?.map((devo) => (
            <Link key={devo.id} href={`/bibleapp/devotionals/${devo.slug}`}>
              <Card className="card-hover">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{devo.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(devo.published_at ?? devo.created_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{devo.title}</h3>
                    {devo.key_verse_reference && (
                      <p className="text-xs text-primary mb-1">{devo.key_verse_reference}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{devo.excerpt}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{devo.reading_time_minutes} min read</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
