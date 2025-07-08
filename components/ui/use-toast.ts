"use client"

// Adapted from shadcn/ui toast
import { useState, useCallback } from "react"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  open: boolean
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

// Simple hook for toast notifications
export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      open: true,
      duration: 5000,
      variant: "default",
      ...props,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss
    if (newToast.duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.map((toast) => (toast.id === id ? { ...toast, open: false } : toast)))

    // Remove from state after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}
