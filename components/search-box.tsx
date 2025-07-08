"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Video, FileText, MessageSquare } from "lucide-react"
import { useDebounce } from "use-debounce"
import Fuse from "fuse.js"
import { searchData, type SearchItem, searchCategories } from "@/lib/search-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

export default function SearchBox({ className = "", mobile = false }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery] = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
    if (debouncedQuery.length >= 2) {
      const results = fuse.search(debouncedQuery)

      // فیلتر بر اساس دسته‌بندی انتخاب شده
      let filteredResults = results.map((result) => result.item)

      if (selectedCategory !== "all") {
        filteredResults = filteredResults.filter((item) => item.type === selectedCategory)
      }

      setSearchResults(filteredResults)
      setIsOpen(true)
    } else {
      setSearchResults([])
      setIsOpen(false)
    }
  }, [debouncedQuery, selectedCategory])

  // بستن نتایج جستجو با کلیک خارج از باکس
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // ارسال فرم جستجو
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
    }
  }

  // نمایش آیکون مناسب برای هر نوع محتوا
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-primary" />
      case "article":
        return <FileText className="h-4 w-4 text-primary" />
      case "question":
        return <MessageSquare className="h-4 w-4 text-primary" />
      default:
        return <Search className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="جستجو..."
          className={`pr-8 ${mobile ? "w-full" : "w-[200px] md:w-[200px] lg:w-[300px]"}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setIsOpen(true)}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1.5 h-7 w-7 text-muted-foreground"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">پاک کردن</span>
          </Button>
        )}
      </form>

      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          <div className="p-2 border-b">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {searchCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {result.image ? (
                      <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={result.image || "/placeholder.svg"}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{result.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">{result.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>نتیجه‌ای یافت نشد</p>
                <p className="text-xs mt-1">لطفاً عبارت دیگری را جستجو کنید</p>
              </div>
            )}
          </div>

          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleSubmit}>
              مشاهده همه نتایج برای "{searchQuery}"
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
