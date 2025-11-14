"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Bookmark } from "lucide-react"
import { Post } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: Post
  currentUserId?: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => like.userId === currentUserId) || false
  )
  const [likesCount, setLikesCount] = useState(post._count?.likes || post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/profile/${post.user.username}`} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {post.user.name?.[0] || post.user.email[0]}
          </div>
          <div>
            <p className="font-semibold text-sm">{post.user.name || post.user.username}</p>
            <p className="text-xs text-gray-500">
              {post.carYear} {post.carBrand} {post.carModel}
            </p>
          </div>
        </Link>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={post.images[0]}
            alt={`${post.carBrand} ${post.carModel}`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`transition ${isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-700 hover:text-blue-500 transition"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
          <button className="text-gray-700 hover:text-blue-500 transition">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes count */}
        <p className="font-semibold text-sm">{likesCount} likes</p>

        {/* Caption */}
        <div>
          <p className="text-sm">
            <Link href={`/profile/${post.user.username}`} className="font-semibold mr-2">
              {post.user.name || post.user.username}
            </Link>
            {post.description}
          </p>
          {post.hashtags && post.hashtags.length > 0 && (
            <p className="text-sm text-blue-500 mt-1">
              {post.hashtags.map((tag) => `#${tag}`).join(" ")}
            </p>
          )}
        </div>

        {/* Comments count */}
        {(post._count?.comments || post.comments?.length || 0) > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View all {post._count?.comments || post.comments?.length} comments
          </button>
        )}

        {/* Time */}
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}
