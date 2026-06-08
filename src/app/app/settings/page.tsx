import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SettingsClient } from "./SettingsClient";
import type { UserPreferences } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-full bg-white dark:bg-black pb-10">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <Link href="/app/profile" className="text-[#888] cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight">Settings</h1>
      </div>

      <SettingsClient
        email={user.email ?? ""}
        prefs={prefs as UserPreferences | null}
      />
    </div>
  );
}
