import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play, BookOpen, MessageSquare, Calendar, Newspaper, Video } from "lucide-react"

export default function QuickAccess() {
  const quickLinks = [
    {
      title: "پخش زنده",
      description: "مشاهده برنامه‌های زنده",
      icon: <Play className="h-6 w-6" />,
      href: "/live",
      color: "bg-secondary/10 dark:bg-secondary/20 text-secondary",
    },
    {
      title: "برنامه‌های جدید",
      description: "آخرین برنامه‌های منتشر شده",
      icon: <Video className="h-6 w-6" />,
      href: "/programs",
      color: "bg-primary/10 dark:bg-primary/20 text-primary",
    },
    {
      title: "سوالات شرعی",
      description: "پاسخ به سوالات دینی",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/questions",
      color: "bg-secondary/10 dark:bg-secondary/20 text-secondary",
    },
    {
      title: "مقالات",
      description: "مطالب آموزشی و تحلیلی",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/articles",
      color: "bg-primary/10 dark:bg-primary/20 text-primary",
    },
    {
      title: "اخبار",
      description: "آخرین اخبار و رویدادها",
      icon: <Newspaper className="h-6 w-6" />,
      href: "/news",
      color: "bg-secondary/10 dark:bg-secondary/20 text-secondary",
    },
    {
      title: "تقویم برنامه‌ها",
      description: "زمان‌بندی برنامه‌های آینده",
      icon: <Calendar className="h-6 w-6" />,
      href: "/schedule",
      color: "bg-primary/10 dark:bg-primary/20 text-primary",
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">دسترسی سریع</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((link, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Link href={link.href} className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${link.color}`}>{link.icon}</div>
                <div>
                  <h3 className="font-medium">{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
