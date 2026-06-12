/** Translate English text to Indonesian using MyMemory free API. Results cached by Next.js for 24h. */
export async function translateToId(text: string): Promise<string> {
  if (!text?.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|id`;
    const resp = await fetch(url, { next: { revalidate: 86400 } });
    if (!resp.ok) return text;
    const data = await resp.json();
    const translated: string = data?.responseData?.translatedText;
    return translated && translated !== "NO QUERY SPECIFIED" ? translated : text;
  } catch {
    return text;
  }
}

/** Translate multiple strings in parallel, falling back to original on error. */
export async function translateAllToId(texts: (string | null)[]): Promise<(string | null)[]> {
  return Promise.all(
    texts.map(t => (t ? translateToId(t) : Promise.resolve(null)))
  );
}
