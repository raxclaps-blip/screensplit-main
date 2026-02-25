import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/providers/session-provider"
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TITLE, SITE_URL, absoluteUrl } from "@/lib/seo/site"

const GOOGLE_ANALYTICS_ID = "G-YE9CZZD0M7"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: SITE_TITLE,
    template: "%s | Screensplit",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "technology",
  classification: "Image editing and visual comparison software",
  referrer: "origin-when-cross-origin",
  keywords: [
    "before and after image",
    "before and after photo editor",
    "comparison image maker",
    "social media image tool",
    "split image editor",
    "visual comparison app",
  ],
  authors: [{ name: "Screensplit Team", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32" },
      { url: "/logo-dark-mode.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon"],
    apple: ["/apple-icon"],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Open Graph preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/twitter-image")],
    creator: "@screensplit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Suspense fallback={null}>{children}</Suspense>
            <SonnerToaster
              richColors
              position="bottom-right"
              expand={false}
              visibleToasts={3}
              duration={1800}
              gap={8}
              offset={{ right: 16, bottom: 16 }}
              mobileOffset={{ left: 12, right: 12, bottom: 12 }}
              toastOptions={{
                classNames: {
                  toast:
                    "w-[min(92vw,360px)] min-h-0 rounded-xl border border-border/70 bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-sm",
                  title: "text-[13px] font-medium leading-tight",
                  description: "text-[12px] leading-snug text-muted-foreground",
                  actionButton: "h-7 rounded-md px-2 text-[12px]",
                  cancelButton: "h-7 rounded-md px-2 text-[12px]",
                  closeButton: "h-6 w-6",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
