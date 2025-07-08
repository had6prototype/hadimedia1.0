"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, FileText, Settings, Tags, Video, Menu, Newspaper, ImageIcon, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const navigation = [
  {
    name: "داشبورد",
    href: "/admin",
    icon: Home,
  },
  {
    name: "مقالات",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    name: "برنامه‌ها",
    href: "/admin/programs",
    icon: Video,
  },
  {
    name: "تگ‌ها",
    href: "/admin/tags",
    icon: Tags,
  },
  {
    name: "اخبار متحرک",
    href: "/admin/news-ticker",
    icon: Newspaper,
  },
  {
    name: "اسلایدر احکام",
    href: "/admin/ahkam-slider",
    icon: ImageIcon,
  },
  {
    name: "کارت‌های احکام",
    href: "/admin/ahkam-cards",
    icon: MessageSquare,
  },
  {
    name: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
  },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6" />
          پنل مدیریت
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href="/">بازگشت به سایت</Link>
        </Button>
      </div>
    </div>
  )
}

function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden bg-transparent">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <div className="flex h-full flex-col bg-gray-50">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Home className="h-6 w-6" />
              پنل مدیریت
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">بازگشت به سایت</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (username === "admin" && password === "hadimedia") {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("نام کاربری یا رمز عبور اشتباه است")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">ورود به پنل مدیریت</CardTitle>
            <CardDescription>برای دسترسی به پنل مدیریت، لطفاً وارد شوید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                placeholder="نام کاربری"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              ورود
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-.b bg-white px-6">
          <MobileSidebar />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">پنل مدیریت الهادی</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}