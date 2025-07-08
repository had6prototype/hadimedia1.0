import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import NewsTicker from "@/components/news-ticker"
import { Toaster } from "@/components/ui/toast"

// فونت وزیر برای متن فارسی
const vazir = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazir",
})

export const metadata: Metadata = {
  title: "رسانه الهادی | Al-Hadi Media",
  description: "وب‌سایت رسمی رسانه الهادی - محتوای اسلامی و آموزشی",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable}`}>
      <body className="min-h-screen bg-background font-vazir">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <NewsTicker />
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
