"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, Save, Eye, ArrowLeft, ImageIcon, Tag, Loader2, Link2, Youtube } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createProgram } from "../actions"
import { useToast } from "@/components/ui/use-toast"

export default function NewProgramPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "upload", // 'upload', 'link', 'youtube'
    videoUrl: "",
    videoPath: "",
    externalUrl: "",
    youtubeId: "",
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

  // Extract YouTube ID from URL
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Handle YouTube URL input
  const handleYouTubeUrl = (url: string) => {
    const youtubeId = extractYouTubeId(url)
    if (youtubeId) {
      handleInputChange("youtubeId", youtubeId)
      handleInputChange("externalUrl", url)
      // Auto-generate thumbnail from YouTube
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      handleInputChange("thumbnailUrl", thumbnailUrl)
      toast({
        title: "موفقیت",
        description: "لینک یوتیوب با موفقیت تشخیص داده شد",
      })
    } else {
      toast({
        title: "خطا",
        description: "لینک یوتیوب معتبر نیست",
        variant: "destructive",
      })
    }
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

  const handleRemoveVideo = () => {
    handleInputChange("videoUrl", "")
    handleInputChange("videoPath", "")
    handleInputChange("externalUrl", "")
    handleInputChange("youtubeId", "")
    handleInputChange("duration", "")
  }

  const handleRemoveImage = () => {
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

    // Validate based on video type
    if (formData.videoType === "upload" && !formData.videoUrl) {
      toast({
        title: "خطا",
        description: "لطفاً ویدیو را آپلود کنید",
        variant: "destructive",
      })
      return
    }

    if (formData.videoType === "link" && !formData.externalUrl) {
      toast({
        title: "خطا",
        description: "لطفاً لینک ویدیو را وارد کنید",
        variant: "destructive",
      })
      return
    }

    if (formData.videoType === "youtube" && !formData.youtubeId) {
      toast({
        title: "خطا",
        description: "لطفاً لینک یوتیوب معتبر وارد کنید",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const programData = {
        title: formData.title,
        description: formData.description,
        video_type: formData.videoType,
        video_url: formData.videoUrl,
        external_url: formData.externalUrl,
        youtube_id: formData.youtubeId,
        thumbnail_url: formData.thumbnailUrl,
        duration: formData.duration,
        order: formData.order,
        status: status as "published" | "draft" | "archived",
        tags: formData.tags,
      }

      const result = await createProgram(programData)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: status === "published" ? "برنامه با موفقیت منتشر شد!" : "برنامه به عنوان پیش‌نویس ذخیره شد!",
        })
        router.push("/admin/programs")
      }
    } catch (error) {
      console.error("خطا در ذخیره برنامه:", error)
      toast({
        title: "خطا",
        description: "خطا در ذخیره برنامه",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderVideoInput = () => {
    switch (formData.videoType) {
      case "upload":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                آپلود ویدیو
              </CardTitle>
              <CardDescription>فایل ویدیوی برنامه را آپلود کنید (حداکثر 50 مگابایت)</CardDescription>
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
                    <p className="text-xs text-muted-foreground">حداکثر حجم: 50 مگابایت</p>
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
                        {isVideoUploading ? "در حال آپلود ویدیو..." : "انتخاب فایل ویدیو"}
                      </label>
                    </Button>
                  </div>

                  {isVideoUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
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
        )

      case "link":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                لینک ویدیو
              </CardTitle>
              <CardDescription>لینک مستقیم ویدیو را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="external-url">لینک ویدیو</Label>
                <Input
                  id="external-url"
                  placeholder="https://example.com/video.mp4"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange("externalUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration-manual">مدت زمان (اختیاری)</Label>
                <Input
                  id="duration-manual"
                  placeholder="مثال: 15:30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                />
              </div>
              {formData.externalUrl && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">لینک ویدیو: {formData.externalUrl}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "youtube":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                یوتیوب
              </CardTitle>
              <CardDescription>لینک ویدیو یوتیوب را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">لینک یوتیوب</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.externalUrl}
                  onChange={(e) => {
                    handleInputChange("externalUrl", e.target.value)
                    if (e.target.value) {
                      handleYouTubeUrl(e.target.value)
                    }
                  }}
                />
              </div>
              {formData.youtubeId && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${formData.youtubeId}`}
                      title="YouTube video preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">YouTube ID: {formData.youtubeId}</span>
                    <Button variant="outline" size="sm" onClick={handleRemoveVideo}>
                      <X className="h-4 w-4 mr-2" />
                      حذف ویدیو
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
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
            <h1 className="text-2xl font-bold">افزودن برنامه جدید</h1>
            <p className="text-muted-foreground">ایجاد برنامه ویدیویی جدید</p>
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
              <CardDescription>عنوان و توضیحات برنامه را وارد کنید</CardDescription>
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

          {/* نوع ویدیو */}
          <Card>
            <CardHeader>
              <CardTitle>نوع ویدیو</CardTitle>
              <CardDescription>نحوه اضافه کردن ویدیو را انتخاب کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.videoType}
                onValueChange={(value) => {
                  handleInputChange("videoType", value)
                  // Clear previous video data when changing type
                  handleRemoveVideo()
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    آپلود فایل
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link" className="flex items-center gap-2 cursor-pointer">
                    <Link2 className="h-4 w-4" />
                    لینک مستقیم
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="youtube" id="youtube" />
                  <Label htmlFor="youtube" className="flex items-center gap-2 cursor-pointer">
                    <Youtube className="h-4 w-4" />
                    یوتیوب
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* ویدیو */}
          {renderVideoInput()}

          {/* تگ‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                تگ‌ها
              </CardTitle>
              <CardDescription>تگ‌های مرتبط با برنامه را اضافه کنید</CardDescription>
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
              <CardDescription>
                تصویر نمایشی برنامه
                {formData.videoType === "youtube" && " (خودکار از یوتیوب)"}
              </CardDescription>
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
                  <Button variant="outline" size="sm" onClick={handleRemoveImage} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    حذف تصویر
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {formData.videoType === "youtube" ? "تصویر خودکار از یوتیوب دریافت می‌شود" : "تصویر شاخص برنامه"}
                  </p>
                  {formData.videoType !== "youtube" && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button asChild variant="outline" size="sm" disabled={isImageUploading}>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {isImageUploading ? "در حال آپلود..." : "انتخاب تصویر"}
                        </label>
                      </Button>
                    </>
                  )}
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
