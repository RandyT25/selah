"use client";

import { useState } from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { UserPreferences } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface Props {
  email: string;
  prefs: UserPreferences | null;
}

export function SettingsClient({ email, prefs }: Props) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [fontSize, setFontSize] = useState(prefs?.font_size ?? 19);
  const [fontFamily, setFontFamily] = useState(prefs?.font_family ?? "serif");
  const [lineSpacing, setLineSpacing] = useState(prefs?.line_spacing ?? "relaxed");
  const [reminderEnabled, setReminderEnabled] = useState(prefs?.reading_reminder_enabled ?? false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to update password"); return; }
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingPw(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("user_preferences").update({
      font_size: fontSize,
      font_family: fontFamily as "serif" | "sans" | "mono",
      line_spacing: lineSpacing as "compact" | "normal" | "relaxed" | "loose",
      reading_reminder_enabled: reminderEnabled,
    }).eq("user_id", user.id);
    setSavingPrefs(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Preferences saved");
  };

  return (
    <div className="space-y-2">

      {/* Account */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222]">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Account</p>

        {/* Email */}
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222] first:border-t-0">
          <span className="flex-1 text-[15px]">Email address</span>
          <span className="text-[13px] text-[#888] max-w-[180px] truncate">{email}</span>
        </div>

        {/* Change Password */}
        <div className="border-t border-[#F0F0F0] dark:border-[#222]">
          <button
            onClick={() => setShowPasswordForm(v => !v)}
            className="w-full flex items-center px-5 py-4 min-h-[52px] active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
          >
            <span className="flex-1 text-[15px] text-left">Change password</span>
            <ChevronRight className={`h-4 w-4 text-[#CCC] transition-transform ${showPasswordForm ? "rotate-90" : ""}`} />
          </button>

          {showPasswordForm && (
            <div className="px-5 pb-5 space-y-3">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full h-[46px] rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] px-4 pr-12 text-[15px] outline-none"
                />
                <button
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] cursor-pointer"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-[46px] rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] px-4 text-[15px] outline-none"
              />
              <button
                onClick={handleChangePassword}
                disabled={savingPw || !newPassword || !confirmPassword}
                className="w-full h-[46px] rounded-xl bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[15px] disabled:opacity-40 cursor-pointer active:opacity-70 transition-opacity"
              >
                {savingPw ? "Updating…" : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reading */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Reading</p>

        {/* Font size */}
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222]">
          <span className="flex-1 text-[15px]">Font size</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 1))}
              className="h-8 w-8 rounded-full bg-[#F0F0F0] dark:bg-[#222] text-[#111] dark:text-white font-bold text-[18px] flex items-center justify-center cursor-pointer active:opacity-70"
            >−</button>
            <span className="text-[15px] font-semibold w-8 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize(s => Math.min(30, s + 1))}
              className="h-8 w-8 rounded-full bg-[#F0F0F0] dark:bg-[#222] text-[#111] dark:text-white font-bold text-[18px] flex items-center justify-center cursor-pointer active:opacity-70"
            >+</button>
          </div>
        </div>

        {/* Font style */}
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222]">
          <span className="flex-1 text-[15px]">Font style</span>
          <div className="flex rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#333]">
            {(["serif", "sans"] as const).map((f, i) => (
              <button
                key={f}
                onClick={() => setFontFamily(f)}
                className={`px-3.5 py-2 text-[12px] font-semibold transition-colors cursor-pointer ${
                  fontFamily === f
                    ? "bg-[#111] dark:bg-white text-white dark:text-black"
                    : "text-[#888] bg-white dark:bg-black"
                } ${i > 0 ? "border-l border-[#E0E0E0] dark:border-[#333]" : ""}`}
              >
                {f === "serif" ? "Serif" : "Sans"}
              </button>
            ))}
          </div>
        </div>

        {/* Line spacing */}
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222]">
          <span className="flex-1 text-[15px]">Line spacing</span>
          <div className="flex rounded-xl overflow-hidden border border-[#E0E0E0] dark:border-[#333]">
            {(["compact", "normal", "relaxed"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => setLineSpacing(s)}
                className={`px-3 py-2 text-[11px] font-semibold transition-colors cursor-pointer capitalize ${
                  lineSpacing === s
                    ? "bg-[#111] dark:bg-white text-white dark:text-black"
                    : "text-[#888] bg-white dark:bg-black"
                } ${i > 0 ? "border-l border-[#E0E0E0] dark:border-[#333]" : ""}`}
              >
                {s === "compact" ? "S" : s === "normal" ? "M" : "L"}
              </button>
            ))}
          </div>
        </div>

        {/* Save reading prefs */}
        <div className="px-5 py-3">
          <button
            onClick={savePrefs}
            disabled={savingPrefs}
            className="w-full h-[44px] rounded-xl bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[14px] disabled:opacity-40 cursor-pointer active:opacity-70 transition-opacity"
          >
            {savingPrefs ? "Saving…" : "Save Reading Preferences"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">Notifications</p>
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222]">
          <span className="flex-1 text-[15px]">Daily verse reminder</span>
          <button
            onClick={() => setReminderEnabled(v => !v)}
            className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative ${
              reminderEnabled ? "bg-[#111] dark:bg-white" : "bg-[#E0E0E0] dark:bg-[#333]"
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white dark:bg-black rounded-full shadow transition-all ${
              reminderEnabled ? "left-6" : "left-1"
            }`} />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-2">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">About</p>
        <div className="flex items-center px-5 py-4 min-h-[52px] border-t border-[#F0F0F0] dark:border-[#222]">
          <span className="flex-1 text-[15px]">Version</span>
          <span className="text-[13px] text-[#888]">1.0.0</span>
        </div>
      </div>

    </div>
  );
}
