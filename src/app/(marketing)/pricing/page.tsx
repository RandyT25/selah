import Link from "next/link";
import { Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Selah",
  description: "Selah is free forever. Premium features for power users.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need for a meaningful faith journey",
    badge: null,
    cta: "Get Started Free",
    href: "/register",
    variant: "outline" as const,
    features: [
      "Full Bible reader (KJV + public domain translations)",
      "Unlimited verse highlighting & bookmarks",
      "Verse notes and annotations",
      "Daily devotionals",
      "3 active reading plans",
      "Prayer journal (unlimited entries)",
      "Community prayer wall",
      "Basic AI Bible assistant (10 queries/day)",
      "Offline reading",
      "Dark mode",
    ],
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/month",
    description: "For serious students of the Word",
    badge: "Most Popular",
    cta: "Start Premium",
    href: "/register?plan=premium",
    variant: "gold" as const,
    features: [
      "Everything in Free",
      "All Bible translations",
      "Unlimited reading plans",
      "Unlimited AI Bible assistant",
      "Audio Bible — full library",
      "Verse cross-references",
      "Advanced search",
      "Export journal (PDF, Markdown)",
      "Priority support",
      "No ads, ever",
    ],
  },
  {
    name: "Annual",
    price: "$39.99",
    period: "/year",
    description: "Best value — save 33%",
    badge: "Best Value",
    cta: "Start Annual",
    href: "/register?plan=annual",
    variant: "outline" as const,
    features: [
      "Everything in Premium",
      "Save 33% vs monthly",
      "Early access to new features",
      "Exclusive seasonal reading plans",
      "Advanced analytics dashboard",
      "Family sharing (up to 5 members)",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Simple, honest pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The Bible is free. So is Selah. Premium features exist for those who want to go deeper.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.badge === "Most Popular" ? "border-primary shadow-lg relative" : ""}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="gold" className="px-3">
                  {plan.badge === "Most Popular" && <Star className="h-3 w-3 mr-1 fill-current" />}
                  {plan.badge}
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <h2 className="font-bold text-xl">{plan.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <Button variant={plan.variant} className="w-full mb-6" asChild>
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "Is the free plan really free forever?",
              a: "Yes. The core Selah experience — Bible reading, journaling, devotionals, prayer wall, and basic AI — is free forever. We believe everyone should have access to tools for growing in faith.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards and debit cards through our secure payment provider.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Absolutely. Cancel your premium subscription at any time from Settings. You'll keep premium access until the end of your billing period.",
            },
            {
              q: "Is my data private?",
              a: "Your journal entries and personal notes are encrypted and completely private. We never sell or share your personal data.",
            },
            {
              q: "Is Selah available on all devices?",
              a: "Yes. Selah works as a Progressive Web App (PWA) on any device — install it on your phone, tablet, or desktop for a native app experience.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b pb-6">
              <h3 className="font-semibold mb-2">{q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
