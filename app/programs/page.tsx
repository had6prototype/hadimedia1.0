"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Filter, ThumbsUp, Share2, Bookmark, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch programs with tags
        const { data: programsData } = await supabase
          .from("programs")
          .select(`
            *,
            program_tags (
              tags (*)
            )
          `)
          .eq("status", "published")
          .order("order")

        // Fetch all tags
        const { data: tagsData } = await supabase.from("tags").select("*").order("name")

        setPrograms(programsData || [])
        setTags(tagsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || program.program_tags?.some((pt: any) => pt.tags.name === selectedCategory)

    return matchesSearch && matchesCategory
  })

  const featuredPrograms = programs.slice(0, 3)

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">برنامه‌های جدید</h1>
      <p className="text-muted-foreground mb-8">
        آخرین برنامه‌های تولید شده توسط رسانه الهادی را در این صفحه مشاهده کنید
      </p>

      {/* جستجو و فیلتر */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="جستجو در برنامه‌ها..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10">
            <Filter className="h-4 w-4" />
            <span className="sr-only">فیلتر</span>
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            همه
          </Button>
          {tags.slice(0, 5).map((tag) => (
            <Button
              key={tag.id}
              variant={selectedCategory === tag.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(tag.name)}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {/* برنامه‌های ویژه */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">برنامه‌های ویژه</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredPrograms.map((program, index) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={program.thumbnail_url || "/placeholder.svg"}
                    alt={program.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <Play className="h-6 w-6" />
                      <span className="sr-only">پخش</span>
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-2 py-1 rounded-md">
                    {index === 0 ? "ویژه" : index === 1 ? "پربازدید" : "جدید"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(program.created_at).toLocaleDateString("fa-IR")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{program.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button asChild>
                  <Link href={`/programs/${program.id}`}>مشاهده برنامه</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* همه برنامه‌ها */}
      <section>
        <h2 className="text-2xl font-bold mb-6">همه برنامه‌ها ({filteredPrograms.length})</h2>
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">هیچ برنامه‌ای یافت نشد</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery("")}>
                پاک کردن جستجو
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={program.thumbnail_url || "/placeholder.svg"}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="rounded-full">
                        <Play className="h-6 w-6" />
                        <span className="sr-only">پخش</span>
                      </Button>
                    </div>
                    {program.program_tags?.[0]?.tags && (
                      <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                        {program.program_tags[0].tags.name}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-1">{program.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(program.created_at).toLocaleDateString("fa-IR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{program.duration}</span>
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
                    <Link href={`/programs/${program.id}`}>مشاهده</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* پاگینیشن */}
        {filteredPrograms.length > 0 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-1">
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">صفحه قبل</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8">
                ۱
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8">
                ۲
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8">
                ۳
              </Button>
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">صفحه بعد</span>
              </Button>
            </nav>
          </div>
        )}
      </section>
    </div>
  )
}
