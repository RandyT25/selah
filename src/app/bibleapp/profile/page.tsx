import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, Calendar, Flame, BookOpen, NotebookPen } from "lucide-react";
import Link from "next/link";
import type { Profile, PlanProgress, ReadingPlan } from "@/types/database";

type ProgressWithPlan = PlanProgress & { reading_plans: ReadingPlan | null };
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDate, formatStreakDays } from "@/lib/utils/format";
import { getServerT } from "@/lib/utils/server-i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const t = await getServerT();
  const [profileResult, journalResult, prayerResult, plansResult] = await Promise.all([
    supabase.from("profiles").select("*, subscriptions(plan, status)").eq("id", user.id).single(),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("plan_progress").select("*, reading_plans(title)").eq("user_id", user.id).not("completed_at", "is", null).limit(5),
  ]);

  const profile = profileResult.data as (Profile & { subscriptions?: { plan: string; status: string }[] | null }) | null;
  const journalCount = journalResult.count;
  const prayerCount = prayerResult.count;
  const completedPlans = (plansResult.data ?? []) as unknown as ProgressWithPlan[];

  if (!profile) redirect("/bibleapp/dashboard");

  const subscription = profile.subscriptions;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(profile.full_name ?? profile.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {profile.display_name ?? profile.full_name ?? "User"}
            </h1>
            <p className="text-muted-foreground">{profile.email}</p>
            {profile.bio && (
              <p className="text-sm mt-2 max-w-sm">{profile.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {subscription && Array.isArray(subscription) && subscription.length > 0 && subscription[0].plan !== "free" && (
                <Badge variant="gold">
                  ✨ {subscription[0].plan === "premium" ? "Premium" : "Annual"}
                </Badge>
              )}
              {profile.location && (
                <span className="text-xs text-muted-foreground">📍 {profile.location}</span>
              )}
              <span className="text-xs text-muted-foreground">
                Joined {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/bibleapp/settings">
            <Settings className="h-4 w-4 mr-1" />
            {t("profile", "edit_profile")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Flame, label: t("profile", "streak"), value: profile.streak_count, color: "text-amber-500" },
          { icon: Calendar, label: t("profile", "longest_streak"), value: profile.longest_streak, color: "text-blue-500" },
          { icon: NotebookPen, label: t("profile", "journal_entries"), value: journalCount ?? 0, color: "text-purple-500" },
          { icon: BookOpen, label: t("profile", "prayer_requests"), value: prayerCount ?? 0, color: "text-pink-500" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Plans */}
      {completedPlans && completedPlans.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">{t("profile", "completed_plans")}</h2>
          <div className="space-y-2">
            {completedPlans.map((progress) => {
              const plan = progress.reading_plans;
              return (
                <div key={progress.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{plan?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("profile", "completed_on")} {progress.completed_at ? formatDate(progress.completed_at) : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
