"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, type, message }])

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
        return <XCircle className="w-5 h-5" />
      case "warning":
        return <AlertCircle className="w-5 h-5" />
      case "info":
        return <Info className="w-5 h-5" />
    }
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in ${getToastStyles(
              toast.type
            )}`}
          >
            {getToastIcon(toast.type)}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-70 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
