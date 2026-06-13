import Link from "next/link";
import Image from "next/image";
import { BookOpen, Brain, NotebookPen, HandHeart, Church, Map, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selah — Pause. Reflect. Grow.",
  description:
    "A free Bible companion for reading, studying, journaling, and growing in faith — in English and Bahasa Indonesia.",
};

const FEATURES = [
  {
    icon: BookOpen,
    title: "Bible Reading",
    description: "Read the full Bible across multiple translations. Highlight, bookmark, and take notes as you go.",
  },
  {
    icon: Brain,
    title: "AI Bible Study",
    description: "Ask anything about Scripture. Get instant, thoughtful answers from your AI study companion.",
  },
  {
    icon: NotebookPen,
    title: "Faith Journal",
    description: "Capture reflections, prayers, and moments of revelation. Your spiritual diary, always with you.",
  },
  {
    icon: HandHeart,
    title: "Prayer Community",
    description: "Share prayer requests and pray for others. A community of believers lifting each other up.",
  },
  {
    icon: Church,
    title: "Church Community",
    description: "Connect with your local church, join ministry teams, and stay updated on events and announcements.",
  },
  {
    icon: Map,
    title: "Reading Plans",
    description: "Structured plans for every season — from Bible-in-a-year to focused topical studies.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-app-icon.png" alt="Selah" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg">Selah</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/bibleapp/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Button asChild size="sm" variant="gold">
              <Link href="/bibleapp/register">Get started free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 selah-gradient opacity-[0.04] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Free Bible companion · English &amp; Bahasa Indonesia
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Pause.{" "}
            <span className="selah-gradient-text">Reflect.</span>
            {" "}Grow.
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A modern Bible companion for reading, journaling, praying, and growing in faith — with your church community, wherever you are.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="gold" className="text-base px-8">
              <Link href="/bibleapp/register">
                Start reading free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8">
              <Link href="/bibleapp/login">Sign in</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Free to use · No credit card required · Bible reading is always free
          </p>
        </div>
      </section>

      {/* Verse break */}
      <section className="selah-gradient">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-white">
          <blockquote className="font-serif text-2xl sm:text-3xl italic leading-relaxed mb-3">
            &ldquo;Be still, and know that I am God.&rdquo;
          </blockquote>
          <cite className="text-white/70 text-sm not-italic">— Psalm 46:10</cite>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything for your faith journey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All the tools you need to go deeper in Scripture and community — free, in one place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bilingual / global section */}
      <section className="bg-muted/40 border-y">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Made for the global church
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Tersedia dalam Bahasa Indonesia &amp; English
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Selah is built for the Indonesian church and the global community — with full translations, local payment methods, and content in both languages.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {["🇮🇩 Bahasa Indonesia", "🇺🇸 English", "Alkitab AYT", "NIV · ESV · KJV"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 bg-background border rounded-full text-sm text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Start your faith journey today</h2>
        <p className="text-muted-foreground">
          Bible reading is always free. No credit card needed — sign up in under a minute.
        </p>
        <Button asChild size="lg" variant="gold" className="text-base px-10">
          <Link href="/bibleapp/register">
            Create free account
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/logo-app-icon.png" alt="Selah" width={20} height={20} className="rounded" />
            <span>© {new Date().getFullYear()} Selah</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/bibleapp/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
