"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, ImageIcon, LinkIcon, Eye, EyeOff, GripVertical } from "lucide-react"
import { getAhkamSlides, createAhkamSlide, updateAhkamSlide, deleteAhkamSlide, type AhkamSlide } from "./actions"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AhkamSliderPage() {
  const [slides, setSlides] = useState<AhkamSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<AhkamSlide | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    display_order: 0,
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    setIsLoading(true)
    const result = await getAhkamSlides()
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setSlides(result.data || [])
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSlide) {
      const result = await updateAhkamSlide(editingSlide.id, formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "اسلاید با موفقیت به‌روزرسانی شد",
        })
        fetchSlides()
        resetForm()
      }
    } else {
      const result = await createAhkamSlide(formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "اسلاید جدید با موفقیت ایجاد شد",
        })
        fetchSlides()
        resetForm()
      }
    }
  }

  const handleEdit = (slide: AhkamSlide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      description: slide.description || "",
      image_url: slide.image_url || "",
      link_url: slide.link_url || "",
      display_order: slide.display_order,
      is_active: slide.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    const result = await deleteAhkamSlide(id)
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "موفقیت",
        description: "اسلاید با موفقیت حذف شد",
      })
      fetchSlides()
    }
  }

  const toggleActive = async (slide: AhkamSlide) => {
    const result = await updateAhkamSlide(slide.id, { is_active: !slide.is_active })
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      fetchSlides()
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      display_order: 0,
      is_active: true,
    })
    setEditingSlide(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت اسلایدر احکام</h1>
          <p className="text-muted-foreground">مدیریت اسلایدهای بخش احکام در صفحه اصلی</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="ml-2 h-4 w-4" />
              اسلاید جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "ویرایش اسلاید" : "اسلاید جدید"}</DialogTitle>
              <DialogDescription>
                {editingSlide ? "اطلاعات اسلاید را ویرایش کنید" : "اطلاعات اسلاید جدید را وارد کنید"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="عنوان اسلاید"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">ترتیب نمایش</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات اسلاید"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">آدرس تصویر</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/slide.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">لینک</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/programs/1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">فعال</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  انصراف
                </Button>
                <Button type="submit">{editingSlide ? "به‌روزرسانی" : "ایجاد"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اسلایدهای احکام</CardTitle>
          <CardDescription>لیست تمام اسلایدهای بخش احکام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ترتیب</TableHead>
                  <TableHead>تصویر</TableHead>
                  <TableHead>عنوان</TableHead>
                  <TableHead>توضیحات</TableHead>
                  <TableHead>لینک</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        {slide.display_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      {slide.image_url ? (
                        <div className="relative w-16 h-12 rounded overflow-hidden">
                          <Image
                            src={slide.image_url || "/placeholder.svg"}
                            alt={slide.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{slide.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{slide.description || "—"}</TableCell>
                    <TableCell>
                      {slide.link_url ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <LinkIcon className="h-3 w-3" />
                          <span className="text-xs truncate max-w-20">{slide.link_url}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={slide.is_active ? "default" : "secondary"}>
                        {slide.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(slide)}
                          title={slide.is_active ? "غیرفعال کردن" : "فعال کردن"}
                        >
                          {slide.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(slide)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف اسلاید</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا مطمئن هستید که می‌خواهید این اسلاید را حذف کنید؟ این عمل قابل بازگشت نیست.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(slide.id)}>حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
