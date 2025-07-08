"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Scroll } from "lucide-react"
import {
  getNewsTickerItems,
  createNewsTickerItem,
  updateNewsTickerItem,
  deleteNewsTickerItem,
  type NewsTickerItem,
} from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function NewsTickerPage() {
  const [items, setItems] = useState<NewsTickerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsTickerItem | null>(null)
  const [formData, setFormData] = useState({
    text: "",
    display_order: 0,
    is_active: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    const result = await getNewsTickerItems()
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setItems(result.data || [])
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      const result = await updateNewsTickerItem(editingItem.id, formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "خبر با موفقیت به‌روزرسانی شد",
        })
        fetchItems()
        resetForm()
      }
    } else {
      const result = await createNewsTickerItem(formData)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "خبر جدید با موفقیت ایجاد شد",
        })
        fetchItems()
        resetForm()
      }
    }
  }

  const handleEdit = (item: NewsTickerItem) => {
    setEditingItem(item)
    setFormData({
      text: item.text,
      display_order: item.display_order,
      is_active: item.is_active,
    })
    setIsDialogOpen(true)
  }

  const toggleActive = async (item: NewsTickerItem) => {
    const result = await updateNewsTickerItem(item.id, { is_active: !item.is_active })
    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      fetchItems()
    }
  }

  const resetForm = () => {
    setFormData({
      text: "",
      display_order: 0,
      is_active: true,
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت نوار اخبار</h1>
          <p className="text-muted-foreground">مدیریت متن‌های نوار اخبار احکام آیت الله سیستانی</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="ml-2 h-4 w-4" />
              خبر جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "ویرایش خبر" : "خبر جدید"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "متن خبر را ویرایش کنید" : "متن خبر جدید را وارد کنید"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">متن خبر *</Label>
                <Input
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="احکام آیت الله سیستانی: ..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">فعال</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  انصراف
                </Button>
                <Button type="submit">{editingItem ? "به‌روزرسانی" : "ایجاد"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            پیش‌نمایش نوار اخبار
          </CardTitle>
          <CardDescription>نمایش نوار اخبار همانطور که در سایت ظاهر می‌شود</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 border-y border-primary/30 py-3 overflow-hidden text-foreground rounded-md">
            <div className="relative">
              <div className="flex items-center">
                <div className="font-bold ml-4 bg-secondary text-white px-3 py-1 rounded whitespace-nowrap">
                  احکام آیت الله سیستانی
                </div>
                <div className="overflow-hidden flex-1 relative">
                  <div className="inline-block whitespace-nowrap text-right font-medium text-lg animate-pulse">
                    {items
                      .filter((item) => item.is_active)
                      .map((item) => item.text)
                      .join(" • ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اخبار نوار</CardTitle>
          <CardDescription>لیست تمام اخبار نوار احکام</CardDescription>
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
                  <TableHead>متن</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        {item.display_order}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{item.text}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(item)}
                          title={item.is_active ? "غیرفعال کردن" : "فعال کردن"}
                        >
                          {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
                              <AlertDialogTitle>حذف خبر</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا مطمئن هستید که می‌خواهید این خبر را حذف کنید؟ این عمل قابل بازگشت نیست.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  const result = await deleteNewsTickerItem(item.id)
                                  if (result.error) {
                                    toast({
                                      title: "خطا",
                                      description: result.error,
                                      variant: "destructive",
                                    })
                                  } else {
                                    toast({
                                      title: "موفقیت",
                                      description: "خبر با موفقیت حذف شد",
                                    })
                                    await fetchItems()
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
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
