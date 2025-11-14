"use client"

import { useEffect, useState } from "react"
import { Plus, User as UserIcon } from "lucide-react"
import Link from "next/link"

interface StoryGroup {
  user: {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
  }
  stories: {
    id: string
    imageUrl: string
    createdAt: string
  }[]
}

export default function StoryCircles({ currentUserId }: { currentUserId?: string }) {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

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

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim() || creating) return

    setCreating(true)
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        setImageUrl("")
        setShowCreateModal(false)
        await fetchStories()
      }
    } catch (error) {
      console.error("Failed to create story:", error)
    } finally {
      setCreating(false)
    }
  }

  const hasOwnStory = storyGroups.some((group) => group.user.id === currentUserId)

  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Add story button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                hasOwnStory
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-200"
              } relative`}
            >
              {hasOwnStory ? (
                <UserIcon className="w-8 h-8 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <p className="text-xs font-medium">
              {hasOwnStory ? "Your Story" : "Add Story"}
            </p>
          </button>

          {/* Story circles */}
          {storyGroups.map((group) => (
            <Link
              key={group.user.id}
              href={`/stories/${group.user.id}`}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  {group.user.image ? (
                    <img
                      src={group.user.image}
                      alt={group.user.name || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {group.user.name?.[0] || group.user.email[0]}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs font-medium truncate w-16 text-center">
                {group.user.name?.split(" ")[0] || group.user.username}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create Story</h2>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Story will expire in 24 hours
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !imageUrl.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
