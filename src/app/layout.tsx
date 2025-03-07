import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { GoogleTagManager } from '@next/third-parties/google'

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
      <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER || ''} />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
