"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, Save, Eye, ArrowLeft, ImageIcon, Video, Tag, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProgram, updateProgram } from "../../actions"
import { useToast } from "@/components/ui/use-toast"

export default function EditProgramPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoPath: "",
    thumbnailUrl: "",
    thumbnailPath: "",
    duration: "",
    order: 1,
    status: "draft",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)

  // تگ‌های پیشنهادی
  const suggestedTags = [
    "احکام شرعی",
    "فقه",
    "عزاداری",
    "اهل بیت",
    "حقوق خانواده",
    "زن و مرد",
    "آزادی",
    "فلسفه",
    "اجتماعی",
    "تاریخ اسلام",
    "روانشناسی اسلامی",
    "اخلاق",
    "عبادات",
    "نماز",
    "روزه",
    "حج",
    "زکات",
    "خمس",
  ]

  // Extract file path from URL
  const extractPathFromUrl = (url: string) => {
    if (!url) return ""

    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/videos\/(.+)/)
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1]
      }
    } catch (e) {
      console.error("Error extracting path from URL:", e)
    }

    return ""
  }

  // Load program data
  useEffect(() => {
    const loadProgram = async () => {
      if (!params.id) return

      setIsLoading(true)
      const result = await getProgram(Number.parseInt(params.id as string))

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
        router.push("/admin/programs")
      } else if (result.program) {
        const program = result.program

        // Extract file paths from URLs if they are Supabase URLs
        const videoPath = extractPathFromUrl(program.video_url || "")
        const thumbnailPath = extractPathFromUrl(program.thumbnail_url || "")

        setFormData({
          title: program.title,
          description: program.description || "",
          videoUrl: program.video_url || "",
          videoPath: videoPath,
          thumbnailUrl: program.thumbnail_url || "",
          thumbnailPath: thumbnailPath,
          duration: program.duration || "",
          order: program.order,
          status: program.status,
          tags: program.tags?.map((tag: any) => tag.name) || [],
        })
      }

      setIsLoading(false)
    }

    loadProgram()
  }, [params.id, toast, router])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Direct client video upload (using working Approach 2)
  const handleVideoUpload = async (file: File) => {
    if (!file) {
      toast({
        title: "خطا",
        description: "فایلی انتخاب نشده است",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "خطا",
        description: "لطفاً یک فایل ویدیویی معتبر انتخاب کنید",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 50 مگابایت باشد",
        variant: "destructive",
      })
      return
    }

    setIsVideoUploading(true)
    setVideoUploadProgress(0)

    try {
      console.log("Starting direct video upload...")

      setVideoUploadProgress(25)
      toast({
        title: "در حال آپلود",
        description: "آپلود ویدیو شروع شد...",
      })

      // Dynamic import Supabase client
      const { supabase } = await import("@/lib/supabase").catch((err) => {
        console.error("Failed to import Supabase:", err)
        throw new Error("Failed to load Supabase client")
      })

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split(".").pop() || "mp4"
      const fileName = `video_${timestamp}_${randomId}.${extension}`

      setVideoUploadProgress(50)

      console.log(`Uploading video as: ${fileName}`)

      // Upload file directly to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

      setVideoUploadProgress(75)

      if (uploadError) {
        console.error("Video upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("Video upload successful:", uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(uploadData.path)

      setVideoUploadProgress(90)

      // Update form data
      handleInputChange("videoUrl", urlData.publicUrl)
      handleInputChange("videoPath", uploadData.path)

      // Calculate video duration
      const video = document.createElement("video")
      video.preload = "metadata"

      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`
        handleInputChange("duration", formattedDuration)
        console.log("Video duration calculated:", formattedDuration)
      }

      video.onerror = () => {
        console.error("Error loading video metadata")
        handleInputChange("duration", "00:00")
      }

      video.src = urlData.publicUrl

      setVideoUploadProgress(100)

      toast({
        title: "آپلود موفق",
        description: "ویدیو با موفقیت آپلود شد",
      })

      console.log("Video upload completed successfully:", urlData.publicUrl)
    } catch (error) {
      console.error("Video upload error:", error)
      toast({
        title: "خطا در آپلود ویدیو",
        description: error instanceof Error ? error.message : "خطای نامشخص",
        variant: "destructive",
      })
    } finally {
      setIsVideoUploading(false)
      setVideoUploadProgress(0)
    }
  }

  // Direct client image upload
  const handleImageUpload = async (file: File) => {
    if (!file) {
      toast({
        title: "خطا",
        description: "فایلی انتخاب نشده است",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطا",
        description: "لطفاً یک فایل تصویری معتبر انتخاب کنید",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 5 مگابایت باشد",
        variant: "destructive",
      })
      return
    }

    setIsImageUploading(true)

    try {
      console.log("Starting direct image upload...")

      toast({
        title: "در حال آپلود",
        description: "آپلود تصویر شروع شد...",
      })

      // Dynamic import Supabase client
      const { supabase } = await import("@/lib/supabase").catch((err) => {
        console.error("Failed to import Supabase:", err)
        throw new Error("Failed to load Supabase client")
      })

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split(".").pop() || "jpg"
      const fileName = `thumbnail_${timestamp}_${randomId}.${extension}`

      console.log(`Uploading image as: ${fileName}`)

      // Upload file directly to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Image upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("Image upload successful:", uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(uploadData.path)

      // Update form data
      handleInputChange("thumbnailUrl", urlData.publicUrl)
      handleInputChange("thumbnailPath", uploadData.path)

      toast({
        title: "آپلود موفق",
        description: "تصویر با موفقیت آپلود شد",
      })

      console.log("Image upload completed successfully:", urlData.publicUrl)
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "خطا در آپلود تصویر",
        description: error instanceof Error ? error.message : "خطای نامشخص",
        variant: "destructive",
      })
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleRemoveVideo = async () => {
    // We'll handle file deletion on the server when replacing files
    handleInputChange("videoUrl", "")
    handleInputChange("videoPath", "")
    handleInputChange("duration", "")
  }

  const handleRemoveThumbnail = async () => {
    // We'll handle file deletion on the server when replacing files
    handleInputChange("thumbnailUrl", "")
    handleInputChange("thumbnailPath", "")
  }

  const handleSubmit = async (status: string) => {
    if (!formData.title) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان برنامه را وارد کنید",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const programData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.videoUrl,
        thumbnail_url: formData.thumbnailUrl,
        duration: formData.duration,
        order: formData.order,
        status: status as "published" | "draft" | "archived",
        tags: formData.tags,
      }

      const result = await updateProgram(Number.parseInt(params.id as string), programData)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "برنامه با موفقیت به‌روزرسانی شد!",
        })

        // بازگشت به صفحه لیست برنامه‌ها
        router.push("/admin/programs")
      }
    } catch (error) {
      console.error("خطا در به‌روزرسانی برنامه:", error)
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی برنامه",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">در حال بارگذاری...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ویرایش برنامه</h1>
            <p className="text-muted-foreground">ویرایش اطلاعات برنامه ویدیویی</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                ذخیره پیش‌نویس
              </>
            )}
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                در حال انتشار...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                انتشار
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* فرم اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* اطلاعات اصلی */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات اصلی</CardTitle>
              <CardDescription>عنوان و توضیحات برنامه را ویرایش کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان برنامه</Label>
                <Input
                  id="title"
                  placeholder="عنوان برنامه را وارد کنید"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  placeholder="توضیحات برنامه را وارد کنید"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* آپلود ویدیو */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                ویدیو برنامه
              </CardTitle>
              <CardDescription>فایل ویدیوی برنامه را مدیریت کنید - آپلود مستقیم</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.videoUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video src={formData.videoUrl} controls className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">مدت زمان: {formData.duration}</span>
                    <Button variant="outline" size="sm" onClick={handleRemoveVideo}>
                      <X className="h-4 w-4 mr-2" />
                      حذف ویدیو
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">آپلود مستقیم فایل ویدیو</p>
                    <p className="text-sm text-muted-foreground">فایل‌های MP4, MOV, AVI پشتیبانی می‌شوند</p>
                    <p className="text-xs text-green-600">✅ آپلود مستقیم به Supabase</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleVideoUpload(file)
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button asChild disabled={isVideoUploading}>
                      <label htmlFor="video-upload" className="cursor-pointer">
                        {isVideoUploading ? "در حال آپلود..." : "انتخاب فایل"}
                      </label>
                    </Button>
                  </div>

                  {/* Progress bar */}
                  {isVideoUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-1">{videoUploadProgress}% آپلود شده</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* تگ‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                تگ‌ها
              </CardTitle>
              <CardDescription>تگ‌های مرتبط با برنامه را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* تگ‌های انتخاب شده */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>تگ‌های انتخاب شده:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* افزودن تگ جدید */}
              <div className="space-y-2">
                <Label>افزودن تگ جدید:</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="نام تگ را وارد کنید"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => addTag(newTag)} disabled={!newTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* تگ‌های پیشنهادی */}
              <div className="space-y-2">
                <Label>تگ‌های پیشنهادی:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !formData.tags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          {/* تصویر شاخص */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                تصویر شاخص
              </CardTitle>
              <CardDescription>تصویر نمایشی برنامه - آپلود مستقیم</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.thumbnailUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={formData.thumbnailUrl || "/placeholder.svg"}
                      alt="تصویر شاخص"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRemoveThumbnail} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    حذف تصویر
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">تصویر شاخص برنامه</p>
                  <p className="text-xs text-green-600 mb-3">✅ آپلود مستقیم</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <Button asChild variant="outline" size="sm" disabled={isImageUploading}>
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {isImageUploading ? "در حال آپلود..." : "انتخاب تصویر"}
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* تنظیمات */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات</CardTitle>
              <CardDescription>تنظیمات انتشار و ترتیب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order">ترتیب نمایش</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">وضعیت</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="published">منتشر شده</SelectItem>
                    <SelectItem value="archived">آرشیو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.duration && (
                <div className="space-y-2">
                  <Label>مدت زمان</Label>
                  <div className="text-sm font-medium">{formData.duration}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
