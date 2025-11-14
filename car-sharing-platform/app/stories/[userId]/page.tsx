"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Story {
  id: string
  imageUrl: string
  createdAt: string
}

interface StoryGroup {
  user: {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
  }
  stories: Story[]
}

export default function StoryViewerPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    if (storyGroups.length > 0) {
      const targetIndex = storyGroups.findIndex((g) => g.user.id === params.userId)
      if (targetIndex !== -1) {
        setCurrentGroupIndex(targetIndex)
      }
    }
  }, [storyGroups, params.userId])

  useEffect(() => {
    if (!isPaused && storyGroups.length > 0) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory()
            return 0
          }
          return prev + 2
        })
      }, 100)

      return () => clearInterval(timer)
    }
  }, [currentGroupIndex, currentStoryIndex, isPaused, storyGroups])

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories")
      if (response.ok) {
        const data = await response.json()
        setStoryGroups(data)
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error)
    }
  }

  const nextStory = () => {
    const currentGroup = storyGroups[currentGroupIndex]
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else {
      nextGroup()
    }
  }

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    } else {
      previousGroup()
    }
  }

  const nextGroup = () => {
    if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      router.push("/")
    }
  }

  const previousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    }
  }

  if (storyGroups.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white">Loading stories...</p>
      </div>
    )
  }

  const currentGroup = storyGroups[currentGroupIndex]
  const currentStory = currentGroup?.stories[currentStoryIndex]

  if (!currentGroup || !currentStory) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {currentGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              {currentGroup.user.image ? (
                <img
                  src={currentGroup.user.image}
                  alt={currentGroup.user.name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {currentGroup.user.name?.[0] || currentGroup.user.email[0]}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {currentGroup.user.name || currentGroup.user.username}
            </p>
            <p className="text-white/70 text-xs">
              {new Date(currentStory.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Story Image */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <img
          src={currentStory.imageUrl}
          alt="Story"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex">
        <button
          onClick={previousStory}
          className="flex-1 flex items-center justify-start px-4 hover:bg-gradient-to-r hover:from-black/20 hover:to-transparent transition"
        >
          {currentStoryIndex > 0 || currentGroupIndex > 0 ? (
            <ChevronLeft className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
          ) : null}
        </button>
        <button
          onClick={nextStory}
          className="flex-1 flex items-center justify-end px-4 hover:bg-gradient-to-l hover:from-black/20 hover:to-transparent transition"
        >
          <ChevronRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  )
}
