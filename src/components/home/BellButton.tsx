"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";

export function BellButton() {
  return (
    <button
      className="h-9 w-9 flex items-center justify-center rounded-full active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
      aria-label="Notifications"
      onClick={() => toast("Notifications coming soon", { description: "We'll let you know when this is ready." })}
    >
      <Bell className="h-5 w-5 text-[#888]" strokeWidth={1.5} />
    </button>
  );
}
