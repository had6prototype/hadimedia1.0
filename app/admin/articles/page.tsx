"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, Star, StarOff, Loader2 } from "lucide-react"
import { getArticles, deleteArticle, toggleArticleFeatured, type Article } from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const result = await getArticles()
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setArticles(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching articles:", error)
      toast({
        title: "خطا",
        description: "خطا در دریافت مقالات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return

    try {
      const result = await deleteArticle(articleToDelete.id)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "مقاله با موفقیت حذف شد",
        })
        fetchArticles()
      }
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({
        title: "خطا",
        description: "خطا در حذف مقاله",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  const handleToggleFeatured = async (article: Article) => {
    try {
      const result = await toggleArticleFeatured(article.id)
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: `مقاله ${article.is_featured ? "از حالت ویژه خارج شد" : "به حالت ویژه درآمد"}`,
        })
        fetchArticles()
      }
    } catch (error) {
      console.error("Error toggling featured:", error)
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت ویژه",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">منتشر شده</Badge>
      case "draft":
        return <Badge variant="secondary">پیش‌نویس</Badge>
      case "archived":
        return <Badge variant="outline">آرشیو شده</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">در حال بارگذاری مقالات...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت مقالات</h1>
          <p className="text-muted-foreground">مدیریت و ویرایش مقالات سایت</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="ml-2 h-4 w-4" />
            مقاله جدید
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست مقالات</CardTitle>
          <CardDescription>{articles.length} مقاله یافت شد</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">هیچ مقاله‌ای یافت نشد</p>
              <Button asChild className="mt-4">
                <Link href="/admin/articles/new">
                  <Plus className="ml-2 h-4 w-4" />
                  اولین مقاله را ایجاد کنید
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تصویر</TableHead>
                  <TableHead>عنوان</TableHead>
                  <TableHead>نویسنده</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>بازدید</TableHead>
                  <TableHead>تاریخ ایجاد</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      {article.thumbnail_url ? (
                        <img
                          src={article.thumbnail_url || "/placeholder.svg"}
                          alt={article.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">بدون تصویر</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{article.title}</span>
                        {article.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                      )}
                    </TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>{getStatusBadge(article.status)}</TableCell>
                    <TableCell>{article.views.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(article.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/articles/${article.id}`}>
                              <Eye className="ml-2 h-4 w-4" />
                              مشاهده
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/articles/${article.id}/edit`}>
                              <Edit className="ml-2 h-4 w-4" />
                              ویرایش
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(article)}>
                            {article.is_featured ? (
                              <>
                                <StarOff className="ml-2 h-4 w-4" />
                                حذف از ویژه
                              </>
                            ) : (
                              <>
                                <Star className="ml-2 h-4 w-4" />
                                افزودن به ویژه
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setArticleToDelete(article)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف مقاله</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف مقاله "{articleToDelete?.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
