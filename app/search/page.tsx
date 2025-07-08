"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Video, FileText, MessageSquare, Filter } from "lucide-react"
import Fuse from "fuse.js"
import { searchData, type SearchItem, searchCategories } from "@/lib/search-data"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // تنظیم موتور جستجو با Fuse.js
  const fuse = new Fuse(searchData, {
    keys: ["title", "description", "category"],
    includeScore: true,
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true,
  })

  // انجام جستجو با تغییر کوئری
  useEffect(() => {
    if (query) {
      setIsLoading(true)

      // شبیه‌سازی تأخیر شبکه
      setTimeout(() => {
        const results = fuse.search(query)
        setSearchResults(results.map((result) => result.item))
        setIsLoading(false)
      }, 500)
    } else {
      setSearchResults([])
      setIsLoading(false)
    }
  }, [query])

  // فیلتر نتایج بر اساس تب انتخاب شده
  const filteredResults = activeTab === "all" ? searchResults : searchResults.filter((item) => item.type === activeTab)

  // ارسال فرم جستجو
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery)}`)

      setIsLoading(true)
      setTimeout(() => {
        const results = fuse.search(searchQuery)
        setSearchResults(results.map((result) => result.item))
        setIsLoading(false)
      }, 500)
    }
  }

  // نمایش آیکون مناسب برای هر نوع محتوا
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      case "question":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Search className="h-5 w-5" />
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">نتایج جستجو</h1>

      {/* فرم جستجو */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجو در کانال الهادی داری..."
              className="pr-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="px-8">
            جستجو
          </Button>
        </form>
      </div>

      {/* تب‌های فیلتر */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{query ? `نتایج جستجو برای "${query}"` : "همه محتوا"}</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">فیلتر:</span>
            <TabsList>
              {searchCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {renderSearchResults(filteredResults, isLoading, query, getTypeIcon)}
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          {renderSearchResults(filteredResults, isLoading, query, getTypeIcon)}
        </TabsContent>

        <TabsContent value="article" className="mt-0">
          {renderSearchResults(filteredResults, isLoading, query, getTypeIcon)}
        </TabsContent>

        <TabsContent value="question" className="mt-0">
          {renderSearchResults(filteredResults, isLoading, query, getTypeIcon)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// تابع نمایش نتایج جستجو
function renderSearchResults(
  results: SearchItem[],
  isLoading: boolean,
  query: string,
  getTypeIcon: (type: string) => JSX.Element,
) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">در حال جستجو...</p>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">جستجو در کانال الهادی داری</h3>
        <p className="text-muted-foreground">
          عبارت مورد نظر خود را در کادر بالا وارد کنید تا نتایج مرتبط را مشاهده کنید.
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">نتیجه‌ای یافت نشد</h3>
        <p className="text-muted-foreground mb-4">متأسفانه هیچ نتیجه‌ای برای "{query}" یافت نشد.</p>
        <div className="max-w-md mx-auto">
          <h4 className="font-medium mb-2">پیشنهادات:</h4>
          <ul className="text-right text-sm space-y-1">
            <li>• املای کلمات را بررسی کنید</li>
            <li>• از کلمات کلیدی کمتر یا متفاوت استفاده کنید</li>
            <li>• عبارت جستجو را کوتاه‌تر کنید</li>
            <li>• از فیلترهای دیگر استفاده کنید</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">{results.length} نتیجه یافت شد</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <Link
            key={result.id}
            href={result.url}
            className="flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {result.image ? (
              <div className="relative aspect-video">
                <Image src={result.image || "/placeholder.svg"} alt={result.title} fill className="object-cover" />
                <div className="absolute top-2 right-2">
                  <span className="bg-primary/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    {getTypeIcon(result.type)}
                    <span>{result.type === "video" ? "ویدیو" : result.type === "article" ? "مقاله" : "سوال شرعی"}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-muted aspect-video flex items-center justify-center">
                <div className="bg-background/80 p-4 rounded-full">{getTypeIcon(result.type)}</div>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold mb-2 line-clamp-2">{result.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{result.description}</p>
              <div className="mt-auto">
                <span className="text-xs bg-muted px-2 py-1 rounded">{result.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
