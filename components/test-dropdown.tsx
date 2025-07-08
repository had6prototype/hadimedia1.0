"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

export function TestDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>عملیات تست</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => alert("مشاهده کلیک شد")}>
          <Eye className="mr-2 h-4 w-4" />
          مشاهده
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert("ویرایش کلیک شد")}>
          <Edit className="mr-2 h-4 w-4" />
          ویرایش
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={() => alert("حذف کلیک شد")}>
          <Trash2 className="mr-2 h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
