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
import { Plus, Edit, Trash2, ImageIcon, LinkIcon, Eye, EyeOff } from "lucide-react"
import { getAhkamCards, createAhkamCard, updateAhkamCard, deleteAhkamCard, type AhkamCard } from "./actions"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AhkamCardsPage() {
  const [cards, setCards] = useState<AhkamCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<AhkamCard | null>(null)
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
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setIsLoading(true)
    const result = await getAhkamCards()
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setCards(result.data || [])
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCard) {
      const result = await updateAhkamCard(editingCard.id, formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "کارت احکام با موفقیت به‌روزرسانی شد",
        })
        fetchCards()
        resetForm()
      }
    } else {
      const result = await createAhkamCard(formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "کارت احکام جدید با موفقیت ایجاد شد",
        })
        fetchCards()
        resetForm()
      }
    }
  }

  const handleEdit = (card: AhkamCard) => {
    setEditingCard(card)
    setFormData({
      title: card.title,
      description: card.description || "",
      image_url: card.image_url || "",
      link_url: card.link_url || "",
      display_order: card.display_order,
      is_active: card.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    const result = await deleteAhkamCard(id)
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "موفقیت",
        description: "کارت احکام با موفقیت حذف شد",
      })
      fetchCards()
    }
  }

  const toggleActive = async (card: AhkamCard) => {
    const result = await updateAhkamCard(card.id, { is_active: !card.is_active })
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      fetchCards()
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
    setEditingCard(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت احکام آیت الله سیستانی</h1>
          <p className="text-muted-foreground">مدیریت کارت‌های بخش احکام در صفحه اصلی</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="ml-2 h-4 w-4" />
              کارت جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCard ? "ویرایش کارت احکام" : "کارت احکام جدید"}</DialogTitle>
              <DialogDescription>
                {editingCard ? "اطلاعات کارت احکام را ویرایش کنید" : "اطلاعات کارت احکام جدید را وارد کنید"}
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
                    placeholder="عنوان کارت احکام"
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
                  placeholder="توضیحات کارت احکام"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">آدرس تصویر</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/ahkam-card.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">لینک</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/ahkam/topic"
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
                <Button type="submit">{editingCard ? "به‌روزرسانی" : "ایجاد"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>کارت‌های احکام آیت الله سیستانی</CardTitle>
          <CardDescription>مدیریت کارت‌های نمایش داده شده در بخش احکام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <Card key={card.id} className={`relative ${!card.is_active ? "opacity-50" : ""}`}>
                  <CardHeader className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      {card.image_url ? (
                        <Image
                          src={card.image_url || "/placeholder.svg"}
                          alt={card.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={card.is_active ? "default" : "secondary"}>
                          {card.is_active ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline">{card.display_order}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-sm mb-2 line-clamp-1">{card.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mb-3">
                      {card.description || "بدون توضیحات"}
                    </CardDescription>
                    {card.link_url && (
                      <div className="flex items-center gap-1 text-blue-600 mb-3">
                        <LinkIcon className="h-3 w-3" />
                        <span className="text-xs truncate">{card.link_url}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(card)}>
                        {card.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(card)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف کارت احکام</AlertDialogTitle>
                            <AlertDialogDescription>
                              آیا مطمئن هستید که می‌خواهید این کارت احکام را حذف کنید؟ این عمل قابل بازگشت نیست.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(card.id)}>حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
