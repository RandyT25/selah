import Link from "next/link";
import { Headphones, Play, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible/books";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audio Bible" };

export default function AudioPage() {
  const featured = [
    { book: "John", chapter: 3, description: "Perhaps the most beloved chapter — John 3:16 and the depth of God's love" },
    { book: "Psalms", chapter: 23, description: "The Lord is my shepherd — comfort for every season" },
    { book: "Romans", chapter: 8, description: "No condemnation — victory through the Spirit" },
    { book: "Isaiah", chapter: 53, description: "The suffering servant — prophecy of Christ's sacrifice" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audio Bible</h1>
          <p className="text-sm text-muted-foreground">Listen to Scripture anywhere</p>
        </div>
      </div>

      {/* Featured */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Featured Chapters
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {featured.map(({ book, chapter, description }) => (
            <Card key={`${book}-${chapter}`} className="card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 selah-gradient rounded-xl flex items-center justify-center shrink-0">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{book} {chapter}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Notice */}
      <Card className="mb-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 flex items-start gap-3">
          <Headphones className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Configure Audio Bible</p>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
              Add your FAITHLIFE_API_KEY to enable full audio playback. The free tier includes streaming for all 66 books in multiple translations.
              Visit{" "}
              <a href="https://developers.faithlife.com" target="_blank" rel="noopener noreferrer" className="underline">
                developers.faithlife.com
              </a>{" "}
              to get your API key.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Browse All */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Browse All Books
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {[...OLD_TESTAMENT, ...NEW_TESTAMENT].map((book) => (
            <Link
              key={book.number}
              href={`/bible/${book.name.toLowerCase().replace(/\s+/g, "-")}/1`}
            >
              <Card className="card-hover">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{book.testament}</span>
                  </div>
                  <p className="font-medium text-sm line-clamp-1">{book.name}</p>
                  <p className="text-xs text-muted-foreground">{book.chapters} ch.</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
