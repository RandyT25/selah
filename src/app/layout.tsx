import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Selah — Pause. Reflect. Grow.",
    template: "%s | Selah",
  },
  description:
    "A modern Bible companion for reading, studying, journaling, and growing in faith. Bible reading plans, devotionals, prayer journal, and community.",
  keywords: [
    "Bible app",
    "Bible reading",
    "devotionals",
    "prayer journal",
    "reading plans",
    "Christian app",
    "Bible study",
    "faith",
    "scripture",
    "selah",
  ],
  authors: [{ name: "Selah" }],
  creator: "Selah",
  publisher: "Selah",
  applicationName: "Selah",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://selahapp.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Selah",
    title: "Selah — Pause. Reflect. Grow.",
    description:
      "A modern Bible companion for reading, studying, journaling, and growing in faith.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Selah Bible App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selah — Pause. Reflect. Grow.",
    description:
      "A modern Bible companion for reading, studying, journaling, and growing in faith.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Selah",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B8860B" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} font-sans antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
