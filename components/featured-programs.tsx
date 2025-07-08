"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function FeaturedPrograms() {
  const [featuredPrograms, setFeaturedPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPrograms = async () => {
      try {
        const { data } = await supabase
          .from("programs")
          .select(`
            *,
            program_tags (
              tags (*)
            )
          `)
          .eq("status", "published")
          .order("views", { ascending: false })
          .limit(3)

        if (data) {
          const formattedData = data.map((program, index) => ({
            id: program.id,
            title: program.title,
            description: program.description,
            image: program.thumbnail_url,
            date: new Date(program.created_at).toLocaleDateString("fa-IR"),
            duration: program.duration,
            badge: index === 0 ? "ویژه" : index === 1 ? "پربازدید" : "جدید",
            tags: program.program_tags?.map((pt: any) => pt.tags) || [],
          }))
          setFeaturedPrograms(formattedData)
        }
      } catch (error) {
        console.error("Error fetching featured programs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedPrograms()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featuredPrograms.map((program) => (
        <Card key={program.id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={program.image || "/placeholder.svg"}
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
              <Badge className="absolute top-2 right-2">{program.badge}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-xl mb-2">{program.title}</CardTitle>
            <CardDescription>{program.description}</CardDescription>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{program.date}</span>
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
  )
}
