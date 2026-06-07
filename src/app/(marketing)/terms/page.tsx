import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Selah",
  description: "Terms of Service for Selah Bible companion app.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">By accessing or using Selah, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
          <p className="text-muted-foreground">Selah is provided for personal, non-commercial spiritual growth and Bible study. You agree not to misuse the service, post harmful content, or attempt to disrupt its operation.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Content</h2>
          <p className="text-muted-foreground">You retain ownership of content you create (journal entries, prayer requests, etc.). By posting community content, you grant Selah a license to display it within the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Disclaimer</h2>
          <p className="text-muted-foreground">Selah is provided "as is" without warranties of any kind. We are not responsible for any loss or damage arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Changes</h2>
          <p className="text-muted-foreground">We may update these terms from time to time. Continued use of Selah after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground">Questions? Reach us at <a href="mailto:support@selahapp.com" className="text-primary hover:underline">support@selahapp.com</a></p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link href="/" className="text-primary hover:underline text-sm">← Back to Selah</Link>
      </div>
    </div>
  );
}
