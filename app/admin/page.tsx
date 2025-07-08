"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Tags, Users, Eye, TrendingUp, Calendar, Loader2, Settings, Scroll } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activeTags: 0,
    totalViews: 0,
    publishedPrograms: 0,
  })
  const [recentPrograms, setRecentPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total programs count
        const { count: totalPrograms } = await supabase.from("programs").select("*", { count: "exact", head: true })

        // Get published programs count
        const { count: publishedPrograms } = await supabase
          .from("programs")
          .select("*", { count: "exact", head: true })
          .eq("status", "published")

        // Get total tags count
        const { count: activeTags } = await supabase.from("tags").select("*", { count: "exact", head: true })

        // Get total views
        const { data: viewsData } = await supabase.from("programs").select("views")

        const totalViews = viewsData?.reduce((sum, program) => sum + (program.views || 0), 0) || 0

        // Get recent programs
        const { data: programs } = await supabase
          .from("programs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        setStats({
          totalPrograms: totalPrograms || 0,
          activeTags: activeTags || 0,
          totalViews,
          publishedPrograms: publishedPrograms || 0,
        })

        setRecentPrograms(programs || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsCards = [
    {
      title: "کل برنامه‌ها",
      value: stats.totalPrograms.toString(),
      change: "+12%",
      icon: Video,
      color: "text-blue-600",
    },
    {
      title: "تگ‌های فعال",
      value: stats.activeTags.toString(),
      change: "+3",
      icon: Tags,
      color: "text-green-600",
    },
    {
      title: "برنامه‌های منتشر شده",
      value: stats.publishedPrograms.toString(),
      change: "+8%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "کل بازدیدها",
      value: stats.totalViews.toLocaleString(),
      change: "+15%",
      icon: Eye,
      color: "text-orange-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> نسبت به ماه گذشته
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => (window.location.href = "/admin/programs")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدیریت برنامه‌ها</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">افزودن، ویرایش و مدیریت برنامه‌ها</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => (window.location.href = "/admin/tags")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدیریت تگ‌ها</CardTitle>
            <Tags className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">افزودن و مدیریت تگ‌های برنامه‌ها</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدیریت کاربران</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">به زودی...</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => (window.location.href = "/admin/settings")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تنظیمات</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">تنظیمات سایت و پیکربندی</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => (window.location.href = "/admin/news-ticker")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نوار اخبار احکام</CardTitle>
            <Scroll className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">مدیریت متن‌های نوار اخبار احکام</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* آخرین برنامه‌ها */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              آخرین برنامه‌ها
            </CardTitle>
            <CardDescription>برنامه‌های اخیراً اضافه شده</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrograms.map((program) => (
                <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium line-clamp-1">{program.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(program.created_at).toLocaleDateString("fa-IR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {program.views || 0}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      program.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {program.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* آمار بازدید */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              آمار بازدید هفتگی
            </CardTitle>
            <CardDescription>نمودار بازدید ۷ روز گذشته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "شنبه", views: 1200 },
                { day: "یکشنبه", views: 1450 },
                { day: "دوشنبه", views: 1100 },
                { day: "سه‌شنبه", views: 1650 },
                { day: "چهارشنبه", views: 1800 },
                { day: "پنج‌شنبه", views: 1950 },
                { day: "جمعه", views: 2100 },
              ].map((item) => (
                <div key={item.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(item.views / 2100) * 100}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-left">{item.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
