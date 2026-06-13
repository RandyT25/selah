import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Selah",
  description: "Terms and conditions for using the Selah Bible companion app.",
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

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          By creating an account or using Selah (&ldquo;the app&rdquo;, &ldquo;the service&rdquo;), you agree to these Terms of Service. Please read them carefully.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>These terms form a binding agreement between you and Selah. If you do not agree, do not use the service. You must be at least 13 years old to use Selah.</p>
        </Section>

        <Section title="2. The Service">
          <p>Selah provides a Bible reading and community app including, but not limited to: Bible reading tools, journaling, prayer community features, reading plans, AI-assisted Bible study, and church community tools.</p>
          <p>We offer a free tier and optional Premium features. We reserve the right to change, limit, or discontinue any feature at any time with reasonable notice.</p>
        </Section>

        <Section title="3. Your Account">
          <p>You are responsible for maintaining the security of your account and password. Selah cannot and will not be liable for any loss or damage from your failure to keep your account secure.</p>
          <p>You must provide accurate information when creating your account. One person may not maintain more than one free account.</p>
        </Section>

        <Section title="4. User Content">
          <p>Content you create in Selah — including journal entries, prayer requests, and notes — remains yours. By posting content to shared features (such as public prayer requests), you grant Selah a non-exclusive licence to display that content within the app.</p>
          <p>You must not post content that is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable. We reserve the right to remove content that violates these terms.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the service or other users&apos; accounts</li>
            <li>Scrape, crawl, or harvest data from the service without written permission</li>
            <li>Use the service to distribute spam or unsolicited communications</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </Section>

        <Section title="6. Premium Subscriptions">
          <p>Certain features require a paid Premium subscription. Prices are shown in the app. Subscriptions renew automatically unless cancelled before the renewal date.</p>
          <p>Refunds are handled on a case-by-case basis. To request a refund, contact us within 14 days of a charge. We aim to be fair.</p>
          <p>We reserve the right to change pricing with 30 days notice to existing subscribers.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The Selah app, its design, and original content are our intellectual property. Bible translations included in the app are used under their respective licences.</p>
          <p>The AI Bible study feature uses Google Gemini. AI-generated responses are for informational and devotional purposes only — always verify significant theological conclusions with Scripture and qualified pastoral guidance.</p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>The service is provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee the service will be error-free, uninterrupted, or available at all times. Use of the AI features does not constitute pastoral or theological advice.</p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>To the maximum extent permitted by law, Selah shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
        </Section>

        <Section title="10. Termination">
          <p>You may delete your account at any time from the app settings. We may suspend or terminate your access if you violate these terms, with or without notice depending on severity.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These terms are governed by the laws of the Republic of Indonesia. Disputes shall be resolved in the courts of Jakarta, Indonesia, unless mandatory local law provides otherwise.</p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>We may update these terms periodically. We will notify you of material changes via the app. Continued use after changes constitutes acceptance of the updated terms.</p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these terms? Email{" "}
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
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
