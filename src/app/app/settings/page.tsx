import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Settings lives at /bibleapp/settings — redirect there until full rebuild
export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");
  redirect("/bibleapp/settings");
}
