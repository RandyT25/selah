import Link from "next/link";
import Image from "next/image";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo-wordmark-transparent.png"
                alt="Selah"
                width={196}
                height={60}
                className="dark:hidden"
              />
              <Image
                src="/logo-wordmark-white.png"
                alt="Selah"
                width={196}
                height={60}
                className="hidden dark:block"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              A modern Bible companion for your faith journey.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/bibleapp/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/bibleapp/devotionals" className="hover:text-foreground transition-colors">Devotionals</Link></li>
              <li><Link href="/bibleapp/plans" className="hover:text-foreground transition-colors">Reading Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Selah. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ♥ for the Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
}
