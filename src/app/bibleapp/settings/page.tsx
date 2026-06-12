"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Palette, Bell, BookOpen, Shield, LogOut, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils/format";

const api = (path: string, method: string, body: object) =>
  fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const profileSchema = z.object({
  fullName: z.string().min(2),
  displayName: z.string().optional(),
  bio: z.string().max(200).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [profile, setProfile] = useState<{
    full_name: string | null; display_name: string | null; email: string;
    bio: string | null; location: string | null; website: string | null; avatar_url: string | null;
  } | null>(null);
  const [prefs, setPrefs] = useState<{
    font_size: number; font_family: string; theme: string;
    reading_reminder_enabled: boolean; prayer_reminder_enabled: boolean;
    push_notifications_enabled: boolean; email_notifications_enabled: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const { profile: p, prefs: pr } = await res.json();
      if (p) { setProfile(p); reset({ fullName: p.full_name ?? "", displayName: p.display_name ?? "", bio: p.bio ?? "", location: p.location ?? "", website: p.website ?? "" }); }
      if (pr) { setPrefs(pr); setFontSize(pr.font_size); }
    };
    load();
  }, []);

  const saveProfile = async (data: ProfileForm) => {
    setSaving(true);
    const res = await api("/api/profile", "PATCH", {
      full_name: data.fullName, display_name: data.displayName || null,
      bio: data.bio || null, location: data.location || null, website: data.website || null,
    });
    setSaving(false);
    if (!res.ok) { toast.error("Failed to save"); return; }
    toast.success(t("settings", "saved"));
    router.refresh();
  };

  const savePreference = async (key: string, value: unknown) => {
    await api("/api/preferences", "PATCH", { [key]: value });
    toast.success(t("settings", "saved"));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t("settings", "title")}</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />{t("settings", "profile")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />{t("settings", "appearance")}
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />{t("settings", "reading")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />{t("settings", "notifications")}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />{t("settings", "account")}
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>{t("settings", "profile_info")}</CardTitle></CardHeader>
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
                    <Label>{t("settings", "full_name")}</Label>
                    <Input {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings", "display_name")}</Label>
                    <Input {...register("displayName")} placeholder={t("settings", "display_name_hint")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("settings", "bio")}</Label>
                  <Textarea {...register("bio")} placeholder={t("settings", "bio_hint")} rows={3} />
                  {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("settings", "location")}</Label>
                    <Input {...register("location")} placeholder={t("settings", "location_hint")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings", "website")}</Label>
                    <Input {...register("website")} type="url" placeholder="https://" />
                    {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                  </div>
                </div>
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  {t("settings", "save")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>{t("settings", "appearance")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t("settings", "language_label")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: "en" as const, label: "English", flag: "🇺🇸" },
                    { code: "id" as const, label: "Bahasa Indonesia", flag: "🇮🇩" },
                  ].map(({ code, label, flag }) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 text-sm font-medium transition-all ${language === code ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <span className="text-xl">{flag}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>{t("settings", "theme_label")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: t("settings", "theme_light"), bg: "bg-white border-2", textClass: "text-gray-900" },
                    { value: "dark",  label: t("settings", "theme_dark"),  bg: "bg-slate-900 border-2", textClass: "text-white" },
                    { value: "system",label: t("settings", "theme_system"),bg: "bg-gradient-to-br from-white to-slate-900 border-2", textClass: "text-gray-700" },
                  ].map(({ value, label, bg, textClass }) => (
                    <button
                      key={value}
                      onClick={() => { setTheme(value); savePreference("theme", value); }}
                      className={`p-4 rounded-xl ${bg} ${theme === value ? "border-primary" : "border-border"} transition-all text-sm font-medium`}
                    >
                      <span className={textClass}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading */}
        <TabsContent value="reading">
          <Card>
            <CardHeader><CardTitle>{t("settings", "reading_prefs")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t("settings", "font_size")}: {fontSize}px</Label>
                <Slider min={12} max={32} step={1} value={[fontSize]} onValueChange={([v]) => setFontSize(v)} onValueCommit={([v]) => savePreference("font_size", v)} />
                <p className="font-serif text-sm" style={{ fontSize: `${fontSize}px` }}>
                  And God said, Let there be light.
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("settings", "font_family")}</Label>
                <Select defaultValue={prefs?.font_family ?? "serif"} onValueChange={(v) => savePreference("font_family", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">{t("settings", "font_serif")}</SelectItem>
                    <SelectItem value="sans">{t("settings", "font_sans")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("settings", "line_spacing")}</Label>
                <Select defaultValue="normal" onValueChange={(v) => savePreference("line_spacing", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">{t("settings", "spacing_compact")}</SelectItem>
                    <SelectItem value="normal">{t("settings", "spacing_normal")}</SelectItem>
                    <SelectItem value="relaxed">{t("settings", "spacing_relaxed")}</SelectItem>
                    <SelectItem value="loose">{t("settings", "spacing_loose")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>{t("settings", "notifications")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "reading_reminder_enabled",    label: t("settings", "daily_reminder"),      desc: t("settings", "daily_reminder_desc") },
                { key: "prayer_reminder_enabled",     label: t("settings", "prayer_reminder"),     desc: t("settings", "prayer_reminder_desc") },
                { key: "push_notifications_enabled",  label: t("settings", "push_notifications"),  desc: t("settings", "push_notifications_desc") },
                { key: "email_notifications_enabled", label: t("settings", "email_notifications"), desc: t("settings", "email_notifications_desc") },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
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

        {/* Account */}
        <TabsContent value="account">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>{t("settings", "subscription")}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{t("settings", "free_plan")}</p>
                    <p className="text-sm text-muted-foreground">{t("settings", "free_plan_desc")}</p>
                  </div>
                  <Button variant="gold">{t("settings", "upgrade")}</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardHeader><CardTitle className="text-destructive">{t("settings", "danger_zone")}</CardTitle></CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("settings", "sign_out")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
