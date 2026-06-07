import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  return (
    <div className="min-h-full bg-white dark:bg-black">

      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <Link href="/app/profile" className="text-[#888] cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight">Settings</h1>
      </div>

      <div className="border-t border-[#F0F0F0] dark:border-[#222]">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Account</p>
        {[
          { label: "Email address", value: user.email },
          { label: "Change password", value: null },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center px-5 py-4 min-h-[52px] ${i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
          >
            <span className="flex-1 text-[15px]">{item.label}</span>
            {item.value && <span className="text-[13px] text-[#888]">{item.value}</span>}
          </div>
        ))}
      </div>

      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Reading</p>
        {[
          { label: "Default Bible version", value: "KJV" },
          { label: "Font size", value: "Medium" },
          { label: "Line spacing", value: "Comfortable" },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center px-5 py-4 min-h-[52px] ${i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
          >
            <span className="flex-1 text-[15px]">{item.label}</span>
            <span className="text-[13px] text-[#888]">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Notifications</p>
        <div className="flex items-center px-5 py-4 min-h-[52px]">
          <span className="flex-1 text-[15px]">Daily verse reminder</span>
          <span className="text-[13px] text-[#888]">On</span>
        </div>
      </div>

      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">About</p>
        {[
          { label: "Version", value: "1.0.0" },
          { label: "Terms of Service", value: null },
          { label: "Privacy Policy", value: null },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center px-5 py-4 min-h-[52px] ${i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
          >
            <span className="flex-1 text-[15px]">{item.label}</span>
            {item.value && <span className="text-[13px] text-[#888]">{item.value}</span>}
          </div>
        ))}
      </div>

    </div>
  );
}
