import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Selah",
  description: "Privacy Policy for Selah Bible companion app.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect information you provide directly (name, email, journal entries, prayer requests) and usage data (pages visited, features used) to improve the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to provide and improve Selah, personalize your experience, send important account notifications, and ensure platform safety.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Storage</h2>
          <p className="text-muted-foreground">Your data is stored securely using Supabase (PostgreSQL), hosted on AWS infrastructure with encryption at rest and in transit. We do not sell your personal data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Sharing</h2>
          <p className="text-muted-foreground">We do not share your personal data with third parties except as required by law or to operate the service (e.g., authentication providers). Community content you choose to share is visible to other users.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-muted-foreground">You may access, correct, or delete your account data at any time from your Settings page. To request full account deletion, contact us at the email below.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p className="text-muted-foreground">We use cookies solely for authentication session management. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground">Privacy questions? Contact us at <a href="mailto:privacy@selahapp.com" className="text-primary hover:underline">privacy@selahapp.com</a></p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link href="/" className="text-primary hover:underline text-sm">← Back to Selah</Link>
      </div>
    </div>
  );
}
