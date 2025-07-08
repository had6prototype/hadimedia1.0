"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, Eye, ChevronLeft, Play, ThumbsUp, Share2, Bookmark } from "lucide-react"
import { getProgram, incrementProgramViews } from "@/app/admin/programs/actions"
import { supabase } from "@/lib/supabase"

export default function ProgramPage() {
  const router = useRouter()
  const params = useParams()
  const [program, setProgram] = useState<any>(null)
  const [relatedPrograms, setRelatedPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      if (!params.id) return

      setIsLoading(true)
      const result = await getProgram(Number(params.id))

      if (result.error) {
        router.push("/programs")
      } else if (result.program) {
        setProgram(result.program)
        // Increment view count
        incrementProgramViews(Number(params.id))

        // Fetch related programs based on tags
        await fetchRelatedPrograms(result.program)
      }

      setIsLoading(false)
    }

    fetchProgram()
  }, [params.id, router])

  const fetchRelatedPrograms = async (currentProgram: any) => {
    if (!currentProgram?.tags || currentProgram.tags.length === 0) {
      setIsLoadingRelated(false)
      return
    }

    try {
      // Get tag IDs from current program
      const tagIds = currentProgram.tags.map((tag: any) => tag.id)

      // Find programs with similar tags
      const { data } = await supabase
        .from("programs")
        .select(`
          *,
          program_tags!inner (
            tags (*)
          )
        `)
        .eq("status", "published")
        .neq("id", currentProgram.id) // Exclude current program
        .in("program_tags.tag_id", tagIds)
        .order("views", { ascending: false })
        .limit(10)

      if (data) {
        // Format the data and remove duplicates
        const uniquePrograms = data.reduce((acc: any[], program: any) => {
          if (!acc.find((p) => p.id === program.id)) {
            acc.push({
              ...program,
              tags: program.program_tags?.map((pt: any) => pt.tags) || [],
            })
          }
          return acc
        }, [])

        setRelatedPrograms(uniquePrograms)
      }
    } catch (error) {
      console.error("Error fetching related programs:", error)
    } finally {
      setIsLoadingRelated(false)
    }
  }

  const renderVideoPlayer = () => {
    if (!program) return null

    switch (program.video_type) {
      case "youtube":
        return (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${program.youtube_id}?autoplay=1&rel=0`}
              title={program.title}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        )

      case "link":
        return (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={program.external_url}
              controls
              poster={program.thumbnail_url}
              className="w-full h-full object-contain"
              autoPlay
            />
          </div>
        )

      case "upload":
      default:
        return (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {program.video_url ? (
              <video
                src={program.video_url}
                controls
                poster={program.thumbnail_url}
                className="w-full h-full object-contain"
                autoPlay
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={program.thumbnail_url || "/placeholder.svg"}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-white text-lg">ویدیو در دسترس نیست</p>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mr-2">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="container max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">برنامه یافت نشد</h1>
          <p className="text-muted-foreground mb-6">متأسفانه برنامه مورد نظر شما یافت نشد.</p>
          <Button asChild>
            <Link href="/programs">بازگشت به لیست برنامه‌ها</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-4 sm:mb-6">
        <Link
          href="/programs"
          className="text-muted-foreground hover:text-foreground flex items-center text-sm sm:text-base"
        >
          <ChevronLeft className="h-4 w-4 ml-1" />
          بازگشت به لیست برنامه‌ها
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Video Section */}
        <div className="xl:col-span-2 order-1">
          {/* Video Player */}
          <div className="mb-4 sm:mb-6">{renderVideoPlayer()}</div>

          {/* Video Info */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">{program.title}</h1>

            {/* Video Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{program.views?.toLocaleString() || "0"} بازدید</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{new Date(program.created_at).toLocaleDateString("fa-IR")}</span>
                </div>
                {program.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{program.duration}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <span className="hidden sm:inline">پسندیدن</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <span className="hidden sm:inline">اشتراک</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  <span className="hidden sm:inline">ذخیره</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold">درباره این برنامه</h2>
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                {program.description}
              </p>

              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-medium">تگ‌ها:</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {program.tags.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs sm:text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="xl:col-span-1 order-2">
          <div className="xl:sticky xl:top-8">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">برنامه‌های مرتبط</h2>

            {isLoadingRelated ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-24 sm:w-32 h-16 sm:h-20 bg-gray-200 rounded flex-shrink-0"></div>
                      <div className="flex-1 space-y-1 sm:space-y-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : relatedPrograms.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {relatedPrograms.map((relatedProgram) => (
                  <Link key={relatedProgram.id} href={`/programs/${relatedProgram.id}`} className="block group">
                    <div className="flex gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="relative w-24 sm:w-32 h-16 sm:h-20 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={relatedProgram.thumbnail_url || "/placeholder.svg"}
                          alt={relatedProgram.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        {relatedProgram.duration && (
                          <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-1 rounded">
                            {relatedProgram.duration}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedProgram.title}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{relatedProgram.views?.toLocaleString() || "0"} بازدید</span>
                          <span>•</span>
                          <span className="truncate">
                            {new Date(relatedProgram.created_at).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                        {relatedProgram.tags && relatedProgram.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                            {relatedProgram.tags.slice(0, 2).map((tag: any) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <p className="text-sm sm:text-base">برنامه مرتبطی یافت نشد</p>
              </div>
            )}

            {/* Show More Button */}
            {relatedPrograms.length > 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <Link href="/programs">مشاهده همه برنامه‌ها</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
