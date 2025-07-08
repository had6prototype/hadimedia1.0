"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Eye, MoreVertical, Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { getPrograms, deleteProgram } from "./actions"
import { deleteAllPrograms } from "./clear-all-action"
import { useToast } from "@/components/ui/use-toast"

export default function ProgramsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [programs, setPrograms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [programToDelete, setProgramToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  useEffect(() => {
    const loadPrograms = async () => {
      setIsLoading(true)
      const result = await getPrograms()
      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setPrograms(result.programs || [])
      }
      setIsLoading(false)
    }

    loadPrograms()
  }, [toast])

  const handleDeleteClick = (program) => {
    setProgramToDelete(program)
  }

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return

    setIsDeleting(true)
    const result = await deleteProgram(programToDelete.id)

    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "موفقیت",
        description: "برنامه با موفقیت حذف شد",
      })
      setPrograms(programs.filter((p) => p.id !== programToDelete.id))
    }

    setProgramToDelete(null)
    setIsDeleting(false)
  }

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true)
    const result = await deleteAllPrograms()

    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "موفقیت",
        description: "تمام برنامه‌ها با موفقیت حذف شدند",
      })
      setPrograms([])
    }

    setShowDeleteAllDialog(false)
    setIsDeletingAll(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">منتشر شده</Badge>
      case "draft":
        return <Badge variant="outline">پیش‌نویس</Badge>
      case "archived":
        return <Badge variant="secondary">آرشیو شده</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت برنامه‌ها</h1>
          <p className="text-muted-foreground">مدیریت برنامه‌های ویدیویی سایت</p>
        </div>
        <div className="flex gap-2">
          {programs.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteAllDialog(true)}>
              <Trash2 className="h-4 w-4 ml-2" />
              حذف همه
            </Button>
          )}
          <Button onClick={() => router.push("/admin/programs/new")}>
            <Plus className="h-4 w-4 ml-2" />
            افزودن برنامه
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>برنامه‌های ویدیویی</CardTitle>
          <CardDescription>لیست تمام برنامه‌های ویدیویی سایت</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2">در حال بارگذاری...</span>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">هیچ برنامه‌ای یافت نشد</p>
              <Button onClick={() => router.push("/admin/programs/new")}>
                <Plus className="h-4 w-4 ml-2" />
                افزودن برنامه جدید
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>عنوان</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تگ‌ها</TableHead>
                    <TableHead>مدت زمان</TableHead>
                    <TableHead>ترتیب</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{getStatusBadge(program.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {program.tags && program.tags.length > 0 ? (
                            program.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">بدون تگ</span>
                          )}
                          {program.tags && program.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{program.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{program.duration || "نامشخص"}</TableCell>
                      <TableCell>{program.order}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link href={`/programs/${program.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="h-4 w-4 ml-2" />
                                  مشاهده
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/programs/edit/${program.id}`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  ویرایش
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => handleDeleteClick(program)}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!programToDelete} onOpenChange={() => !isDeleting && setProgramToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این برنامه اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. برنامه "{programToDelete?.title}" به طور کامل حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={() => !isDeletingAll && setShowDeleteAllDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف تمام برنامه‌ها اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. تمام برنامه‌ها و داده‌های مرتبط با آن‌ها به طور کامل حذف خواهند شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAll}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteAllConfirm()
              }}
              disabled={isDeletingAll}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingAll ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف همه
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
