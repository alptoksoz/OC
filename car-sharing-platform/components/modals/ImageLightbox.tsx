"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && onPrevious) onPrevious()
      if (e.key === "ArrowRight" && onNext) onNext()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose, onNext, onPrevious])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition backdrop-blur-sm z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm z-10">
          <p className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      )}

      {/* Previous Button */}
      {images.length > 1 && currentIndex > 0 && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition backdrop-blur-sm z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && currentIndex < images.length - 1 && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition backdrop-blur-sm z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[currentIndex]}
        alt="Full screen"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
