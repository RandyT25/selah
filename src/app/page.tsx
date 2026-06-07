import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, NotebookPen, Users, Sparkles, Calendar, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selah — Pause. Reflect. Grow.",
  description: "A modern Bible companion for reading, studying, journaling, and growing in faith. Bible reading plans, devotionals, prayer journal, and community.",
};

const features = [
  {
    icon: BookOpen,
    title: "Bible Reader",
    description: "Read Scripture in beautiful typography with highlighting, bookmarks, verse notes, and offline support.",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    icon: Calendar,
    title: "Reading Plans",
    description: "Structured journeys through Scripture — from Bible-in-a-Year to focused 7-day topical studies.",
    color: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  },
  {
    icon: NotebookPen,
    title: "Prayer Journal",
    description: "Capture your reflections, prayers, and spiritual insights with a beautiful rich text journal.",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  },
  {
    icon: Headphones,
    title: "Audio Bible",
    description: "Listen to Scripture during your commute, workout, or quiet moments of reflection.",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  },
  {
    icon: Users,
    title: "Community",
    description: "Pray together, share reflections, and grow in faith alongside a global community.",
    color: "bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
  },
  {
    icon: Sparkles,
    title: "AI Bible Study",
    description: "Ask any question about Scripture and receive thoughtful, grounded answers from Selah AI.",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Daily User",
    text: "Selah has completely transformed my morning devotions. The journal feature alone is worth it.",
    rating: 5,
  },
  {
    name: "Pastor James K.",
    role: "Church Leader",
    text: "I recommend Selah to my whole congregation. It's the most thoughtful Bible app I've seen.",
    rating: 5,
  },
  {
    name: "Rachel T.",
    role: "Bible Study Leader",
    text: "The AI assistant is incredible for digging deeper into passages. It's like having a theologian on call.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/10">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center">
          <Badge variant="gold" className="mb-6 text-sm px-4 py-1.5">
            ✨ Now with AI Bible Study Assistant
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
            Pause.{" "}
            <span className="selah-gradient-text">Reflect.</span>{" "}
            Grow.
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Selah is your modern Bible companion — beautiful, thoughtful, and built for a life of deep faith.
            Read, study, journal, pray, and grow together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="gold" asChild>
              <Link href="/register">
                Start for Free
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/features">See All Features</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Free forever · No credit card required · Available on all devices
          </p>
        </div>

        {/* Decorative gradient */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Verse of the Day Preview */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
            Verse of the Day
          </p>
          <blockquote className="font-serif text-2xl lg:text-3xl leading-relaxed text-foreground mb-4">
            "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
          </blockquote>
          <p className="font-semibold text-primary">— John 3:16, KJV</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything for your faith journey</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Six powerful tools, one elegant application
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <Card key={title} className="card-hover border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bible Reader Preview */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Beautiful Reading Experience
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Read Scripture the way it deserves
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                A distraction-free Bible reader designed for long, immersive reading sessions.
                Highlight, bookmark, and annotate any verse with a single tap.
              </p>
              <ul className="space-y-3">
                {[
                  "Multiple translations (KJV, ASV, WEB, and more)",
                  "6 highlight colors for visual annotation",
                  "Verse-by-verse notes and bookmarks",
                  "Customizable font, size, and spacing",
                  "Dark mode and sepia theme",
                  "Full offline support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="gold" size="lg" className="mt-8" asChild>
                <Link href="/register">Try the Bible Reader</Link>
              </Button>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="text-xs text-slate-400 mb-6 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" />
                Genesis 1 · KJV
              </div>
              <div className="space-y-4 font-serif text-lg leading-loose">
                <p>
                  <span className="text-xs font-bold text-primary/70 align-super mr-1">1</span>
                  In the beginning God created the heaven and the earth.
                </p>
                <p>
                  <span className="text-xs font-bold text-primary/70 align-super mr-1">2</span>
                  And the earth was without form, and void; and darkness was upon the face of the deep.
                </p>
                <p className="bg-yellow-500/20 rounded px-1">
                  <span className="text-xs font-bold text-primary/70 align-super mr-1">3</span>
                  <span>And God said, Let there be light: and there was light.</span>
                </p>
                <p>
                  <span className="text-xs font-bold text-primary/70 align-super mr-1">4</span>
                  And God saw the light, that it was good: and God divided the light from the darkness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by thousands</h2>
            <p className="text-muted-foreground">People growing deeper in their faith with Selah</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <Card key={name} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{text}"</p>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 selah-gradient text-white text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Begin your journey today</h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands who are growing deeper in their faith with Selah.
            Free to start, meaningful forever.
          </p>
          <Button size="xl" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link href="/register">
              Create Your Free Account
              <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
