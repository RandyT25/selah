"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils/format";

interface Team {
  id: string;
  name: string;
  description: string | null;
  leader: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  churchId: string;
  isAdmin:  boolean;
}

export function MinistryTeamsList({ churchId, isAdmin }: Props) {
  const [teams, setTeams]       = useState<Team[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/churches/${churchId}/teams`);
    const data = await res.json();
    setTeams(data.teams ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [churchId]);

  const createTeam = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/churches/${churchId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setName(""); setDesc(""); setShowCreate(false);
      await load();
      toast.success("Team created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Ministry Teams</span>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Team
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : teams.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No ministry teams yet.</p>
      ) : (
        <div className="space-y-2">
          {teams.map((team) => {
            const leaderName = team.leader?.display_name ?? team.leader?.full_name;
            return (
              <div key={team.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{team.name}</p>
                  {team.description && <p className="text-xs text-muted-foreground truncate">{team.description}</p>}
                </div>
                {team.leader && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={team.leader.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">{getInitials(leaderName ?? "?")}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground hidden sm:block">{leaderName}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Ministry Team</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description (optional)" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button className="w-full" onClick={createTeam} disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
