export type Plan = "free" | "premium" | "annual";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface PlanInfo {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

// Feature key → plans that can access it
export const FEATURE_PLANS: Record<string, Plan[]> = {
  ai_unlimited:       ["premium", "annual"],
  premium_plans:      ["premium", "annual"],
  journal_pdf_export: ["premium", "annual"],
  offline_audio:      ["premium", "annual"],
  growth_dashboard:   ["premium", "annual"],
};

export function isPremiumPlan(plan: Plan, status: SubscriptionStatus): boolean {
  return (plan === "premium" || plan === "annual") && status === "active";
}

export function canAccessFeature(plan: Plan, featureKey: string): boolean {
  const required = FEATURE_PLANS[featureKey];
  if (!required) return true; // Unknown flag = public
  return required.includes(plan);
}

export function getPriceId(plan: "monthly" | "annual"): string {
  const id = plan === "monthly"
    ? process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
    : process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID;
  if (!id) throw new Error(`STRIPE_${plan.toUpperCase()}_PRICE_ID is not configured`);
  return id;
}

export function getChurchPlusPriceId(): string {
  const id = process.env.STRIPE_CHURCH_PLUS_PRICE_ID;
  if (!id) throw new Error("STRIPE_CHURCH_PLUS_PRICE_ID is not configured");
  return id;
}

export const PLAN_DISPLAY = {
  free:    { label: "Free",    price: "$0",    period: ""        },
  premium: { label: "Premium", price: "$3.99", period: "/month"  },
  annual:  { label: "Premium", price: "$29.99",period: "/year"   },
};

export const PREMIUM_FEATURES = [
  { key: "ai_unlimited",       label: "Unlimited AI Bible study"      },
  { key: "premium_plans",      label: "Exclusive reading plans"       },
  { key: "journal_pdf_export", label: "Journal PDF export"            },
  { key: "offline_audio",      label: "Offline audio downloads"       },
  { key: "growth_dashboard",   label: "Spiritual growth dashboard"    },
];

export const FREE_FEATURES = [
  "Complete Bible (KJV + AYT Indonesian)",
  "Unlimited journaling",
  "Prayer wall",
  "Church directory",
  "10 AI queries per day",
  "Reading plans",
  "Push notifications",
];
