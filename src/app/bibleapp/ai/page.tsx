import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { AIUsageMeter } from "@/components/premium/AIUsageMeter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Bible Assistant" };

export default async function AIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-3xl mx-auto px-4 py-4 gap-3">
      <AIUsageMeter />
      <div className="flex-1 min-h-0">
        <AIAssistant />
      </div>
    </div>
  );
}
