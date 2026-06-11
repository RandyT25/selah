"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
  { label: "About", href: "/about" },
];

type MarketingLang = "en" | "id";

const marketingStrings = {
  en: { signIn: "Sign In", getApp: "Get the App", getStarted: "Get Started Free" },
  id: { signIn: "Masuk", getApp: "Unduh Aplikasi", getStarted: "Mulai Gratis" },
};

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLangState] = useState<MarketingLang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("selah_marketing_lang") as MarketingLang | null;
    if (stored === "en" || stored === "id") setLangState(stored);
  }, []);

  const toggleLang = () => {
    const next: MarketingLang = lang === "en" ? "id" : "en";
    setLangState(next);
    localStorage.setItem("selah_marketing_lang", next);
  };

  const s = marketingStrings[lang];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-wordmark.png"
            alt="Selah"
            width={120}
            height={38}
            className="dark:hidden"
            style={{ mixBlendMode: "multiply" }}
            priority
          />
          <Image
            src="/logo-wordmark.png"
            alt="Selah"
            width={120}
            height={38}
            className="hidden dark:block brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + Language toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language toggle pill */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-full border border-border px-1 py-1 bg-muted/50 hover:bg-muted transition-colors"
            title="Switch language"
          >
            <span
              className={cn(
                "text-xs font-semibold rounded-full px-2.5 py-1 transition-all",
                lang === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              EN
            </span>
            <span
              className={cn(
                "text-xs font-semibold rounded-full px-2.5 py-1 transition-all",
                lang === "id" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              ID
            </span>
          </button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/login">{s.signIn}</Link>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/download">{s.getApp}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          {/* Compact language pill for mobile */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-0.5 rounded-full border border-border px-1 py-0.5 bg-muted/50 text-xs"
          >
            <span className={cn("px-2 py-0.5 rounded-full font-semibold transition-all", lang === "en" ? "bg-background shadow-sm" : "text-muted-foreground")}>EN</span>
            <span className={cn("px-2 py-0.5 rounded-full font-semibold transition-all", lang === "id" ? "bg-background shadow-sm" : "text-muted-foreground")}>ID</span>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-3 bg-background">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" asChild>
              <Link href="/app/login">{s.signIn}</Link>
            </Button>
            <Button variant="gold" asChild>
              <Link href="/app/register">{s.getStarted}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
