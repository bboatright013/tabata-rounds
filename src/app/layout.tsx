import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { GoogleTagManager } from '@next/third-parties/google'
import { CookieConsentBanner, Header, Footer } from '@/components'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Tabata Rounds | High-Intensity Tabata Timer",
  description:
    "Tabata Rounds is a customizable high-intensity interval training (HIIT) timer designed to help you get the most out of your Tabata workouts.",
  openGraph: {
    title: "Tabata Rounds | High-Intensity Tabata Timer",
    description:
      "Experience efficient workouts with Tabata Rounds, the ultimate Tabata timer for HIIT training.",
    images: [
      {
        url: "/metaimage1.jpg",
        width: 800,
        height: 600,
      }
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5636286009107877" />
        <Script id="gtm-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'event': 'gtm.consentDefault',
              'gtm.consent': {
                 'analytics_storage': 'denied',
                 'ad_storage': 'denied'
              }
            });
          `}
        </Script>
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5636286009107877"
     crossOrigin="anonymous"></Script>
      </head>
      <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER || ''} />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  )
}
