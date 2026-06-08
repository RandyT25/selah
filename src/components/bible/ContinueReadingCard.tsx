"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface LastRead {
  bookSlug: string;
  bookName: string;
  chapter: number;
}

export function ContinueReadingCard() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("selah_last_read");
      if (stored) setLastRead(JSON.parse(stored));
    } catch {}
  }, []);

  if (!lastRead) return null;

  return (
    <div className="border-t border-[#F0F0F0] dark:border-[#222]">
      <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-2">Continue Reading</p>
      <Link
        href={`/app/bible/${lastRead.bookSlug}/${lastRead.chapter}`}
        className="flex items-center px-5 py-3.5 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
      >
        <div className="h-10 w-10 rounded-xl bg-[#111] dark:bg-white flex items-center justify-center mr-4 flex-shrink-0">
          <BookOpen className="h-5 w-5 text-white dark:text-black" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold">{lastRead.bookName} {lastRead.chapter}</p>
          <p className="text-[12px] text-[#888]">Continue where you left off</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[#CCC] flex-shrink-0" />
      </Link>
    </div>
  );
}
