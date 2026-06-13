import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Selah",
  description: "How Selah collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-app-icon.png" alt="Selah" width={24} height={24} className="rounded" />
            <span className="font-semibold">Selah</span>
          </Link>
          <Link href="/bibleapp/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Selah (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains what data we collect when you use the Selah app, how we use it, and your rights regarding that data.
        </p>

        <Section title="1. What We Collect">
          <p><strong className="text-foreground">Account information:</strong> Your email address and password (stored securely via Supabase Auth) when you create an account.</p>
          <p><strong className="text-foreground">Profile information:</strong> Your display name, denomination, language preference, and reading goals that you provide during onboarding.</p>
          <p><strong className="text-foreground">Content you create:</strong> Journal entries, prayer requests, highlights, bookmarks, and notes. This content is private by default unless you choose to share it.</p>
          <p><strong className="text-foreground">Usage data:</strong> Reading activity (which chapters you read), streaks, and app interactions. We use this to power your growth dashboard and improve the app.</p>
          <p><strong className="text-foreground">Device information:</strong> Push notification tokens, browser type, and language settings to deliver notifications and localise the experience.</p>
          <p><strong className="text-foreground">Analytics:</strong> Anonymised usage events via PostHog (page views, feature interactions) to understand how the app is used. No personally identifiable information is attached to analytics events unless you are signed in.</p>
          <p><strong className="text-foreground">Location:</strong> Only if you use the church finder feature. We do not track your location in the background.</p>
        </Section>

        <Section title="2. How We Use Your Data">
          <p>We use your data to provide and improve the Selah app — including personalising your reading experience, powering your spiritual growth dashboard, and sending you push notifications you have opted into.</p>
          <p>We do <strong className="text-foreground">not</strong> sell your personal data to third parties. We do not use your data for advertising.</p>
          <p>Journal entries and prayer requests are stored encrypted at rest in our database and are never used to train AI models.</p>
        </Section>

        <Section title="3. Data Storage and Security">
          <p>Your data is stored in Supabase-hosted PostgreSQL databases with row-level security policies ensuring each user can only access their own data. Connections are encrypted in transit via TLS.</p>
          <p>We use Supabase (database and authentication) and Vercel (hosting). Both are SOC 2 compliant services.</p>
        </Section>

        <Section title="4. Third-Party Services">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Supabase</strong> — authentication and database (supabase.com)</li>
            <li><strong className="text-foreground">Vercel</strong> — app hosting (vercel.com)</li>
            <li><strong className="text-foreground">PostHog</strong> — anonymised usage analytics (posthog.com)</li>
            <li><strong className="text-foreground">Google Gemini</strong> — AI Bible study responses. Your questions are sent to Google&apos;s API but are not stored beyond the current session.</li>
            <li><strong className="text-foreground">Stripe / Xendit</strong> — payment processing for Premium subscriptions. We never store your payment card details.</li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <p>You can request a copy of your data, correction of inaccurate data, or deletion of your account and all associated data at any time by emailing us or using the account deletion option in the app settings.</p>
          <p>If you are in Indonesia, you have rights under Undang-Undang Perlindungan Data Pribadi (UU PDP). If you are in the EU/EEA, you have rights under the GDPR.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your data for as long as your account is active. If you delete your account, your personal data and content are deleted within 30 days, except where we are required to retain records for legal or financial compliance.</p>
        </Section>

        <Section title="7. Children">
          <p>Selah is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>We may update this policy from time to time. We will notify you of material changes via the app or by email. Continued use of the app after changes constitutes acceptance.</p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:hello@selahapp.com" className="text-primary hover:underline">
              hello@selahapp.com
            </a>
            .
          </p>
        </Section>
      </main>

      <footer className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Selah</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
