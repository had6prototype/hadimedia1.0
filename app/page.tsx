"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Calendar, Clock, Share2, ThumbsUp, MessageSquare, Bookmark } from "lucide-react"
import FeaturedPrograms from "@/components/featured-programs"
import QuickAccess from "@/components/quick-access"
import LiveBanner from "@/components/live-banner"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [recentPrograms, setRecentPrograms] = useState<any[]>([])
  const [popularPrograms, setPopularPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        // Get recent programs
        const { data: recent } = await supabase
          .from("programs")
          .select(`
            *,
            program_tags (
              tags (*)
            )
          `)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(6)

        // Get popular programs (sorted by views)
        const { data: popular } = await supabase
          .from("programs")
          .select(`
            *,
            program_tags (
              tags (*)
            )
          `)
          .eq("status", "published")
          .order("views", { ascending: false })
          .limit(6)

        setRecentPrograms(recent || [])
        setPopularPrograms(popular || [])
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const formatProgramData = (programs: any[]) => {
    return programs.map((program) => ({
      id: program.id,
      title: program.title,
      description: program.description,
      image: program.thumbnail_url,
      date: new Date(program.created_at).toLocaleDateString("fa-IR"),
      duration: program.duration,
      views: program.views,
      tags: program.program_tags?.map((pt: any) => pt.tags) || [],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        <LiveBanner />
        <section className="container py-6">
          <QuickAccess />
        </section>
        <div className="container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* بنر پخش زنده */}
      <LiveBanner />

      {/* دسترسی سریع */}
      <section className="container py-6">
        <QuickAccess />
      </section>

      {/* برنامه‌های ویژه */}
      <section className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">برنامه‌های ویژه</h2>
          <Link href="/programs" className="text-sm font-medium text-primary hover:underline">
            مشاهده همه
          </Link>
        </div>
        <FeaturedPrograms />
      </section>

      {/* تب‌های محتوا */}
      <section className="container py-6">
        <Tabs defaultValue="newest" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="newest">جدیدترین‌ها</TabsTrigger>
            <TabsTrigger value="popular">پربازدیدترین‌ها</TabsTrigger>
            <TabsTrigger value="questions">سوالات شرعی</TabsTrigger>
          </TabsList>
          <TabsContent value="newest" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {formatProgramData(recentPrograms).map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <Link
                        href={`/programs/${item.id}`}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Play className="h-6 w-6" />
                          <span className="sr-only">پخش</span>
                        </Button>
                      </Link>
                      <Badge className="absolute top-2 right-2">جدید</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between border-t">
                    <div className="flex gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="sr-only">پسندیدن</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">اشتراک‌گذاری</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">ذخیره</span>
                      </Button>
                    </div>
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link href={`/programs/${item.id}`}>مشاهده</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="popular" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {formatProgramData(popularPrograms).map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <Link
                        href={`/programs/${item.id}`}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Play className="h-6 w-6" />
                          <span className="sr-only">پخش</span>
                        </Button>
                      </Link>
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        پربازدید
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{item.views} بازدید</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between border-t">
                    <div className="flex gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="sr-only">پسندیدن</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">اشتراک‌گذاری</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">ذخیره</span>
                      </Button>
                    </div>
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link href={`/programs/${item.id}`}>مشاهده</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="questions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      سوال شرعی شماره {item}
                    </CardTitle>
                    <CardDescription>پرسش و پاسخ در مورد موضوعات فقهی و شرعی</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2">سوال:</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item % 2 === 0
                        ? "آیا در مجالس عزاداری حضرت امام حسین (علیه‌السلام)، ناله و شیون بلند سر دادن و به سر و صورت زدن جایز است؟"
                        : "آیا نذر قربانی (کشتن گوسفند و ...) جلوی دسته عزاداری اشکال دارد؟"}
                    </p>
                    <p className="font-medium mb-2">پاسخ:</p>
                    <p className="text-sm text-muted-foreground">
                      {item % 2 === 0
                        ? "این پاسخ به سوال شرعی مطرح شده است که توسط کارشناسان دینی ارائه شده است. برای مشاهده پاسخ کامل روی دکمه مشاهده کلیک کنید."
                        : "مانع و اشکالی ندارد. برای مشاهده پاسخ کامل روی دکمه مشاهده کلیک کنید."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-xs text-muted-foreground">پاسخ دهنده: استاد محمدی</div>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      مشاهده کامل
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* بخش اشتراک در خبرنامه */}
      <section className="bg-muted py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">عضویت در خبرنامه</h2>
            <p className="text-muted-foreground">
              برای دریافت آخرین اخبار، برنامه‌ها و محتوای جدید در خبرنامه ما عضو شوید
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" placeholder="ایمیل خود را وارد کنید" className="px-3 py-2 rounded-md border flex-1" />
              <Button>عضویت</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
