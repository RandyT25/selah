"use client";

import { useEffect } from "react";

interface Props {
  bookSlug: string;
  bookName: string;
  chapter: number;
}

export function LastReadTracker({ bookSlug, bookName, chapter }: Props) {
  useEffect(() => {
    try {
      localStorage.setItem("selah_last_read", JSON.stringify({ bookSlug, bookName, chapter }));
    } catch {}
  }, [bookSlug, bookName, chapter]);

  return null;
}
