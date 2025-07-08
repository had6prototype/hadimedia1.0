"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Eye, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { createArticle } from "../actions"
import { useToast } from "@/hooks/use-toast"

export default function NewArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    is_featured: false,
    tags: "",
    author: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطا",
          description: "حجم فایل نباید بیشتر از 5 مگابایت باشد",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "خطا",
          description: "فقط فایل‌های تصویری مجاز هستند",
          variant: "destructive",
        })
        return
      }

      setThumbnailFile(file)
      setThumbnailUrl("")

      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThumbnailUrlChange = (url: string) => {
    setThumbnailUrl(url)
    setThumbnailFile(null)
    setThumbnailPreview(url)
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailUrl("")
    setThumbnailPreview("")
  }

  const insertAtCursor = (textarea: HTMLTextAreaElement, text: string) => {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = formData.content
    const newContent = currentContent.substring(0, start) + text + currentContent.substring(end)

    handleInputChange("content", newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const formatText = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `<strong>${selectedText || "متن پررنگ"}</strong>`
        break
      case "italic":
        formattedText = `<em>${selectedText || "متن کج"}</em>`
        break
      case "h1":
        formattedText = `<h1>${selectedText || "عنوان اصلی"}</h1>`
        break
      case "h2":
        formattedText = `<h2>${selectedText || "عنوان فرعی"}</h2>`
        break
      case "h3":
        formattedText = `<h3>${selectedText || "عنوان کوچک"}</h3>`
        break
      case "p":
        formattedText = `<p>${selectedText || "پاراگراف"}</p>`
        break
      case "ul":
        formattedText = `<ul>\n  <li>${selectedText || "آیتم اول"}</li>\n  <li>آیتم دوم</li>\n</ul>`
        break
      case "ol":
        formattedText = `<ol>\n  <li>${selectedText || "آیتم اول"}</li>\n  <li>آیتم دوم</li>\n</ol>`
        break
      case "link":
        const url = prompt("آدرس لینک را وارد کنید:")
        if (url) {
          formattedText = `<a href="${url}" target="_blank">${selectedText || "متن لینک"}</a>`
        }
        break
      case "image":
        const imageUrl = prompt("آدرس تصویر را وارد کنید:")
        if (imageUrl) {
          formattedText = `<img src="${imageUrl}" alt="${selectedText || "توضیح تصویر"}" style="max-width: 100%; height: auto;" />`
        }
        break
      case "video":
        const videoUrl = prompt("آدرس ویدیو (YouTube یا Vimeo) را وارد کنید:")
        if (videoUrl) {
          let embedUrl = ""
          if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
            const videoId = videoUrl.includes("youtu.be")
              ? videoUrl.split("/").pop()?.split("?")[0]
              : videoUrl.split("v=")[1]?.split("&")[0]
            embedUrl = `https://www.youtube.com/embed/${videoId}`
          } else if (videoUrl.includes("vimeo.com")) {
            const videoId = videoUrl.split("/").pop()
            embedUrl = `https://player.vimeo.com/video/${videoId}`
          }

          if (embedUrl) {
            formattedText = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
              <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
            </div>`
          }
        }
        break
    }

    if (formattedText) {
      insertAtCursor(textarea, formattedText)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "خطا",
        description: "عنوان و محتوا الزامی است",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("content", formData.content)
      submitData.append("excerpt", formData.excerpt)
      submitData.append("status", formData.status)
      submitData.append("is_featured", formData.is_featured.toString())
      submitData.append("tags", formData.tags)
      submitData.append("author", formData.author)

      if (thumbnailFile) {
        // In a real app, you would upload the file to storage here
        // For now, we'll use a placeholder
        submitData.append("thumbnail_url", "/placeholder.svg")
      } else if (thumbnailUrl) {
        submitData.append("thumbnail_url", thumbnailUrl)
      }

      const result = await createArticle(submitData)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "مقاله با موفقیت ایجاد شد",
        })
        router.push("/admin/articles")
      }
    } catch (error) {
      console.error("Error creating article:", error)
      toast({
        title: "خطا",
        description: "خطا در ایجاد مقاله",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderPreview = () => {
    return (
      <div className="prose prose-lg max-w-none" style={{ direction: "rtl", textAlign: "right" }}>
        <h1>{formData.title || "عنوان مقاله"}</h1>
        {formData.excerpt && <p className="text-lg text-gray-600">{formData.excerpt}</p>}
        {thumbnailPreview && (
          <img
            src={thumbnailPreview || "/placeholder.svg"}
            alt="thumbnail"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: formData.content || "محتوای مقاله..." }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="ml-2 h-4 w-4" />
              بازگشت
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">مقاله جدید</h1>
            <p className="text-muted-foreground">ایجاد مقاله جدید</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="ml-2 h-4 w-4" />
            {isPreview ? "ویرایش" : "پیش‌نمایش"}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ذخیره
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>محتوای مقاله</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="عنوان مقاله را وارد کنید"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">خلاصه</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="خلاصه‌ای از مقاله..."
                    rows={3}
                  />
                </div>

                {!isPreview && (
                  <>
                    <div>
                      <Label>ابزار قالب‌بندی</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("bold")}>
                          <strong>B</strong>
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("italic")}>
                          <em>I</em>
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("h1")}>
                          H1
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("h2")}>
                          H2
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("h3")}>
                          H3
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("p")}>
                          P
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("ul")}>
                          لیست
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("ol")}>
                          شماره‌دار
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("link")}>
                          لینک
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("image")}>
                          تصویر
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => formatText("video")}>
                          ویدیو
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content">محتوا *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        placeholder="محتوای مقاله را وارد کنید..."
                        rows={15}
                        className="font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                {isPreview && (
                  <div>
                    <Label>پیش‌نمایش</Label>
                    <div className="border rounded-md p-4 bg-white min-h-[400px]">{renderPreview()}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات انتشار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange("is_featured", checked as boolean)}
                  />
                  <Label htmlFor="is_featured">مقاله ویژه</Label>
                </div>

                <div>
                  <Label htmlFor="author">نویسنده</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="نام نویسنده"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">برچسب‌ها</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    placeholder="برچسب‌ها را با کاما جدا کنید"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تصویر شاخص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {thumbnailPreview && (
                  <div className="relative">
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="thumbnail preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div>
                  <Label htmlFor="thumbnail-file">آپلود فایل</Label>
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">حداکثر 5 مگابایت - فرمت‌های JPG, PNG, GIF</p>
                </div>

                <div className="text-center text-muted-foreground">یا</div>

                <div>
                  <Label htmlFor="thumbnail-url">آدرس تصویر</Label>
                  <Input
                    id="thumbnail-url"
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => handleThumbnailUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
