import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, FileText, Flag, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reading Plans", href: "/admin/plans", icon: BookOpen },
  { label: "Devotionals", href: "/admin/devotionals", icon: FileText },
  { label: "Moderation", href: "/admin/moderation", icon: Flag },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "moderator"].includes(profile.role)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 flex flex-col">
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 selah-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2">
            ← Back to App
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
