import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/providers/session-provider"

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://screensplit.vercel.app'),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Screensplit - Create Stunning Before & After Images",
    template: "%s | Screensplit"
  },
  description: "Upload, customize, and export beautifully combined before & after visuals in seconds.",
  generator: "v0.app",
  applicationName: "Screensplit",
  keywords: ["before after", "image comparison", "screen split", "image editor", "visual comparison", "side by side images"],
  authors: [{ name: "Screensplit" }],
  creator: "Screensplit",
  publisher: "Screensplit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/icon'],
    apple: ['/apple-icon'],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Screensplit',
    title: 'Screensplit - Create Stunning Before & After Images',
    description: 'Upload, customize, and export beautifully combined before & after visuals in seconds.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Screensplit Open Graph Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Screensplit - Create Stunning Before & After Images',
    description: 'Upload, customize, and export beautifully combined before & after visuals in seconds.',
    images: ['/twitter-image'],
    creator: '@screensplit',
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
      </body>
    </html>
  )
}
