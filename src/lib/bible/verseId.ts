// Generates a stable, UUID-formatted ID for any Bible verse.
// Deterministic: same book/chapter/verse always → same UUID.
// Works on client and server (no async, no Node.js modules needed).

function fnv32(input: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

export function verseToId(bookName: string, chapter: number, verse: number): string {
  const key = `selah:${bookName}:${chapter}:${verse}`;

  // Four independent 32-bit hashes → 128 bits of data
  const a = fnv32(key, 0x811c9dc5).toString(16).padStart(8, "0");
  const b = fnv32(key, 0xdeadbeef).toString(16).padStart(8, "0");
  const c = fnv32(key, 0xcafebabe).toString(16).padStart(8, "0");
  const d = fnv32(key, 0x12345678).toString(16).padStart(8, "0");

  // hex = 32 hex chars:  [0..7]=a  [8..15]=b  [16..23]=c  [24..31]=d
  const hex = a + b + c + d;

  // UUID format: xxxxxxxx-xxxx-5xxx-[89ab]xxx-xxxxxxxxxxxx
  const p1 = hex.slice(0, 8);                                          // 8
  const p2 = hex.slice(8, 12);                                         // 4
  const p3 = "5" + hex.slice(13, 16);                                  // 4  (version=5)
  const p4 = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)       // variant bit
             + hex.slice(17, 20);                                       // 4
  const p5 = hex.slice(20, 32);                                         // 12

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}
