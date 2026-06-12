import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  NotebookPen,
  HandHeart,
  Flame,
  ChevronRight,
  Sun,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatStreakDays, getInitials } from "@/lib/utils/format";
import type { Profile, PlanProgress, ReadingPlan, JournalEntry, PrayerRequest, Devotional, VerseOfDay } from "@/types/database";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";

// Fallback verses used when the verse_of_day table has no entry for today.
// Cycles by day-of-year so each visit within the same day shows the same verse.
const FALLBACK_VERSES = [
  { verse_reference: "Psalm 23:1", verse_text: "The Lord is my shepherd; I shall not want." },
  { verse_reference: "John 3:16", verse_text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { verse_reference: "Philippians 4:13", verse_text: "I can do all things through him who strengthens me." },
  { verse_reference: "Proverbs 3:5-6", verse_text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { verse_reference: "Isaiah 40:31", verse_text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
  { verse_reference: "Romans 8:28", verse_text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { verse_reference: "Joshua 1:9", verse_text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
  { verse_reference: "Jeremiah 29:11", verse_text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
  { verse_reference: "Matthew 11:28", verse_text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
  { verse_reference: "Psalm 46:1", verse_text: "God is our refuge and strength, a very present help in trouble." },
  { verse_reference: "Galatians 5:22-23", verse_text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law." },
  { verse_reference: "2 Corinthians 5:17", verse_text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
  { verse_reference: "Psalm 119:105", verse_text: "Your word is a lamp to my feet and a light to my path." },
  { verse_reference: "Romans 12:2", verse_text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect." },
  { verse_reference: "Ephesians 2:8-9", verse_text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast." },
  { verse_reference: "John 14:6", verse_text: "Jesus said to him, 'I am the way, and the truth, and the life. No one comes to the Father except through me.'" },
  { verse_reference: "Psalm 27:1", verse_text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?" },
  { verse_reference: "Lamentations 3:22-23", verse_text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." },
  { verse_reference: "1 Corinthians 13:4-5", verse_text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful." },
  { verse_reference: "James 1:2-3", verse_text: "Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness." },
  { verse_reference: "Psalm 34:18", verse_text: "The Lord is near to the brokenhearted and saves the crushed in spirit." },
  { verse_reference: "Matthew 6:33", verse_text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you." },
  { verse_reference: "Hebrews 11:1", verse_text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
  { verse_reference: "John 16:33", verse_text: "I have said these things to you, that in you you may have peace. In the world you will have tribulation. But take heart; I have overcome the world." },
  { verse_reference: "Psalm 103:2-3", verse_text: "Bless the Lord, O my soul, and forget not all his benefits, who forgives all your iniquity, who heals all your diseases." },
  { verse_reference: "2 Timothy 1:7", verse_text: "For God gave us a spirit not of fear but of power and love and self-control." },
  { verse_reference: "Philippians 4:6-7", verse_text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus." },
  { verse_reference: "Psalm 37:4", verse_text: "Delight yourself in the Lord, and he will give you the desires of your heart." },
  { verse_reference: "Romans 5:8", verse_text: "But God shows his love for us in that while we were still sinners, Christ died for us." },
  { verse_reference: "1 Peter 5:7", verse_text: "Cast all your anxieties on him, because he cares for you." },
  { verse_reference: "Isaiah 41:10", verse_text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { verse_reference: "Colossians 3:23", verse_text: "Whatever you do, work heartily, as for the Lord and not for men." },
  { verse_reference: "Psalm 91:1", verse_text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty." },
  { verse_reference: "John 15:5", verse_text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing." },
  { verse_reference: "Proverbs 31:25", verse_text: "Strength and dignity are her clothing, and she laughs at the time to come." },
  { verse_reference: "Romans 8:38-39", verse_text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord." },
  { verse_reference: "Psalm 16:11", verse_text: "You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore." },
  { verse_reference: "Micah 6:8", verse_text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?" },
  { verse_reference: "Hebrews 4:16", verse_text: "Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need." },
  { verse_reference: "Psalm 145:18", verse_text: "The Lord is near to all who call on him, to all who call on him in truth." },
  { verse_reference: "Acts 1:8", verse_text: "But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth." },
  { verse_reference: "Matthew 5:8", verse_text: "Blessed are the pure in heart, for they shall see God." },
  { verse_reference: "Psalm 55:22", verse_text: "Cast your burden on the Lord, and he will sustain you; he will never permit the righteous to be moved." },
  { verse_reference: "Zephaniah 3:17", verse_text: "The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love; he will exult over you with loud singing." },
  { verse_reference: "2 Chronicles 7:14", verse_text: "If my people who are called by my name humble themselves, and pray and seek my face and turn from their wicked ways, then I will hear from heaven and will forgive their sin and heal their land." },
  { verse_reference: "Psalm 139:14", verse_text: "I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well." },
  { verse_reference: "Mark 11:24", verse_text: "Therefore I tell you, whatever you ask in prayer, believe that you have received it, and it will be yours." },
  { verse_reference: "1 John 1:9", verse_text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness." },
  { verse_reference: "Psalm 23:4", verse_text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
  { verse_reference: "Matthew 28:19-20", verse_text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you." },
  { verse_reference: "Revelation 21:4", verse_text: "He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away." },
  { verse_reference: "Psalm 1:1-2", verse_text: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night." },
] as const;

function getDailyFallbackVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return FALLBACK_VERSES[dayOfYear % FALLBACK_VERSES.length];
}

type PlanProgressWithPlan = PlanProgress & { reading_plans: ReadingPlan | null };
type PrayerWithProfile = PrayerRequest & {
  profiles: { display_name: string | null; full_name: string | null; avatar_url: string | null } | null;
};

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const [
    profileResult,
    verseResult,
    plansResult,
    journalResult,
    prayersResult,
    devosResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("verse_of_day").select("*").lte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date", { ascending: false }).limit(1).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
    supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("prayer_requests").select("*, profiles(display_name, full_name, avatar_url)").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("devotionals").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }).limit(2),
  ]);

  const profile = profileResult.data as Profile | null;
  const verseOfDay = (verseResult.data as VerseOfDay | null) ?? getDailyFallbackVerse();
  const activePlans = (plansResult.data ?? []) as unknown as PlanProgressWithPlan[];
  const recentJournal = (journalResult.data ?? []) as JournalEntry[];
  const publicPrayers = (prayersResult.data ?? []) as unknown as PrayerWithProfile[];
  const featuredDevotionals = (devosResult.data ?? []) as Devotional[];

  const displayName = profile?.display_name ?? profile?.full_name ?? "Friend";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <DailyCheckIn />
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(new Date())} · {formatStreakDays(profile?.streak_count ?? 0)}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <div className="text-right">
            <p className="text-xl font-bold text-amber-600 leading-none">{profile?.streak_count ?? 0}</p>
            <p className="text-xs text-amber-600/70">day streak</p>
          </div>
        </div>
      </div>

      {/* Verse of the Day */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Sun className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Verse of the Day</span>
          </div>
          <blockquote className="font-serif text-xl leading-relaxed text-foreground mb-3">
            "{verseOfDay.verse_text}"
          </blockquote>
          <p className="text-sm font-semibold text-primary">— {verseOfDay.verse_reference}</p>
          {"reflection" in verseOfDay && verseOfDay.reflection && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {verseOfDay.reflection}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="gold" asChild>
              <Link href="/bibleapp/bible">Read Bible</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/bibleapp/journal/new">Journal Reflection</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Reading Plans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reading Plans</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bibleapp/plans" className="text-primary">
                Browse Plans <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {activePlans.length > 0 ? (
            <div className="space-y-3">
              {activePlans.map((progress) => {
                const plan = progress.reading_plans;
                if (!plan) return null;
                const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
                return (
                  <Card key={progress.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{plan.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Day {progress.current_day} of {plan.duration_days}
                          </p>
                        </div>
                        <Badge variant="gold">{pct}%</Badge>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <Button size="sm" className="mt-3 w-full" variant="outline" asChild>
                        <Link href={`/bibleapp/plans/${progress.plan_id}`}>
                          Continue Reading
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No active reading plans</p>
                <p className="text-xs text-muted-foreground mt-1">Start a plan to track your progress</p>
                <Button size="sm" variant="gold" className="mt-4" asChild>
                  <Link href="/bibleapp/plans">Browse Plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/bibleapp/bible", icon: BookOpen, label: "Read Bible", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
              { href: "/bibleapp/journal/new", icon: NotebookPen, label: "New Journal", color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
              { href: "/bibleapp/community/prayer", icon: HandHeart, label: "Prayer Wall", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
              { href: "/bibleapp/plans", icon: Calendar, label: "Plans", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-sm transition-all card-hover text-center"
              >
                <div className={`p-2.5 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Featured Devotionals */}
          {featuredDevotionals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Today's Devotional</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bibleapp/devotionals" className="text-primary">
                    All Devotionals <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {featuredDevotionals.slice(0, 1).map((devo) => (
                <Card key={devo.id} className="card-hover">
                  <CardContent className="p-5">
                    <Badge variant="gold" className="mb-3">{devo.category}</Badge>
                    <h3 className="font-semibold text-base mb-2">{devo.title}</h3>
                    {devo.key_verse && (
                      <p className="text-sm text-muted-foreground italic mb-2">
                        "{devo.key_verse}" — {devo.key_verse_reference}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {devo.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{devo.reading_time_minutes} min read</span>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/bibleapp/devotionals/${devo.slug}`}>Read Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Journal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Journal</CardTitle>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href="/bibleapp/journal"><ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {recentJournal.length > 0 ? (
                recentJournal.map((entry) => (
                  <Link key={entry.id} href={`/bibleapp/journal/${entry.id}`} className="block group">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {entry.title ?? "Untitled Entry"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.created_at)} · {entry.word_count} words
                    </p>
                    <Separator className="mt-3" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">No entries yet</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-primary" asChild>
                    <Link href="/bibleapp/journal/new">Write your first entry</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Prayer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prayer Wall</CardTitle>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href="/bibleapp/community/prayer"><ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {publicPrayers.length > 0 ? (
                publicPrayers.map((prayer) => (
                  <div key={prayer.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarImage src={prayer.is_anonymous ? undefined : (prayer.profiles?.avatar_url ?? undefined)} />
                        <AvatarFallback className="text-[10px]">
                          {prayer.is_anonymous ? "?" : getInitials(prayer.profiles?.full_name ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{prayer.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {prayer.prayer_count} people praying
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No prayer requests</p>
              )}
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/bibleapp/community/prayer">View All Requests</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
