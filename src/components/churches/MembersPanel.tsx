"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, UserX, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getInitials } from "@/lib/utils/format";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
}

interface Props {
  churchId: string;
  currentUserId: string;
  members: Member[];
}

export function MembersPanel({ churchId, currentUserId, members: initial }: Props) {
  const [members, setMembers] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const changeRole = async (userId: string, role: "admin" | "member") => {
    setLoadingId(userId);
    const res = await fetch(`/api/churches/${churchId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoadingId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to update role");
      return;
    }
    setMembers(members.map((m) => m.user_id === userId ? { ...m, role } : m));
    toast.success(role === "admin" ? "Promoted to admin" : "Changed to member");
    router.refresh();
  };

  const removeMember = async (userId: string) => {
    setLoadingId(userId);
    const res = await fetch(`/api/churches/${churchId}/members/${userId}`, {
      method: "DELETE",
    });
    setLoadingId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to remove member");
      return;
    }
    setMembers(members.filter((m) => m.user_id !== userId));
    toast.success("Member removed");
    router.refresh();
  };

  const admins = members.filter((m) => m.role === "admin");
  const regularMembers = members.filter((m) => m.role === "member");

  const MemberRow = ({ m }: { m: Member }) => {
    const profile = m.profiles;
    const name = profile?.display_name ?? profile?.full_name ?? "Member";
    const isLoading = loadingId === m.user_id;
    const isSelf = m.user_id === currentUserId;

    return (
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{name}</p>
              {m.role === "admin" && (
                <Badge variant="gold" className="text-[9px] px-1.5 py-0">Admin</Badge>
              )}
              {isSelf && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">You</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          {!isSelf && (
            <div className="flex items-center gap-1 shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  {m.role === "member" ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Promote to Admin"
                      onClick={() => changeRole(m.user_id, "admin")}
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 text-muted-foreground hover:text-amber-500"
                      title="Demote to Member"
                      onClick={() => changeRole(m.user_id, "member")}
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Remove from Church"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They will be removed from this church and lose access to members-only content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeMember(m.user_id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {admins.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Admins ({admins.length})
          </p>
          <div className="space-y-2">
            {admins.map((m) => <MemberRow key={m.id} m={m} />)}
          </div>
        </div>
      )}
      {regularMembers.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Members ({regularMembers.length})
          </p>
          <div className="space-y-2">
            {regularMembers.map((m) => <MemberRow key={m.id} m={m} />)}
          </div>
        </div>
      )}
      {members.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No members yet</p>
      )}
    </div>
  );
}
