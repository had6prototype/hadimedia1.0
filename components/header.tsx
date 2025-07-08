"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import SearchBox from "@/components/search-box"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="flex items-center justify-between w-full">
          {/* لوگو */}
          <Link href="/" className="flex items-center">
            <div className="relative h-14 w-56 md:w-64">
              <Image
                src="/images/logo-menu.png"
                alt="رسانه الهادی - Al-Hadi Media"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* منوی دسکتاپ */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              خانه
            </Link>
            <Link href="/live" className="text-sm font-medium hover:text-primary">
              پخش زنده
            </Link>
            <Link href="/programs" className="text-sm font-medium hover:text-primary">
              برنامه‌های جدید
            </Link>
            <Link href="/articles" className="text-sm font-medium hover:text-primary">
              مقالات
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              تماس با ما
            </Link>
          </nav>

          {/* جستجو و دکمه‌های عملیاتی */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative hidden md:flex items-center">
              <SearchBox />
            </div>

            {/* دکمه تغییر تم */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">تغییر تم</span>
            </Button>

            {/* دکمه منوی موبایل */}
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">منو</span>
            </Button>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in md:hidden bg-background",
          isMenuOpen ? "slide-in-from-top-80" : "hidden",
        )}
      >
        <div className="relative z-20 grid gap-6 p-4 rounded-md bg-background">
          <div className="flex items-center justify-between">
            <div className="relative h-10 w-40">
              <Image src="/images/logo-menu.png" alt="رسانه الهادی - Al-Hadi Media" fill className="object-contain" />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">تغییر تم</span>
            </Button>
          </div>
          <div className="relative">
            <SearchBox mobile={true} />
          </div>
          <nav className="grid grid-flow-row auto-rows-max text-sm">
            <Link
              href="/"
              className="flex w-full items-center rounded-md p-2 hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              خانه
            </Link>
            <Link
              href="/live"
              className="flex w-full items-center rounded-md p-2 hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              پخش زنده
            </Link>
            <Link
              href="/programs"
              className="flex w-full items-center rounded-md p-2 hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              برنامه‌های جدید
            </Link>
            <Link
              href="/articles"
              className="flex w-full items-center rounded-md p-2 hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              مقالات
            </Link>
            <Link
              href="/contact"
              className="flex w-full items-center rounded-md p-2 hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              تماس با ما
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
