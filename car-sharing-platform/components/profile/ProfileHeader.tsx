"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User as UserIcon, Calendar, Edit } from "lucide-react"
import { User } from "@/types"

interface ProfileHeaderProps {
  user: User & {
    createdAt: Date
  }
  isOwnProfile: boolean
  isFollowing: boolean
  postsCount: number
  followersCount: number
  followingCount: number
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  postsCount,
  followersCount: initialFollowersCount,
  followingCount,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowToggle = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1)
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
            {user.name?.[0] || user.email[0]}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
              <p className="text-gray-500">@{user.username || user.email.split("@")[0]}</p>
            </div>

            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                  isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <p className="font-bold text-xl">{postsCount}</p>
              <p className="text-gray-500 text-sm">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">{followersCount}</p>
              <p className="text-gray-500 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">{followingCount}</p>
              <p className="text-gray-500 text-sm">Following</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-4">{user.bio}</p>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
