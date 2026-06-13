import Link from "next/link";
import { Headphones, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible/books";
import { OfflineBookSection } from "@/components/audio/OfflineBookSection";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audio Bible" };

const FEATURED = [
  { book: "John",    chapter: 3,  description: "John 3:16 and the depth of God's love"          },
  { book: "Psalms",  chapter: 23, description: "The Lord is my shepherd — comfort for every season" },
  { book: "Romans",  chapter: 8,  description: "No condemnation — victory through the Spirit"    },
  { book: "Isaiah",  chapter: 53, description: "The suffering servant — prophecy of Christ's sacrifice" },
];

export default function AudioPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audio Bible</h1>
          <p className="text-sm text-muted-foreground">Listen to Scripture anywhere</p>
        </div>
      </div>

      {/* Featured */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Featured Chapters
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURED.map(({ book, chapter, description }) => (
            <Link
              key={`${book}-${chapter}`}
              href={`/bibleapp/bible/${book.toLowerCase()}/${chapter}`}
            >
              <Card className="card-hover">
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
            </Link>
          ))}
        </div>
      </div>

      {/* Offline save — client component, premium-gated */}
      <OfflineBookSection />

      {/* Browse All */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Browse All Books
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {[...OLD_TESTAMENT, ...NEW_TESTAMENT].map((book) => {
            const slug = book.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link key={book.number} href={`/bibleapp/bible/${slug}/1`}>
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
            );
          })}
        </div>
      </div>

    </div>
  );
}
