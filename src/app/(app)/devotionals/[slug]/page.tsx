import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Devotional } from "@/types/database";
import { ArrowLeft, Clock, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils/format";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await supabase.from("devotionals").select("title, excerpt").eq("slug", slug).single();
  const data = result.data as Pick<Devotional, "title" | "excerpt"> | null;
  return {
    title: data?.title ?? "Devotional",
    description: data?.excerpt ?? undefined,
  };
}

export default async function DevotionalPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const devoResult = await supabase
    .from("devotionals")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  const devo = devoResult.data as Devotional | null;
  if (!devo) notFound();

  await supabase.from("devotionals").update({ view_count: devo.view_count + 1 }).eq("id", devo.id);

  const paragraphs = devo.content.split("\n\n");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/devotionals">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Devotionals
        </Link>
      </Button>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="gold">{devo.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(devo.published_at ?? devo.created_at)}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{devo.reading_time_minutes} min read</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold font-serif leading-tight mb-4">
            {devo.title}
          </h1>

          {devo.key_verse && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Key Verse</span>
              </div>
              <blockquote className="font-serif text-lg leading-relaxed italic text-foreground">
                "{devo.key_verse}"
              </blockquote>
              <p className="text-sm font-semibold text-primary mt-2">
                — {devo.key_verse_reference}
              </p>
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {paragraphs.map((para: string, i: number) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <h3 key={i} className="font-semibold text-lg mt-6 mb-2">
                  {para.slice(2, -2)}
                </h3>
              );
            }
            if (para.match(/^\d+\./)) {
              return (
                <p key={i} className="font-serif text-base leading-relaxed mb-4 pl-4 border-l-2 border-primary/30">
                  {para}
                </p>
              );
            }
            return (
              <p key={i} className="font-serif text-base leading-relaxed mb-4">
                {para}
              </p>
            );
          })}
        </div>

        <Separator className="my-8" />

        <footer className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {devo.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </footer>

        <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center">
          <p className="text-sm font-medium mb-3">Want to dive deeper?</p>
          <div className="flex gap-3 justify-center">
            <Button variant="gold" size="sm" asChild>
              <Link href="/journal/new">Journal Your Reflection</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ai">Ask AI Assistant</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
