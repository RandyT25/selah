import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center space-y-6">
      <Image src="/logo-app-icon.png" alt="Selah" width={56} height={56} className="rounded-2xl opacity-80" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl font-semibold">Page not found</p>
        <p className="text-muted-foreground max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="gold">
          <Link href="/bibleapp/dashboard">Go to app</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground italic">&ldquo;Your word is a lamp to my feet and a light to my path.&rdquo; — Psalm 119:105</p>
    </div>
  );
}
