import { createClient } from "@/lib/supabase/server";
import { FEATURE_PLANS, type Plan } from "./plans";

export type FeatureKey =
  | "ai_unlimited"
  | "premium_plans"
  | "journal_pdf_export"
  | "offline_audio"
  | "growth_dashboard";

/**
 * Server-only. Checks whether the authenticated user can access a premium feature.
 * Reads from the subscriptions table — never trust client-passed plan data.
 * Returns false (not throws) when the user is unauthenticated or on the free plan.
 */
export async function canAccess(feature: FeatureKey): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub) return false;

    const plan = sub.plan as Plan;
    const status = sub.status as string;

    if (status !== "active") return false;

    const required = FEATURE_PLANS[feature];
    if (!required) return true;
    return required.includes(plan);
  } catch {
    return false;
  }
}

/**
 * Server-only. Returns the current user's plan and premium status.
 * Safe to call from any server component or API route.
 */
export async function getUserPlan(): Promise<{ plan: Plan; isPremium: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { plan: "free", isPremium: false };

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = (sub?.plan as Plan) ?? "free";
    const isPremium =
      (plan === "premium" || plan === "annual") && sub?.status === "active";

    return { plan, isPremium };
  } catch {
    return { plan: "free", isPremium: false };
  }
}
