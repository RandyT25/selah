"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HandHeart, Plus, X, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getInitials, formatRelativeTime } from "@/lib/utils/format";
import type { PrayerRequest } from "@/types/database";

const prayerSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Please describe your prayer request").max(1000),
  category: z.string(),
  isAnonymous: z.boolean(),
  isPublic: z.boolean(),
});

type PrayerForm = z.infer<typeof prayerSchema>;

const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "health", label: "Health" },
  { value: "financial", label: "Financial" },
  { value: "relationships", label: "Relationships" },
  { value: "work", label: "Work" },
  { value: "spiritual", label: "Spiritual Growth" },
  { value: "community", label: "Community" },
  { value: "world", label: "World Events" },
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "other", label: "Other" },
];

interface PrayerWithAuthor extends PrayerRequest {
  profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
}

interface PrayerWallProps {
  publicPrayers: PrayerWithAuthor[];
  myPrayers: PrayerRequest[];
  prayedForIds: Set<string>;
  userId: string | undefined;
}

export function PrayerWall({ publicPrayers, myPrayers, prayedForIds, userId }: PrayerWallProps) {
  const [showForm, setShowForm] = useState(false);
  const [prayedFor, setPrayedFor] = useState(prayedForIds);
  const [prayers, setPrayers] = useState(publicPrayers);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<PrayerForm>({
    resolver: zodResolver(prayerSchema),
    defaultValues: { category: "personal", isAnonymous: false, isPublic: true },
  });

  const isPublic = watch("isPublic");
  const isAnonymous = watch("isAnonymous");

  const handlePray = async (prayerId: string) => {
    if (!userId) { toast.error("Sign in to pray for others"); return; }

    if (prayedFor.has(prayerId)) {
      await fetch("/api/prayers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerRequestId: prayerId }),
      });
      setPrayedFor(prev => { const s = new Set(prev); s.delete(prayerId); return s; });
    } else {
      await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "interaction", prayerRequestId: prayerId }),
      });
      setPrayedFor(prev => new Set(Array.from(prev).concat(prayerId)));
      setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, prayer_count: p.prayer_count + 1 } : p));
      toast.success("🙏 Praying with you");
    }
  };

  const onSubmit = async (data: PrayerForm) => {
    if (!userId) { toast.error("Sign in to submit a prayer request"); return; }

    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) { toast.error("Failed to submit prayer request"); return; }

    toast.success("Prayer request submitted 🙏");
    reset();
    setShowForm(false);
  };

  const PrayerCard = ({ prayer }: { prayer: PrayerWithAuthor }) => {
    const author = prayer.profiles;
    const hasPrayed = prayedFor.has(prayer.id);

    return (
      <Card className={prayer.is_answered ? "border-green-200 dark:border-green-800" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 mt-0.5 shrink-0">
              <AvatarImage src={prayer.is_anonymous ? undefined : (author?.avatar_url ?? undefined)} />
              <AvatarFallback className="text-xs">
                {prayer.is_anonymous ? "🙏" : getInitials(author?.full_name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-medium">
                    {prayer.is_anonymous ? "Anonymous" : (author?.display_name ?? author?.full_name ?? "Community Member")}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{prayer.category}</Badge>
                    {prayer.is_answered && (
                      <Badge variant="green" className="text-[10px]">✓ Answered</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(prayer.created_at)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hasPrayed ? "gold" : "outline"}
                  className="shrink-0 h-8"
                  onClick={() => handlePray(prayer.id)}
                >
                  🙏 {prayer.prayer_count}
                </Button>
              </div>
              <p className="font-semibold text-sm mt-2">{prayer.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {prayer.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HandHeart className="h-6 w-6 text-primary" />
            Prayer Wall
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pray for one another and share your needs
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Prayer
        </Button>
      </div>

      <Tabs defaultValue="community">
        <TabsList className="mb-4">
          <TabsTrigger value="community">Community ({prayers.length})</TabsTrigger>
          <TabsTrigger value="mine">My Requests ({myPrayers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="community">
          {prayers.length > 0 ? (
            <div className="space-y-3">
              {prayers.map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <HandHeart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">No public prayer requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to share a prayer request</p>
                <Button variant="gold" size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                  Add Prayer Request
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {myPrayers.length > 0 ? (
            <div className="space-y-3">
              {myPrayers.map((prayer) => (
                <Card key={prayer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{prayer.category}</Badge>
                          {!prayer.is_public && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Lock className="h-3 w-3" />
                              Private
                            </span>
                          )}
                          {prayer.is_answered && (
                            <Badge variant="green" className="text-[10px]">✓ Answered</Badge>
                          )}
                        </div>
                        <p className="font-semibold text-sm">{prayer.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prayer.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          🙏 {prayer.prayer_count} people praying · {formatRelativeTime(prayer.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No personal prayer requests</p>
              <Button variant="gold" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                Add Your First Request
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Prayer Request Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share a Prayer Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Brief summary of your prayer request" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Share more details..."
                className="min-h-[100px]"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue("category", v)} defaultValue="personal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Post anonymously</Label>
              <Switch onCheckedChange={(v) => setValue("isAnonymous", v)} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Share publicly on Prayer Wall</Label>
              <Switch defaultChecked onCheckedChange={(v) => setValue("isPublic", v)} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="gold" className="flex-1" type="submit" loading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
