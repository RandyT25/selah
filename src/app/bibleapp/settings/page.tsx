"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Palette, Bell, BookOpen, Shield, LogOut, Save, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils/format";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  displayName: z.string().optional(),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<{ full_name: string | null; display_name: string | null; email: string; bio: string | null; location: string | null; website: string | null; avatar_url: string | null } | null>(null);
  const [prefs, setPrefs] = useState<{ font_size: number; font_family: string; theme: string; reading_reminder_enabled: boolean; prayer_reminder_enabled: boolean; push_notifications_enabled: boolean; email_notifications_enabled: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: prefsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
      ]);

      if (profileData) {
        setProfile(profileData);
        reset({
          fullName: profileData.full_name ?? "",
          displayName: profileData.display_name ?? "",
          bio: profileData.bio ?? "",
          location: profileData.location ?? "",
          website: profileData.website ?? "",
        });
      }

      if (prefsData) {
        setPrefs(prefsData);
        setFontSize(prefsData.font_size);
      }
    };
    load();
  }, []);

  const saveProfile = async (data: ProfileForm) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      full_name: data.fullName,
      display_name: data.displayName || null,
      bio: data.bio || null,
      location: data.location || null,
      website: data.website || null,
    }).eq("id", user.id);

    setSaving(false);
    if (error) { toast.error("Failed to save profile"); return; }
    toast.success("Profile updated");
    router.refresh();
  };

  const savePreference = async (key: string, value: unknown) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_preferences").update({ [key]: value } as Record<never, never>).eq("user_id", user.id);
    toast.success("Preference saved");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />Appearance
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />Reading
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {profile && (
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {getInitials(profile.full_name ?? profile.email ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Display Name</Label>
                    <Input {...register("displayName")} placeholder="Optional nickname" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea {...register("bio")} placeholder="Tell the community about yourself..." rows={3} />
                  {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input {...register("location")} placeholder="City, Country" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website</Label>
                    <Input {...register("website")} type="url" placeholder="https://" />
                    {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                  </div>
                </div>

                <Button type="submit" variant="gold" loading={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", bg: "bg-white border-2" },
                    { value: "dark", label: "Dark", bg: "bg-slate-900 border-2" },
                    { value: "system", label: "System", bg: "bg-gradient-to-r from-white to-slate-900 border-2" },
                  ].map(({ value, label, bg }) => (
                    <button
                      key={value}
                      onClick={() => { setTheme(value); savePreference("theme", value); }}
                      className={`p-4 rounded-xl ${bg} ${theme === value ? "border-primary" : "border-border"} transition-all text-sm font-medium`}
                    >
                      <span className={value === "dark" ? "text-white" : ""}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Tab */}
        <TabsContent value="reading">
          <Card>
            <CardHeader><CardTitle>Bible Reading Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Font Size: {fontSize}px</Label>
                </div>
                <Slider
                  min={12}
                  max={32}
                  step={1}
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                  onValueCommit={([v]) => savePreference("font_size", v)}
                />
                <p className="font-serif text-sm" style={{ fontSize: `${fontSize}px` }}>
                  And God said, Let there be light.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Font Style</Label>
                <Select
                  defaultValue={prefs?.font_family ?? "serif"}
                  onValueChange={(v) => savePreference("font_family", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif (Classic)</SelectItem>
                    <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Line Spacing</Label>
                <Select
                  defaultValue={prefs ? "normal" : "normal"}
                  onValueChange={(v) => savePreference("line_spacing", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="loose">Loose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "reading_reminder_enabled", label: "Daily Reading Reminder", description: "Get reminded to read your Bible each day" },
                { key: "prayer_reminder_enabled", label: "Prayer Reminder", description: "Daily reminder to spend time in prayer" },
                { key: "push_notifications_enabled", label: "Push Notifications", description: "Receive notifications on this device" },
                { key: "email_notifications_enabled", label: "Email Notifications", description: "Receive updates and encouragement by email" },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    defaultChecked={prefs?.[key as keyof typeof prefs] as boolean ?? false}
                    onCheckedChange={(v) => savePreference(key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">All core features included</p>
                  </div>
                  <Button variant="gold">Upgrade to Premium</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
