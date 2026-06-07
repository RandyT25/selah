import Link from "next/link";
import { Heart, BookOpen, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Selah",
  description: "The story behind Selah — why we built it and what drives us.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="w-16 h-16 selah-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-5xl font-bold mb-6">About Selah</h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Selah was born from a simple conviction: the most important book ever written deserves the most beautiful, thoughtful digital experience.
        </p>
      </div>

      {/* Mission */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-20">
        <h2 className="text-3xl font-bold mb-6">Why Selah?</h2>

        <p className="text-muted-foreground leading-relaxed mb-6">
          The Hebrew word "Selah" appears 71 times in the Psalms. Scholars debate its precise meaning, but in practice, it served as a musical notation — an instruction to pause, breathe, and let what was just said sink in.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-6">
          We live in a world of relentless speed. Notifications, feeds, and content compete for every moment of our attention. In this environment, the ancient spiritual discipline of <em>pause</em> has become almost countercultural.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-6">
          Selah is our contribution to slowing down. It is designed not to capture your attention, but to help you direct your attention — toward the God who speaks through Scripture, toward the practices of reflection and prayer, toward a community of people on the same journey.
        </p>

        <blockquote className="border-l-4 border-primary pl-6 py-2 my-8">
          <p className="font-serif text-2xl leading-relaxed italic text-foreground">
            "Be still, and know that I am God."
          </p>
          <footer className="text-primary font-semibold mt-2">— Psalm 46:10</footer>
        </blockquote>

        <h2 className="text-3xl font-bold mt-12 mb-6">Our Commitments</h2>

        <div className="grid md:grid-cols-3 gap-8 not-prose">
          {[
            {
              icon: BookOpen,
              title: "Scripture First",
              description: "Every feature exists to help you engage more deeply with the Bible. Technology serves theology, not the other way around.",
            },
            {
              icon: Heart,
              title: "Your Privacy",
              description: "Your journal is sacred. We encrypt your personal writings, never sell your data, and never use your reflections for advertising.",
            },
            {
              icon: Globe,
              title: "Accessibility",
              description: "The core experience is free forever. Faith formation should not have a price barrier. Premium features support the mission.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border bg-card">
              <Icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mt-16 mb-6">Built with care</h2>

        <p className="text-muted-foreground leading-relaxed">
          Selah is built by a small team of believers who care deeply about the intersection of faith and technology. We are committed to building something that serves the church — not just another app.
        </p>

        <p className="text-muted-foreground leading-relaxed">
          If Selah has been helpful to you, we would love to hear from you. Your feedback shapes every update. And if you find bugs or have ideas, please share them — we are building this for you.
        </p>
      </div>

      <div className="text-center">
        <Button size="xl" variant="gold" asChild>
          <Link href="/register">
            Begin Your Journey
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
