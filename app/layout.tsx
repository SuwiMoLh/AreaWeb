import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import { Noto_Sans_Thai } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n/use-translation"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase/supabase-provider"
import { ThaiProvinceProvider } from "@/components/thai-province-provider"

// ฟอนต์หลัก Kanit
const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
})

// ฟอนต์ภาษาไทย Noto Sans Thai สำหรับรองรับภาษาไทยได้ดีขึ้น
const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  variable: "--font-thai",
})

export const metadata: Metadata = {
  title: "Area | ตลาดซื้อขายที่ดินมืออาชีพ",
  description: "ซื้อและขายที่ดินได้อย่างง่ายดายบน Area",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${kanit.variable} ${notoSansThai.variable} font-sans bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen`}
      >
        <SupabaseProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <ThaiProvinceProvider>{children}</ThaiProvinceProvider>
              </main>
              <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
