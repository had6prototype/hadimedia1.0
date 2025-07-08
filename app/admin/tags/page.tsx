"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Tag, Hash, MoreHorizontal, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTags, createTag, updateTag, deleteTag } from "./actions"
import { useToast } from "@/components/ui/use-toast"

export default function AdminTagsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagDescription, setNewTagDescription] = useState("")
  const [newTagColor, setNewTagColor] = useState("#50bf9e")
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      const result = await getTags()

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.tags) {
        setTags(result.tags)
      }

      setIsLoading(false)
    }

    fetchTags()
  }, [toast])

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      const result = await createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim(),
        color: newTagColor,
      })

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "تگ با موفقیت ایجاد شد",
        })

        // Update local state
        if (result.tag) {
          setTags([...tags, { ...result.tag, usageCount: 0 }])
        }

        resetDialog()
      }
    }
  }

  const handleEditTag = (tag: any) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagDescription(tag.description || "")
    setNewTagColor(tag.color || "#50bf9e")
    setIsDialogOpen(true)
  }

  const handleUpdateTag = async () => {
    if (editingTag && newTagName.trim()) {
      const result = await updateTag(editingTag.id, {
        name: newTagName.trim(),
        description: newTagDescription.trim(),
        color: newTagColor,
      })

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "تگ با موفقیت بروزرسانی شد",
        })

        // Update local state
        if (result.tag) {
          setTags(
            tags.map((tag) =>
              tag.id === editingTag.id
                ? { ...tag, name: newTagName.trim(), description: newTagDescription.trim(), color: newTagColor }
                : tag,
            ),
          )
        }

        resetDialog()
      }
    }
  }

  const handleDeleteTag = async (tagId: number) => {
    if (confirm("آیا از حذف این تگ اطمینان دارید؟")) {
      const result = await deleteTag(tagId)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "تگ با موفقیت حذف شد",
        })

        // Update local state
        setTags(tags.filter((tag) => tag.id !== tagId))
      }
    }
  }

  const resetDialog = () => {
    setEditingTag(null)
    setNewTagName("")
    setNewTagDescription("")
    setNewTagColor("#50bf9e")
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت تگ‌ها</h1>
          <p className="text-muted-foreground">مدیریت تگ‌های برنامه‌ها و دسته‌بندی محتوا</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetDialog}>
              <Plus className="h-4 w-4 mr-2" />
              افزودن تگ جدید
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "ویرایش تگ" : "افزودن تگ جدید"}</DialogTitle>
              <DialogDescription>
                {editingTag ? "اطلاعات تگ را ویرایش کنید" : "تگ جدید برای دسته‌بندی برنامه‌ها ایجاد کنید"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">نام تگ</Label>
                <Input
                  id="tag-name"
                  placeholder="نام تگ را وارد کنید"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-description">توضیحات</Label>
                <Input
                  id="tag-description"
                  placeholder="توضیحات تگ را وارد کنید"
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-color">رنگ</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="tag-color"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="flex-1" />
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: newTagColor }}></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                انصراف
              </Button>
              <Button onClick={editingTag ? handleUpdateTag : handleCreateTag}>
                {editingTag ? "ویرایش" : "ایجاد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* آمار کلی */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل تگ‌ها</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تگ‌های فعال</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.filter((tag) => tag.usageCount > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پربازدیدترین</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.length > 0 ? Math.max(...tags.map((tag) => tag.usageCount)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {tags.length > 0
                ? tags.find((tag) => tag.usageCount === Math.max(...tags.map((t) => t.usageCount)))?.name
                : "بدون تگ"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">میانگین استفاده</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.length > 0 ? Math.round(tags.reduce((sum, tag) => sum + tag.usageCount, 0) / tags.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جستجو */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در تگ‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* جدول تگ‌ها */}
      <Card>
        <CardHeader>
          <CardTitle>لیست تگ‌ها ({filteredTags.length})</CardTitle>
          <CardDescription>مدیریت و ویرایش تگ‌های موجود</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2">در حال بارگذاری...</span>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">هیچ تگی یافت نشد</p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  پاک کردن جستجو
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام تگ</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>تعداد استفاده</TableHead>
                    <TableHead>تاریخ ایجاد</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                          <Badge variant="outline">{tag.name}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{tag.description || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tag.usageCount}</span>
                          <span className="text-xs text-muted-foreground">برنامه</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(tag.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                              <Edit className="mr-2 h-4 w-4" />
                              ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={tag.usageCount > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
