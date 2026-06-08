import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BellButton } from "@/components/home/BellButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";
import { VerseActions } from "@/components/home/VerseActions";
import type { Profile, PlanProgress, ReadingPlan, VerseOfDay } from "@/types/database";

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

export const metadata = { title: "Home" };

const DAILY_VERSES = [
  { verse_text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", verse_reference: "Jeremiah 29:11" },
  { verse_text: "I can do all things through Christ who strengthens me.", verse_reference: "Philippians 4:13" },
  { verse_text: "The Lord is my shepherd; I shall not want.", verse_reference: "Psalm 23:1" },
  { verse_text: "Trust in the Lord with all your heart and lean not on your own understanding.", verse_reference: "Proverbs 3:5" },
  { verse_text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", verse_reference: "John 3:16" },
  { verse_text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", verse_reference: "Joshua 1:9" },
  { verse_text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", verse_reference: "Romans 8:28" },
  { verse_text: "Come to me, all you who are weary and burdened, and I will give you rest.", verse_reference: "Matthew 11:28" },
  { verse_text: "The Lord is my light and my salvation — whom shall I fear?", verse_reference: "Psalm 27:1" },
  { verse_text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", verse_reference: "Philippians 4:6" },
  { verse_text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.", verse_reference: "Ephesians 2:8" },
  { verse_text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me.", verse_reference: "Psalm 23:4" },
  { verse_text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", verse_reference: "1 Corinthians 13:4" },
  { verse_text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", verse_reference: "Isaiah 40:31" },
  { verse_text: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", verse_reference: "Proverbs 18:10" },
  { verse_text: "This is the day the Lord has made; we will rejoice and be glad in it.", verse_reference: "Psalm 118:24" },
  { verse_text: "Jesus said to her, I am the resurrection and the life. The one who believes in me will live, even though they die.", verse_reference: "John 11:25" },
  { verse_text: "Cast all your anxiety on him because he cares for you.", verse_reference: "1 Peter 5:7" },
  { verse_text: "My grace is sufficient for you, for my power is made perfect in weakness.", verse_reference: "2 Corinthians 12:9" },
  { verse_text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.", verse_reference: "Zephaniah 3:17" },
  { verse_text: "Delight yourself in the Lord, and he will give you the desires of your heart.", verse_reference: "Psalm 37:4" },
  { verse_text: "I am the way and the truth and the life. No one comes to the Father except through me.", verse_reference: "John 14:6" },
  { verse_text: "If God is for us, who can be against us?", verse_reference: "Romans 8:31" },
  { verse_text: "Your word is a lamp for my feet, a light on my path.", verse_reference: "Psalm 119:105" },
  { verse_text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", verse_reference: "Matthew 7:7" },
  { verse_text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", verse_reference: "John 14:27" },
  { verse_text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", verse_reference: "Matthew 6:33" },
  { verse_text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", verse_reference: "Psalm 51:10" },
  { verse_text: "I have been crucified with Christ and I no longer live, but Christ lives in me.", verse_reference: "Galatians 2:20" },
  { verse_text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.", verse_reference: "Numbers 6:24-25" },
];

// A set of gradient backgrounds for the verse card — cycles by day-of-week
const VERSE_GRADIENTS = [
  "from-[#1A1A2E] via-[#16213E] to-[#0F3460]",
  "from-[#2D1B69] via-[#1A0533] to-[#0D0D0D]",
  "from-[#0F2027] via-[#203A43] to-[#2C5364]",
  "from-[#1A0000] via-[#3D0000] to-[#1A0000]",
  "from-[#000428] via-[#004e92] to-[#000428]",
  "from-[#200122] via-[#6f0000] to-[#200122]",
  "from-[#0d0d0d] via-[#1A1A1A] to-[#0d0d0d]",
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [profileResult, verseResult, plansResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("verse_of_day").select("*").lte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date", { ascending: false }).limit(1).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
  ]);

  const profile = profileResult.data as Profile | null;
  const fallbackVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];
  const verse = (verseResult.data as VerseOfDay | null) ?? fallbackVerse;
  const activePlans = (plansResult.data ?? []) as unknown as PlanWithProgress[];

  const firstName = (profile?.display_name ?? profile?.full_name ?? "Friend").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const gradient = VERSE_GRADIENTS[new Date().getDay()];

  return (
    <div className="min-h-full bg-[#F7F7F7] dark:bg-black">

      {/* ── Top row ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 bg-white dark:bg-black">
        <div>
          <p className="text-[12px] text-[#888]">{greeting}</p>
          <h1 className="text-[24px] font-bold tracking-tight leading-tight">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <BellButton />
          <Link href="/app/profile">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[#F0F0F0] dark:bg-[#222] text-[#333] dark:text-white text-sm font-bold">
                {getInitials(profile?.full_name ?? profile?.email ?? "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* ── Verse of the Day ── */}
      <div className="px-4 pt-2 pb-4 bg-white dark:bg-black border-b border-[#F0F0F0] dark:border-[#222]">
        <div className={`bg-gradient-to-br ${gradient} rounded-3xl px-6 pt-5 pb-2 overflow-hidden`}>
          {/* Label */}
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-3">Verse of the Day</p>

          {/* Verse text */}
          <p className="font-serif text-white text-[20px] leading-[1.65] mb-3">
            &ldquo;{verse.verse_text}&rdquo;
          </p>

          {/* Reference */}
          <p className="text-[13px] font-semibold text-white/60 mb-4">— {verse.verse_reference}</p>

          {/* Engagement row — client component handles interactions */}
          <VerseActions verseText={verse.verse_text} verseReference={verse.verse_reference} />
        </div>
      </div>

      {/* ── Your Plans ── */}
      <div className="mt-3 bg-white dark:bg-[#111]">
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em]">Your Plans</p>
          <Link href="/app/plans" className="text-[12px] text-[#888] cursor-pointer">See All</Link>
        </div>

        {activePlans.length > 0 ? (
          <div>
            {activePlans.map((progress, i) => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
              return (
                <Link
                  key={progress.id}
                  href={`/app/plans/${progress.plan_id}`}
                  className={`flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#1A1A1A] transition-colors cursor-pointer ${i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate mb-1.5">{plan.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[3px] bg-[#F0F0F0] dark:bg-[#333] rounded-full overflow-hidden">
                        <div className="h-full bg-[#111] dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#888] flex-shrink-0">Day {progress.current_day} · {pct}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#CCC] ml-3 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <Link href="/app/plans" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#1A1A1A] transition-colors cursor-pointer">
            <p className="flex-1 text-[15px] text-[#888]">Find a reading plan to get started</p>
            <ChevronRight className="h-4 w-4 text-[#CCC]" />
          </Link>
        )}
      </div>

      {/* ── Quick links ── */}
      <div className="mt-3 bg-white dark:bg-[#111] divide-y divide-[#F0F0F0] dark:divide-[#222]">
        <Link href="/app/bible" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#1A1A1A] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Read</p>
            <p className="text-[15px] font-semibold">Open Bible</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>

        <Link href="/app/prayer" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#1A1A1A] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Community</p>
            <p className="text-[15px] font-semibold">Prayer Wall</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>

        <Link href="/app/journal" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#1A1A1A] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Reflections</p>
            <p className="text-[15px] font-semibold">My Journal</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>
      </div>

    </div>
  );
}
