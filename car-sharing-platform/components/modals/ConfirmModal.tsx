"use client"

import { AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600"
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "info":
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            variant === "danger" ? "bg-red-100 dark:bg-red-900/30" :
            variant === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
            "bg-blue-100 dark:bg-blue-900/30"
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === "danger" ? "text-red-600 dark:text-red-400" :
              variant === "warning" ? "text-yellow-600 dark:text-yellow-400" :
              "text-blue-600 dark:text-blue-400"
            }`} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition ${getVariantStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
