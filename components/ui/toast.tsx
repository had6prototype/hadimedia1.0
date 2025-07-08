"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useToast, type ToastProps } from "./use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex flex-col gap-2 p-4 max-h-screen w-full sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse sm:items-end sm:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({
  id,
  title,
  description,
  variant = "default",
  open,
  onDismiss,
}: ToastProps & {
  id: string
  open: boolean
  onDismiss: () => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(open)
    }, 10)

    return () => clearTimeout(timer)
  }, [open])

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        variant === "default" ? "bg-background text-foreground" : "",
        variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
      )}
    >
      <div className="grid gap-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
