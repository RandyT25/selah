"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/bibleapp/NotificationBell";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  profile: Profile | null;
  userId: string;
  title?: string;
  unreadNotifications?: number;
}

export function BibleAppHeader({ profile, userId, title, unreadNotifications = 0 }: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-[52px] items-center px-4">
        {/* Centered page title */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-base font-semibold">{title ?? "Selah"}</h1>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NotificationBell userId={userId} initialCount={unreadNotifications} variant="header" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(profile?.full_name ?? profile?.email ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">
                  {profile?.display_name ?? profile?.full_name}
                </p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/bibleapp/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/bibleapp/settings">Settings</Link>
              </DropdownMenuItem>
              {profile?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
