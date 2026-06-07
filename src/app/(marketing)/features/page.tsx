import Link from "next/link";
import { BookOpen, Calendar, NotebookPen, Headphones, Users, Sparkles, Check, ArrowRight, Shield, Wifi, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Selah",
  description: "Explore all the features of Selah — your complete Bible companion.",
};

const featureSections = [
  {
    icon: BookOpen,
    title: "Bible Reader",
    tagline: "Scripture, beautifully presented",
    description: "Read the Bible in a distraction-free environment designed for deep, sustained reading. Every detail has been considered for your comfort and engagement with the Word.",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    features: [
      "King James Version and multiple public domain translations",
      "6 highlight colors — yellow, green, blue, pink, purple, orange",
      "Bookmarks with custom collections",
      "Verse-level notes and annotations",
      "Copy and share individual verses",
      "Chapter navigation with progress tracking",
      "Adjustable font size (12-32px), family, and line spacing",
      "Light, dark, and sepia reading modes",
      "Full offline support — read without internet",
    ],
  },
  {
    icon: Calendar,
    title: "Reading Plans",
    tagline: "Journey through Scripture with purpose",
    description: "Structured reading plans guide you through the Bible with daily readings, progress tracking, and a sense of community.",
    color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
    features: [
      "Bible in a Year — complete 365-day plan",
      "30 Days of Psalms",
      "New Testament in 90 Days",
      "Topical studies (Sermon on the Mount, Fruit of the Spirit)",
      "Seasonal plans (Advent, Easter)",
      "Daily progress tracking",
      "Never lose your place",
      "Join plans with friends",
    ],
  },
  {
    icon: NotebookPen,
    title: "Prayer Journal",
    tagline: "Your sacred space for reflection",
    description: "A beautiful journaling experience for capturing your spiritual journey — reflections, prayers, gratitude, and more.",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
    features: [
      "Rich text editor with formatting tools",
      "6 entry types: reflection, prayer, gratitude, sermon notes, study, general",
      "Mood tracking with 9 emotional states",
      "Tag system for organizing entries",
      "Word count and streak tracking",
      "Private by default — fully secure",
      "Verse references linked to Bible",
      "Full-text search across all entries",
    ],
  },
  {
    icon: Headphones,
    title: "Audio Bible",
    tagline: "Listen while you live",
    description: "Hear the Word of God spoken aloud — during your commute, workout, cooking, or any moment of your day.",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
    features: [
      "Full Old and New Testament audio",
      "Professional narration",
      "Speed control (0.5x — 2x)",
      "Background audio playback",
      "Synced with Bible reader",
      "Offline download for chapters",
      "Sleep timer",
      "Continues where you left off",
    ],
  },
  {
    icon: Users,
    title: "Community",
    tagline: "Grow in faith together",
    description: "Connect with a global community of believers — pray for each other, share reflections, and encourage one another.",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400",
    features: [
      "Public prayer wall for sharing requests",
      "Pray for others with a single tap",
      "Anonymous prayer option",
      "Mark answered prayers",
      "Friend connections",
      "Activity feed",
      "Comment on devotionals",
      "Community reading plan groups",
    ],
  },
  {
    icon: Sparkles,
    title: "AI Bible Study",
    tagline: "Deep study, made accessible",
    description: "Selah AI is your knowledgeable and compassionate Bible study companion — grounded in Scripture, culturally aware, and always pointing back to the Word.",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    badge: "Beta",
    features: [
      "Ask any Bible question in plain language",
      "Verse explanations with historical context",
      "Cross-references and thematic connections",
      "Reflection prompts for journaling",
      "Prayer composition assistance",
      "Sermon notes summarization",
      "Theological concepts explained simply",
      "Always grounded in Scripture",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold mb-6">Everything for your faith journey</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Six deeply integrated tools, one beautiful application. Built for daily use, designed to last a lifetime.
        </p>
      </div>

      <div className="space-y-24">
        {featureSections.map(({ icon: Icon, title, tagline, description, color, badge, features }, index) => (
          <div
            key={title}
            className={`grid lg:grid-cols-2 gap-16 items-start ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
          >
            <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                <Icon className="h-7 w-7" />
              </div>
              {badge && (
                <Badge variant="gold" className="mb-3">{badge}</Badge>
              )}
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">{tagline}</p>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {description}
              </p>
            </div>

            <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Features */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Built for every moment</h2>
        <p className="text-muted-foreground mb-12">Available everywhere, works offline, always with you</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Smartphone, title: "Mobile-First", description: "Optimized for phone use — installed as a PWA for a native app experience" },
            { icon: Wifi, title: "Works Offline", description: "Read your Bible, journal, and access reading plans even without internet" },
            { icon: Shield, title: "Private & Secure", description: "Your journal and notes are encrypted and private. We never sell your data." },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border bg-card">
              <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <Button size="xl" variant="gold" asChild>
          <Link href="/register">
            Start for Free
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
