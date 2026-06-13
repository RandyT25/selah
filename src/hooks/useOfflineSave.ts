"use client";

import { useCallback, useEffect, useState } from "react";

const BIBLE_CACHE = "selah-bible-v2";

export function useOfflineSave() {
  const [cachedPaths, setCachedPaths] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;

  // Load already-cached paths on mount
  useEffect(() => {
    if (!supported) return;
    caches.open(BIBLE_CACHE).then((cache) =>
      cache.keys().then((keys) => {
        const paths = new Set(keys.map((r) => new URL(r.url).pathname));
        setCachedPaths(paths);
      })
    ).catch(() => {});
  }, [supported]);

  // Listen for SW completion messages
  useEffect(() => {
    if (!supported) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "CACHE_CHAPTERS_DONE") return;
      const urls: string[] = event.data.urls ?? [];
      const paths = urls.map((u) => new URL(u, window.location.origin).pathname);
      setCachedPaths((prev) => new Set([...prev, ...paths]));
      setSaving((prev) => {
        const next = new Set(prev);
        paths.forEach((p) => next.delete(p));
        return next;
      });
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [supported]);

  const saveForOffline = useCallback(async (bookSlug: string, totalChapters: number) => {
    if (!supported) return;
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return;

    const chapterPaths = Array.from({ length: totalChapters }, (_, i) =>
      `/bibleapp/bible/${bookSlug}/${i + 1}`
    );
    const apiPaths = Array.from({ length: totalChapters }, (_, i) =>
      `/api/bible/${bookSlug}/${i + 1}`
    );
    const allPaths = [...chapterPaths, ...apiPaths];
    const urls = allPaths.map((p) => window.location.origin + p);

    setSaving((prev) => new Set([...prev, bookSlug]));
    reg.active.postMessage({ type: "CACHE_CHAPTERS", urls });
  }, [supported]);

  const isBookSaved = useCallback((bookSlug: string) =>
    cachedPaths.has(`/bibleapp/bible/${bookSlug}/1`),
  [cachedPaths]);

  const isBookSaving = useCallback((bookSlug: string) =>
    saving.has(bookSlug),
  [saving]);

  return { saveForOffline, isBookSaved, isBookSaving, supported };
}
