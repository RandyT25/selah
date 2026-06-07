import Image from "next/image";
import Link from "next/link";
import { Check, Smartphone, Globe, Share, MoreHorizontal, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstallAppButton } from "@/components/marketing/InstallAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Selah — Bible App",
  description: "Install Selah on Android, iPhone, or your computer. Free Bible companion app — works offline with no app store required.",
};

const androidSteps = [
  { step: 1, text: 'Open selah-umber.vercel.app in Chrome on your Android phone' },
  { step: 2, text: 'Tap the three-dot menu (⋮) in the top right corner' },
  { step: 3, text: 'Tap "Add to Home Screen" or "Install App"' },
  { step: 4, text: 'Tap "Add" — Selah is now on your home screen like a native app' },
];

const iosSteps = [
  { step: 1, text: 'Open selah-umber.vercel.app in Safari on your iPhone or iPad' },
  { step: 2, text: 'Tap the Share button (the square with an arrow pointing up)' },
  { step: 3, text: 'Scroll down and tap "Add to Home Screen"' },
  { step: 4, text: 'Tap "Add" — Selah opens full-screen like a native iOS app' },
];

const appFeatures = [
  "Works completely offline after first install",
  "Full-screen native app experience — no browser bar",
  "Push notifications for prayer reminders",
  "Home screen icon with your logo",
  "Automatic updates — always the latest version",
  "No app store required to install",
];

export default function DownloadPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Image
          src="/logo-app-icon.png"
          alt="Selah"
          width={96}
          height={96}
          className="rounded-3xl mx-auto mb-6 shadow-xl"
        />
        <Badge variant="gold" className="mb-4">Free Forever</Badge>
        <h1 className="text-4xl font-bold mb-4">Install Selah on Your Device</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Selah is a Progressive Web App — install it directly from your browser on any device.
          No app store, no downloads. Just tap and go.
        </p>
      </div>

      {/* What you get */}
      <Card className="mb-12 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">What you get with the installed app</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-3">
            {appFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Install options grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">

        {/* Android */}
        <Card id="android" className="scroll-mt-8">
          <CardHeader>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-2">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Android</CardTitle>
            <p className="text-sm text-muted-foreground">Chrome browser</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {androidSteps.map(({ step, text }) => (
              <div key={step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
            <div className="pt-2">
              <Badge variant="outline" className="text-xs">Play Store — coming soon</Badge>
            </div>
          </CardContent>
        </Card>

        {/* iPhone / iPad */}
        <Card id="ios" className="scroll-mt-8">
          <CardHeader>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2">
              <Share className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>iPhone / iPad</CardTitle>
            <p className="text-sm text-muted-foreground">Safari browser</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {iosSteps.map(({ step, text }) => (
              <div key={step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
            <div className="pt-2">
              <Badge variant="outline" className="text-xs">App Store — coming soon</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Desktop / Web */}
        <Card id="web" className="scroll-mt-8">
          <CardHeader>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-2">
              <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Computer</CardTitle>
            <p className="text-sm text-muted-foreground">Chrome, Edge, or Safari</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p className="text-sm text-muted-foreground">Click the install button below or look for the install icon in your browser's address bar</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p className="text-sm text-muted-foreground">Click "Install" in the browser prompt</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <p className="text-sm text-muted-foreground">Selah opens as its own window — find it in your taskbar or applications</p>
            </div>
            <div className="pt-2">
              <InstallAppButton />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Already have an account */}
      <div className="text-center py-12 border-t">
        <h2 className="text-2xl font-bold mb-3">Already have an account?</h2>
        <p className="text-muted-foreground mb-6">Sign in to pick up right where you left off.</p>
        <div className="flex gap-4 justify-center">
          <Button variant="gold" size="lg" asChild>
            <Link href="/dashboard">Open App</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
